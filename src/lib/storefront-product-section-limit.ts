/** Default product count for homepage teasers. */
export const STOREFRONT_PRODUCT_SECTION_TEASER_LIMIT = 4;

/** Max when the merchant picks a custom count (not "show all"). */
export const STOREFRONT_PRODUCT_SECTION_MAX_LIMIT = 48;

/**
 * Request size when a section is set to "show all".
 * Matches the shop collection page (`limit: 100`).
 */
export const STOREFRONT_PRODUCT_SECTION_ALL_LIMIT = 100;

/**
 * Resolves how many products a merchandising section should fetch.
 * - `null` → show all (ALL_LIMIT)
 * - `undefined` / invalid → teaser default
 * - number → clamped custom count
 */
export function resolveStorefrontProductSectionLimit(
  limit: number | null | undefined,
  fallback = STOREFRONT_PRODUCT_SECTION_TEASER_LIMIT,
): number {
  if (limit === null) return STOREFRONT_PRODUCT_SECTION_ALL_LIMIT;
  if (limit == null || !Number.isFinite(limit) || limit < 1) return fallback;
  return Math.min(
    STOREFRONT_PRODUCT_SECTION_MAX_LIMIT,
    Math.max(1, Math.floor(limit)),
  );
}

export function isStorefrontProductSectionShowAll(
  limit: number | null | undefined,
): boolean {
  return limit === null;
}
