import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  getAnalyticsBreakdowns,
  getAnalyticsSummary,
} from "@/apis/analytics";
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
  bullets?: unknown;
  suggestedActions?: unknown;
};

function badRequest(code: string, message: string) {
  return NextResponse.json({ ok: false, code, message }, { status: 400 });
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
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
    if (!label || !allowed.has(section)) continue;
    out.push({ label, section });
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

  const [summaryResult, breakdownsResult, priorResult] = await Promise.all([
    getAnalyticsSummary(workspaceId, accessToken, range),
    getAnalyticsBreakdowns(workspaceId, accessToken, range),
    prior
      ? getAnalyticsSummary(workspaceId, accessToken, prior)
      : Promise.resolve(null),
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

  const metricsPayload = {
    range: { from, to },
    priorRange: prior,
    summary,
    priorSummary,
    breakdowns: breakdowns
      ? {
          ordersByStatus: breakdowns.ordersByStatus,
          ordersByPaymentStatus: breakdowns.ordersByPaymentStatus,
          topProducts: breakdowns.topProducts.slice(0, 5),
          revenueByCategory: breakdowns.revenueByCategory.slice(0, 5),
        }
      : null,
  };

  const system = [
    "You explain merchant store analytics for a South African SME dashboard.",
    "Use ONLY numbers present in the provided JSON. Never invent metrics.",
    "If a value is missing, say you do not know — do not guess.",
    "Money is already in major units (e.g. 125.5 means R125.50 when currency is ZAR).",
    "Write clear, practical English for a non-analyst shop owner.",
    "Return ONLY valid JSON with keys: headline, bullets, suggestedActions.",
    "headline: max ~120 characters.",
    "bullets: 3 to 6 short insight strings grounded in the JSON.",
    "suggestedActions: 0 to 3 objects {label, section}.",
    `section must be one of: ${DASHBOARD_NAV_IDS.join(", ")}.`,
  ].join(" ");

  const client = new OpenAI({ apiKey });
  let rawContent: string | null = null;
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `Explain this analytics JSON for the merchant:\n${JSON.stringify(metricsPayload)}`,
        },
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
  const bullets = Array.isArray(parsed.bullets)
    ? parsed.bullets
        .map((b) => asString(b))
        .filter(Boolean)
        .slice(0, 6)
    : [];

  if (!headline || bullets.length < 2) {
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
    bullets,
    suggestedActions: normalizeActions(parsed.suggestedActions),
    model: MODEL,
    disclaimer: DISCLAIMER,
  };

  return NextResponse.json({ ok: true, data });
}
