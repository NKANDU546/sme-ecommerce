/** Path segments reserved under `/s/{store}` and `/preview/{id}`. */
export const STOREFRONT_RESERVED_PAGE_SLUGS = new Set([
  "shop",
  "cart",
  "checkout",
  "order",
  "orders",
  "page",
]);

export function isReservedStorefrontPageSlug(slug: string): boolean {
  return STOREFRONT_RESERVED_PAGE_SLUGS.has(slug.trim().toLowerCase());
}
