/** True when rendering the live public storefront (`/s/{slug}`). */
export function isPublicStorefrontContext(basePath?: string): boolean {
  if (!basePath) return false;
  return /^\/s\/[^/]+$/.test(basePath.replace(/\/$/, ""));
}
