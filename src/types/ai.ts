/** Client ↔ Next.js AI product-draft shapes (MVP; later may mirror SME Step 10). */

export type AiProductDraftRequest = {
  titleHint?: string;
  notes?: string;
  /** Public media URL (main product image) for vision. */
  imageUrl?: string;
  priceAmount?: number;
  currency?: string;
  categoryHint?: string;
  /** Existing workspace category names for grounding. */
  categoryNames?: string[];
  /** Merchant business / store name for context (any vertical). */
  businessName?: string;
  /**
   * Writing style. Default is adaptive — match the product (phones, food,
   * fashion, etc.), not a fashion boutique.
   */
  tone?: "adaptive" | "classic_boutique" | "neutral";
};

export type AiProductDraftResult = {
  title: string;
  summary: string;
  suggestedCategoryName: string | null;
  skuSuggestion: string | null;
  model: string;
  disclaimer: string;
};

/** Analytics explain — Next.js MVP (mirrors Step 10 response shape). */
export type AiAnalyticsExplainRequest = {
  workspaceId: string;
  from?: string;
  to?: string;
};

export type AiAnalyticsSuggestedAction = {
  label: string;
  section: string;
  /** Optional short why (shown under the button). */
  reason?: string;
};

export type AiAnalyticsExplainResult = {
  from: string;
  to: string;
  /** Short diagnosis — what matters this period. */
  headline: string;
  /** 1–2 sentences: context + why the merchant should care. */
  diagnosis: string;
  /** Positive / working signals (not raw KPI repeats). */
  wins: string[];
  /** Risks, leaks, concentration, stock — with so-what. */
  watchouts: string[];
  /** Kept for older UI; usually mirrors wins+watchouts. */
  bullets: string[];
  suggestedActions: AiAnalyticsSuggestedAction[];
  model: string;
  disclaimer: string;
};

/** Section types the storefront-copy route can rewrite. */
export type AiStorefrontSectionType =
  | "hero"
  | "featuredProducts"
  | "promoBanner"
  | "textImage"
  | "features"
  | "faq"
  | "contactCta"
  | "contact"
  | "testimonials"
  | "newsletter"
  | "shopByCategory"
  | "newArrivals"
  | "sale"
  | "instagramGallery";

/** Storefront / template copy — Next.js MVP (phase-2 `…/ai/storefront-copy`). */
export type AiStorefrontCopyRequest = {
  /** Registered business / store name. */
  businessName?: string;
  /** What they sell, location, vibe (WhatsApp paste OK). */
  notes?: string;
  /** Prefer this as shopName when set. */
  shopNameHint?: string;
  templateId?: "classic-boutique" | "minimal-catalogue" | string;
  tone?: "adaptive" | "classic_boutique" | "neutral";
  /**
   * `template` (default) rewrites brand + homepage copy.
   * `section` rewrites one section’s text fields only.
   */
  scope?: "template" | "section";
  /** Required when `scope === "section"`. */
  section?: {
    type: AiStorefrontSectionType | string;
    /** Current section JSON for context (ids/images ignored by model). */
    current?: unknown;
  };
};

export type AiStorefrontCopyPromo = {
  title: string;
  description: string;
  buttonLabel: string;
};

export type AiStorefrontCopyFeature = {
  title: string;
  description: string;
};

export type AiStorefrontTemplateCopyResult = {
  kind: "template";
  shopName: string;
  tagline: string;
  heroHeading: string;
  heroSubheading: string;
  heroPrimaryCtaLabel: string;
  heroSecondaryCtaLabel: string;
  featuredTitle: string;
  promos: [AiStorefrontCopyPromo, AiStorefrontCopyPromo];
  features: [
    AiStorefrontCopyFeature,
    AiStorefrontCopyFeature,
    AiStorefrontCopyFeature,
  ];
  footerBlurb: string;
  contactCtaTitle: string;
  contactCtaBody: string;
  contactCtaButtonLabel: string;
  model: string;
  disclaimer: string;
};

/** Text-field patch for one section (images/hrefs applied separately by FE). */
export type AiStorefrontSectionCopyFields = {
  heading?: string;
  subheading?: string;
  title?: string;
  description?: string;
  body?: string;
  eyebrow?: string;
  buttonLabel?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  viewAllLabel?: string;
  ctaLabel?: string;
  placeholder?: string;
  note?: string;
  hours?: string;
  whatsappLabel?: string;
  submitLabel?: string;
  formTitle?: string;
  successMessage?: string;
  handle?: string;
  items?: Array<{
    title?: string;
    description?: string;
    question?: string;
    answer?: string;
    quote?: string;
    name?: string;
    role?: string;
    author?: string;
  }>;
};

export type AiStorefrontSectionCopyResult = {
  kind: "section";
  sectionType: string;
  fields: AiStorefrontSectionCopyFields;
  model: string;
  disclaimer: string;
};

export type AiStorefrontCopyResult =
  | AiStorefrontTemplateCopyResult
  | AiStorefrontSectionCopyResult;
