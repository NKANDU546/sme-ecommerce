import { NextResponse } from "next/server";
import OpenAI from "openai";
import type {
  AiStorefrontCopyFeature,
  AiStorefrontCopyPromo,
  AiStorefrontCopyRequest,
  AiStorefrontCopyResult,
  AiStorefrontSectionCopyFields,
  AiStorefrontSectionCopyResult,
  AiStorefrontTemplateCopyResult,
} from "@/types/ai";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = "gpt-4o-mini";
const DISCLAIMER =
  "Review before publishing. AI can be wrong — edit any line that does not fit your shop.";

const SECTION_FIELD_GUIDE: Record<string, string> = {
  hero: "heading, subheading, primaryCtaLabel, secondaryCtaLabel",
  featuredProducts: "title, viewAllLabel",
  promoBanner: "title, description, buttonLabel",
  textImage: "eyebrow, title, body, ctaLabel",
  features:
    "title, items (array matching current length: title, description each)",
  faq: "title, items (array matching current length: question, answer each)",
  contactCta: "title, body, buttonLabel",
  contact:
    "eyebrow, title, body, hours, note, whatsappLabel, formTitle, submitLabel, successMessage",
  testimonials:
    "title, items (array matching current length: quote, name, role each)",
  newsletter: "title, body, placeholder, buttonLabel, successMessage",
  shopByCategory: "title, viewAllLabel",
  newArrivals: "eyebrow, title, viewAllLabel",
  sale: "eyebrow, title, description, viewAllLabel",
  instagramGallery: "title, handle",
};

type CopyJson = Record<string, unknown>;

function asNonEmptyString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function badRequest(code: string, message: string) {
  return NextResponse.json({ ok: false, code, message }, { status: 400 });
}

function parsePromo(
  raw: unknown,
  fallback: AiStorefrontCopyPromo,
): AiStorefrontCopyPromo {
  if (!raw || typeof raw !== "object") return fallback;
  const o = raw as Record<string, unknown>;
  return {
    title: asNonEmptyString(o.title, fallback.title),
    description: asNonEmptyString(o.description, fallback.description),
    buttonLabel: asNonEmptyString(o.buttonLabel, fallback.buttonLabel),
  };
}

function parseFeature(
  raw: unknown,
  fallback: AiStorefrontCopyFeature,
): AiStorefrontCopyFeature {
  if (!raw || typeof raw !== "object") return fallback;
  const o = raw as Record<string, unknown>;
  return {
    title: asNonEmptyString(o.title, fallback.title),
    description: asNonEmptyString(o.description, fallback.description),
  };
}

function pickStringFields(
  parsed: CopyJson,
  keys: (keyof AiStorefrontSectionCopyFields)[],
): AiStorefrontSectionCopyFields {
  const out: AiStorefrontSectionCopyFields = {};
  for (const key of keys) {
    if (key === "items") continue;
    const value = asNonEmptyString(parsed[key]);
    if (value) out[key] = value;
  }
  return out;
}

function parseSectionFields(
  sectionType: string,
  parsed: CopyJson,
): AiStorefrontSectionCopyFields {
  const base = pickStringFields(parsed, [
    "heading",
    "subheading",
    "title",
    "description",
    "body",
    "eyebrow",
    "buttonLabel",
    "primaryCtaLabel",
    "secondaryCtaLabel",
    "viewAllLabel",
    "ctaLabel",
    "placeholder",
    "note",
    "hours",
    "whatsappLabel",
    "submitLabel",
    "formTitle",
    "successMessage",
    "handle",
  ]);

  if (
    sectionType === "features" ||
    sectionType === "faq" ||
    sectionType === "testimonials"
  ) {
    const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
    base.items = rawItems
      .filter((item): item is Record<string, unknown> =>
        Boolean(item && typeof item === "object"),
      )
      .map((item) => ({
        title: asNonEmptyString(item.title) || undefined,
        description: asNonEmptyString(item.description) || undefined,
        question: asNonEmptyString(item.question) || undefined,
        answer: asNonEmptyString(item.answer) || undefined,
        quote: asNonEmptyString(item.quote) || undefined,
        name: asNonEmptyString(item.name) || undefined,
        role: asNonEmptyString(item.role) || undefined,
        author: asNonEmptyString(item.author) || undefined,
      }));
  }

  return base;
}

async function callOpenAi(
  apiKey: string,
  system: string,
  userText: string,
  maxTokens: number,
): Promise<
  | { ok: true; content: string }
  | { ok: false; status: number; code: string; message: string }
> {
  const client = new OpenAI({ apiKey });
  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.5,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: userText },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? null;
    if (!content) {
      return {
        ok: false,
        status: 502,
        code: "AI_PROVIDER_ERROR",
        message: "Empty response from OpenAI.",
      };
    }
    return { ok: true, content };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "OpenAI request failed.";
    return {
      ok: false,
      status: 502,
      code: "AI_PROVIDER_ERROR",
      message,
    };
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        code: "AI_NOT_CONFIGURED",
        message:
          "OpenAI is not configured. Add OPENAI_API_KEY to the server env.",
      },
      { status: 503 },
    );
  }

  let body: AiStorefrontCopyRequest;
  try {
    body = (await request.json()) as AiStorefrontCopyRequest;
  } catch {
    return badRequest("AI_INVALID_INPUT", "Request body must be JSON.");
  }

  const businessName = body.businessName?.trim() ?? "";
  const notes = body.notes?.trim() ?? "";
  const shopNameHint = body.shopNameHint?.trim() ?? "";
  const templateId = body.templateId?.trim() || "classic-boutique";
  const scope = body.scope === "section" ? "section" : "template";
  const tone =
    body.tone === "classic_boutique" || body.tone === "neutral"
      ? body.tone
      : "adaptive";

  if (notes.length > 2000 || businessName.length > 200 || shopNameHint.length > 120) {
    return badRequest("AI_INVALID_INPUT", "Input text is too long.");
  }

  const toneGuide =
    tone === "classic_boutique"
      ? "Warm, editorial retail tone (fashion / lifestyle when it fits)."
      : tone === "neutral"
        ? "Plain, direct, neutral tone."
        : [
            "Adapt tone and vocabulary to THIS store vertical.",
            "Examples: phones & accessories, beauty, fashion, kota / street food,",
            "restaurant, groceries, hardware, services — match the real business,",
            "do not assume a clothing boutique.",
          ].join(" ");

  const templateGuide =
    templateId === "minimal-catalogue"
      ? "Template is Minimal Catalogue: clean, compact, catalogue-first copy."
      : "Template is Classic Boutique: editorial homepage with hero and promos.";

  const systemBase = [
    "You write storefront marketing copy for a South African SME online shop.",
    "Return ONLY valid JSON matching the schema. No markdown.",
    "Do not invent phone numbers, emails, addresses, prices, or certifications.",
    "Keep CTAs short (2–4 words). Headings punchy; subheadings 1–2 sentences.",
    "Write sellable English suitable for the storefront — not fashion-default unless it fits.",
    toneGuide,
    templateGuide,
  ].join(" ");

  if (scope === "section") {
    const sectionType = body.section?.type?.trim() ?? "";
    if (!sectionType || !SECTION_FIELD_GUIDE[sectionType]) {
      return badRequest(
        "AI_INVALID_INPUT",
        "section.type is required and must be a supported section type.",
      );
    }
    if (!businessName && !notes && !shopNameHint) {
      return badRequest(
        "AI_INVALID_INPUT",
        "Provide a business name, shop name, or notes about what you sell.",
      );
    }

    const fieldGuide = SECTION_FIELD_GUIDE[sectionType];
    const currentJson = body.section?.current
      ? JSON.stringify(body.section.current).slice(0, 4000)
      : "";

    const userText = [
      businessName ? `Business / store name: ${businessName}` : null,
      shopNameHint ? `Shop name on storefront: ${shopNameHint}` : null,
      notes ? `What they sell / notes: ${notes}` : null,
      `Rewrite ONLY this storefront section type: ${sectionType}.`,
      `Return JSON with keys: ${fieldGuide}.`,
      "Keep roughly the same number of list items when items[] is required.",
      "Do not return image URLs, hrefs, ids, or layout fields.",
      currentJson ? `Current section JSON (context only):\n${currentJson}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const completion = await callOpenAi(apiKey, systemBase, userText, 500);
    if (!completion.ok) {
      return NextResponse.json(
        { ok: false, code: completion.code, message: completion.message },
        { status: completion.status },
      );
    }

    let parsed: CopyJson;
    try {
      parsed = JSON.parse(completion.content) as CopyJson;
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

    const fields = parseSectionFields(sectionType, parsed);
    if (Object.keys(fields).length === 0) {
      return NextResponse.json(
        {
          ok: false,
          code: "AI_PROVIDER_ERROR",
          message: "Draft was missing section copy fields.",
        },
        { status: 502 },
      );
    }

    const data: AiStorefrontSectionCopyResult = {
      kind: "section",
      sectionType,
      fields,
      model: MODEL,
      disclaimer: DISCLAIMER,
    };
    return NextResponse.json({ ok: true, data });
  }

  if (!businessName && !notes && !shopNameHint) {
    return badRequest(
      "AI_INVALID_INPUT",
      "Provide a business name, shop name, or notes about what you sell.",
    );
  }

  const userText = [
    businessName ? `Business / store name: ${businessName}` : null,
    shopNameHint ? `Preferred shop name on storefront: ${shopNameHint}` : null,
    notes ? `What they sell / notes: ${notes}` : null,
    "Respond with JSON keys:",
    "shopName, tagline, heroHeading, heroSubheading,",
    "heroPrimaryCtaLabel, heroSecondaryCtaLabel, featuredTitle,",
    "promos (array of exactly 2: title, description, buttonLabel),",
    "features (array of exactly 3: title, description),",
    "footerBlurb, contactCtaTitle, contactCtaBody, contactCtaButtonLabel.",
    "tagline: short line under the logo.",
    "footerBlurb: 1–2 sentences for the footer brand column.",
    "features: trust / service points (shipping, payments, support) tailored to the shop.",
  ]
    .filter(Boolean)
    .join("\n");

  const completion = await callOpenAi(apiKey, systemBase, userText, 700);
  if (!completion.ok) {
    return NextResponse.json(
      { ok: false, code: completion.code, message: completion.message },
      { status: completion.status },
    );
  }

  let parsed: CopyJson;
  try {
    parsed = JSON.parse(completion.content) as CopyJson;
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

  const defaultShop = shopNameHint || businessName || "Our shop";
  const promoFallback: AiStorefrontCopyPromo = {
    title: "Special offer",
    description: "Discover picks chosen for your store.",
    buttonLabel: "Shop now",
  };
  const featureFallback: AiStorefrontCopyFeature = {
    title: "Helpful support",
    description: "Message us anytime — we reply fast.",
  };

  const promoRaw = Array.isArray(parsed.promos) ? parsed.promos : [];
  const featureRaw = Array.isArray(parsed.features) ? parsed.features : [];

  const heroHeading = asNonEmptyString(parsed.heroHeading);
  const heroSubheading = asNonEmptyString(parsed.heroSubheading);
  const tagline = asNonEmptyString(parsed.tagline);
  if (!heroHeading || !heroSubheading || !tagline) {
    return NextResponse.json(
      {
        ok: false,
        code: "AI_PROVIDER_ERROR",
        message: "Draft was missing required copy fields.",
      },
      { status: 502 },
    );
  }

  const data: AiStorefrontTemplateCopyResult = {
    kind: "template",
    shopName: asNonEmptyString(parsed.shopName, defaultShop),
    tagline,
    heroHeading,
    heroSubheading,
    heroPrimaryCtaLabel: asNonEmptyString(
      parsed.heroPrimaryCtaLabel,
      "Shop now",
    ),
    heroSecondaryCtaLabel: asNonEmptyString(
      parsed.heroSecondaryCtaLabel,
      "Learn more",
    ),
    featuredTitle: asNonEmptyString(parsed.featuredTitle, "Featured products"),
    promos: [
      parsePromo(promoRaw[0], {
        ...promoFallback,
        title: "Seasonal picks",
        buttonLabel: "Shop sale",
      }),
      parsePromo(promoRaw[1], {
        ...promoFallback,
        title: "New in store",
        buttonLabel: "Explore",
      }),
    ],
    features: [
      parseFeature(featureRaw[0], {
        title: "Secure checkout",
        description: "Card payments are encrypted and secure.",
      }),
      parseFeature(featureRaw[1], {
        title: "Fast local delivery",
        description: "We pack carefully and ship promptly.",
      }),
      parseFeature(featureRaw[2], featureFallback),
    ],
    footerBlurb: asNonEmptyString(
      parsed.footerBlurb,
      "Quality products for everyday life.",
    ),
    contactCtaTitle: asNonEmptyString(
      parsed.contactCtaTitle,
      "Need help choosing?",
    ),
    contactCtaBody: asNonEmptyString(
      parsed.contactCtaBody,
      "Message us and we will help you find the right products.",
    ),
    contactCtaButtonLabel: asNonEmptyString(
      parsed.contactCtaButtonLabel,
      "Contact us",
    ),
    model: MODEL,
    disclaimer: DISCLAIMER,
  };

  const result: AiStorefrontCopyResult = data;
  return NextResponse.json({ ok: true, data: result });
}
