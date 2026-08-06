import { NextResponse } from "next/server";
import OpenAI from "openai";
import type {
  AiProductDraftRequest,
  AiProductDraftResult,
} from "@/types/ai";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "gpt-4o-mini";
const DISCLAIMER = "Review before saving. AI can be wrong.";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type DraftJson = {
  title?: unknown;
  summary?: unknown;
  suggestedCategoryName?: unknown;
  skuSuggestion?: unknown;
};

function asNonEmptyString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function asNullableString(value: unknown): string | null {
  const s = asNonEmptyString(value);
  return s.length > 0 ? s : null;
}

function badRequest(code: string, message: string) {
  return NextResponse.json({ ok: false, code, message }, { status: 400 });
}

/** Detect OpenAI-supported image mime from magic bytes (more reliable than URL/headers). */
function detectImageMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  // HEIC/HEIF often starts with ftyp....heic
  if (bytes.length >= 12) {
    const brand = String.fromCharCode(
      bytes[8] ?? 0,
      bytes[9] ?? 0,
      bytes[10] ?? 0,
      bytes[11] ?? 0,
    ).toLowerCase();
    if (
      brand.includes("heic") ||
      brand.includes("heif") ||
      brand.includes("mif1")
    ) {
      return "image/heic";
    }
  }
  return null;
}

/**
 * Fetch the merchant media URL and re-encode as a data URL OpenAI accepts.
 * Passing raw CDN URLs often fails when Content-Type/extension is wrong.
 */
async function toOpenAiImageDataUrl(
  imageUrl: string,
): Promise<{ ok: true; dataUrl: string } | { ok: false; message: string }> {
  let res: Response;
  try {
    res = await fetch(imageUrl, {
      redirect: "follow",
      headers: { Accept: "image/*,*/*" },
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      message: "Could not download the product image for AI. Try re-uploading.",
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      message: `Could not download the product image (HTTP ${res.status}).`,
    };
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength <= 0 || buffer.byteLength > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      message: "Product image must be under 5 MB for AI draft.",
    };
  }

  const mime = detectImageMime(buffer);
  if (!mime) {
    return {
      ok: false,
      message:
        "Unsupported image format. Use JPEG, PNG, WebP, or GIF (not HEIC/AVIF).",
    };
  }
  if (mime === "image/heic") {
    return {
      ok: false,
      message:
        "iPhone HEIC photos are not supported by AI yet. Export as JPEG/PNG or take a screenshot, then re-upload.",
    };
  }

  const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
  return { ok: true, dataUrl };
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

  let body: AiProductDraftRequest;
  try {
    body = (await request.json()) as AiProductDraftRequest;
  } catch {
    return badRequest("AI_INVALID_INPUT", "Request body must be JSON.");
  }

  const titleHint = body.titleHint?.trim() ?? "";
  const notes = body.notes?.trim() ?? "";
  const imageUrl = body.imageUrl?.trim() ?? "";
  const categoryHint = body.categoryHint?.trim() ?? "";
  const businessName = body.businessName?.trim() ?? "";
  const currency = (body.currency?.trim() || "ZAR").toUpperCase();
  const tone =
    body.tone === "classic_boutique" || body.tone === "neutral"
      ? body.tone
      : "adaptive";
  const categoryNames = (body.categoryNames ?? [])
    .map((n) => n.trim())
    .filter(Boolean)
    .slice(0, 40);

  if (!titleHint && !notes && !imageUrl) {
    return badRequest(
      "AI_INVALID_INPUT",
      "Provide a title hint, notes, or a product image.",
    );
  }

  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
    return badRequest("AI_INVALID_INPUT", "imageUrl must be an http(s) URL.");
  }

  if (notes.length > 2000 || titleHint.length > 200) {
    return badRequest("AI_INVALID_INPUT", "Input text is too long.");
  }

  const priceMajor =
    typeof body.priceAmount === "number" &&
    Number.isFinite(body.priceAmount) &&
    body.priceAmount >= 0
      ? (body.priceAmount / 100).toFixed(2)
      : null;

  const toneGuide =
    tone === "classic_boutique"
      ? "Warm, editorial retail tone (only when the product clearly fits fashion/lifestyle)."
      : tone === "neutral"
        ? "Plain, direct, neutral tone."
        : [
            "Adapt tone and vocabulary to THIS product and store vertical.",
            "Examples of verticals you may see: phones & accessories, beauty, fashion,",
            "kota / street food, restaurant meals, groceries, hardware, services —",
            "match the real product, do not assume a clothing boutique.",
            "For food: appetising, clear portion/serving cues when visible.",
            "For electronics: clear model/specs cues when visible, no invented specs.",
            "For general retail: clear and sellable without hype jargon.",
          ].join(" ");

  const system = [
    "You draft product catalogue copy for a South African SME online shop.",
    "Stores sell many different things — never default to fashion/boutique language.",
    "Return ONLY valid JSON matching the schema. No markdown.",
    "Write concise, sellable English. Do not invent certifications, ingredients, or specs you cannot see.",
    "If an image is provided, base the draft on what is visible in the image.",
    "Prefer existing category names when they fit the product.",
    toneGuide,
  ].join(" ");

  const userText = [
    businessName ? `Store / business name: ${businessName}` : null,
    titleHint ? `Title hint: ${titleHint}` : null,
    notes ? `Merchant notes: ${notes}` : null,
    categoryHint ? `Category hint: ${categoryHint}` : null,
    categoryNames.length
      ? `Existing categories: ${categoryNames.join(", ")}`
      : null,
    priceMajor ? `Price context: ${currency} ${priceMajor} (wording only)` : null,
    "Respond with JSON keys: title, summary, suggestedCategoryName, skuSuggestion.",
    "summary: 1–3 short sentences for the storefront, matching this product type.",
    "skuSuggestion: short uppercase SKU-like code or null.",
    "suggestedCategoryName: best category string or null.",
  ]
    .filter(Boolean)
    .join("\n");

  const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [
    { type: "text", text: userText },
  ];

  if (imageUrl) {
    const resolved = await toOpenAiImageDataUrl(imageUrl);
    if (!resolved.ok) {
      return badRequest("AI_INVALID_INPUT", resolved.message);
    }
    userContent.push({
      type: "image_url",
      image_url: { url: resolved.dataUrl },
    });
  }

  const client = new OpenAI({ apiKey });

  let rawContent: string | null = null;
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      max_tokens: 400,
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
    const friendly = /unsupported image/i.test(message)
      ? "Unsupported image format. Use JPEG, PNG, WebP, or GIF (not HEIC)."
      : message;
    return NextResponse.json(
      { ok: false, code: "AI_PROVIDER_ERROR", message: friendly },
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

  let parsed: DraftJson;
  try {
    parsed = JSON.parse(rawContent) as DraftJson;
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

  const title = asNonEmptyString(parsed.title, titleHint || "Untitled product");
  const summary = asNonEmptyString(parsed.summary);
  if (!summary) {
    return NextResponse.json(
      {
        ok: false,
        code: "AI_PROVIDER_ERROR",
        message: "Draft was missing a summary.",
      },
      { status: 502 },
    );
  }

  const data: AiProductDraftResult = {
    title,
    summary,
    suggestedCategoryName: asNullableString(parsed.suggestedCategoryName),
    skuSuggestion: asNullableString(parsed.skuSuggestion),
    model: MODEL,
    disclaimer: DISCLAIMER,
  };

  return NextResponse.json({ ok: true, data });
}
