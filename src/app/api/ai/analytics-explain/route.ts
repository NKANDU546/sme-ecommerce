import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  getAnalyticsBreakdowns,
  getAnalyticsSummary,
  getAnalyticsTimeseries,
} from "@/apis/analytics";
import { buildAnalyticsExplainContext } from "@/lib/ai-analytics-context";
import { previousRange, rangeForPreset } from "@/lib/analytics-range";
import { DASHBOARD_NAV_IDS } from "@/lib/dashboard-nav";
import type {
  AiAnalyticsExplainRequest,
  AiAnalyticsExplainResult,
  AiAnalyticsSuggestedAction,
} from "@/types/ai";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "gpt-4o-mini";
const DISCLAIMER =
  "Based only on your analytics for this range. Not financial advice.";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type ExplainJson = {
  headline?: unknown;
  diagnosis?: unknown;
  wins?: unknown;
  watchouts?: unknown;
  bullets?: unknown;
  suggestedActions?: unknown;
};

function badRequest(code: string, message: string) {
  return NextResponse.json({ ok: false, code, message }, { status: 400 });
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function asStringList(raw: unknown, max: number): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((b) => asString(b))
    .filter(Boolean)
    .slice(0, max);
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim() || null;
}

function parseIsoOrNull(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  const v = value.trim();
  return ISO_DATE.test(v) ? v : null;
}

function normalizeActions(raw: unknown): AiAnalyticsSuggestedAction[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set<string>(DASHBOARD_NAV_IDS);
  const out: AiAnalyticsSuggestedAction[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const label = asString((item as { label?: unknown }).label);
    const section = asString((item as { section?: unknown }).section);
    const reason = asString((item as { reason?: unknown }).reason) || undefined;
    if (!label || !allowed.has(section)) continue;
    out.push({ label, section, reason });
    if (out.length >= 4) break;
  }
  return out;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        code: "AI_NOT_CONFIGURED",
        message: "OpenAI is not configured. Add OPENAI_API_KEY to the server env.",
      },
      { status: 503 },
    );
  }

  const accessToken = bearerToken(request);
  if (!accessToken) {
    return NextResponse.json(
      { ok: false, code: "UNAUTHORIZED", message: "Sign in required." },
      { status: 401 },
    );
  }

  let body: AiAnalyticsExplainRequest;
  try {
    body = (await request.json()) as AiAnalyticsExplainRequest;
  } catch {
    return badRequest("AI_INVALID_INPUT", "Request body must be JSON.");
  }

  const workspaceId = body.workspaceId?.trim() ?? "";
  if (!workspaceId) {
    return badRequest("AI_INVALID_INPUT", "workspaceId is required.");
  }

  const defaults = rangeForPreset(30);
  const from = parseIsoOrNull(body.from) ?? defaults.from;
  const to = parseIsoOrNull(body.to) ?? defaults.to;
  if (from > to) {
    return badRequest(
      "INVALID_ANALYTICS_QUERY",
      "from must be on or before to.",
    );
  }

  const range = { from, to };
  const prior = previousRange(from, to);

  const [summaryResult, breakdownsResult, priorResult, timeseriesResult] =
    await Promise.all([
      getAnalyticsSummary(workspaceId, accessToken, range),
      getAnalyticsBreakdowns(workspaceId, accessToken, range),
      prior
        ? getAnalyticsSummary(workspaceId, accessToken, prior)
        : Promise.resolve(null),
      getAnalyticsTimeseries(workspaceId, accessToken, range),
    ]);

  if (!summaryResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        code: summaryResult.errorCode ?? "AI_PROVIDER_ERROR",
        message: summaryResult.errorMessage,
      },
      { status: summaryResult.status || 502 },
    );
  }

  const summary = summaryResult.data;
  const breakdowns = breakdownsResult.ok ? breakdownsResult.data : null;
  const priorSummary =
    priorResult && priorResult.ok ? priorResult.data : null;
  const timeseriesPoints = timeseriesResult.ok
    ? timeseriesResult.data.points
    : null;

  const context = buildAnalyticsExplainContext({
    from,
    to,
    priorRange: prior,
    summary,
    priorSummary,
    breakdowns,
    timeseriesPoints,
  });

  const system = [
    "You are an operations coach for a South African SME online shop owner.",
    "They can ALREADY see revenue, orders, AOV, and charts on the dashboard.",
    "Your job is NOT to repeat those numbers. Your job is diagnosis + decisions.",
    "",
    "Hard rules:",
    "- Use ONLY facts in the JSON (especially derived.*). Never invent metrics.",
    "- If a derived field is null, skip that angle — do not guess.",
    "- Money values are major units (125.5 with currency ZAR ≈ R125.50).",
    "- Prefer % changes, shares, leaks, and concentration over absolute restatements.",
    "- Each win/watchout must include a SO-WHAT (what to do or why it matters).",
    "- Forbidden openings: \"Your revenue was…\", \"You had X paid orders…\", \"AOV is…\" alone.",
    "- Write clear practical English for a non-analyst owner.",
    "",
    "Analyse these angles when data exists:",
    "1) Momentum vs prior period (up/down and what it implies).",
    "2) Checkout leak (unpaid/initialized/failed vs paid).",
    "3) Revenue concentration (top SKU / top 3 / category dependency risk).",
    "4) Stock pressure blocking sales (out-of-stock / low-stock).",
    "5) Intra-period trend (recent half vs early half, peak day meaning).",
    "6) If almost no sales: say what to check first (catalogue, payments, publish).",
    "",
    "Return ONLY valid JSON with keys:",
    "headline, diagnosis, wins, watchouts, suggestedActions.",
    "headline: ≤120 chars — the main story (diagnosis), not a KPI list.",
    "diagnosis: 1–2 sentences tying the period together.",
    "wins: 0–3 strings — what’s working + why it matters.",
    "watchouts: 1–4 strings — risks/leaks/gaps + concrete next move.",
    "suggestedActions: 2–4 objects {label, section, reason}.",
    "label = short verb phrase (e.g. \"Restock sold-out SKUs\").",
    "reason = one short clause why.",
    `section must be one of: ${DASHBOARD_NAV_IDS.join(", ")}.`,
  ].join("\n");

  const userContent = [
    "Coach the merchant from this derived analytics context.",
    "Do not narrate the dashboard. Tell them what to pay attention to and what to do next.",
    JSON.stringify(context),
  ].join("\n\n");

  const client = new OpenAI({ apiKey });
  let rawContent: string | null = null;
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.45,
      max_tokens: 750,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
    });
    rawContent = completion.choices[0]?.message?.content ?? null;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "OpenAI request failed.";
    return NextResponse.json(
      { ok: false, code: "AI_PROVIDER_ERROR", message },
      { status: 502 },
    );
  }

  if (!rawContent) {
    return NextResponse.json(
      {
        ok: false,
        code: "AI_PROVIDER_ERROR",
        message: "Empty response from OpenAI.",
      },
      { status: 502 },
    );
  }

  let parsed: ExplainJson;
  try {
    parsed = JSON.parse(rawContent) as ExplainJson;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: "AI_PROVIDER_ERROR",
        message: "OpenAI returned invalid JSON.",
      },
      { status: 502 },
    );
  }

  const headline = asString(parsed.headline).slice(0, 140);
  const diagnosis = asString(parsed.diagnosis).slice(0, 400);
  const wins = asStringList(parsed.wins, 3);
  const watchouts = asStringList(parsed.watchouts, 4);
  const legacyBullets = asStringList(parsed.bullets, 6);
  const bullets =
    wins.length || watchouts.length
      ? [...wins, ...watchouts].slice(0, 6)
      : legacyBullets;

  if (!headline || (bullets.length < 1 && !diagnosis)) {
    return NextResponse.json(
      {
        ok: false,
        code: "AI_PROVIDER_ERROR",
        message: "AI explanation was incomplete. Try again.",
      },
      { status: 502 },
    );
  }

  const data: AiAnalyticsExplainResult = {
    from,
    to,
    headline,
    diagnosis:
      diagnosis ||
      "Review the points below — focus on actions, not just the totals on the cards.",
    wins,
    watchouts: watchouts.length ? watchouts : bullets.filter((b) => !wins.includes(b)),
    bullets,
    suggestedActions: normalizeActions(parsed.suggestedActions),
    model: MODEL,
    disclaimer: DISCLAIMER,
  };

  return NextResponse.json({ ok: true, data });
}
