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
};

export type AiAnalyticsExplainResult = {
  from: string;
  to: string;
  headline: string;
  bullets: string[];
  suggestedActions: AiAnalyticsSuggestedAction[];
  model: string;
  disclaimer: string;
};
