import type { StorefrontLink } from "@/types/storefront";

/**
 * Magic `href` on a storefront link (e.g. hero primary CTA) that resolves to
 * the shop collection when a storefront base path is known.
 */
export const PREVIEW_SHOP_COLLECTION_HREF = "@shop";
export const PREVIEW_CUSTOM_PAGE_HREF_PREFIX = "@page:";

/** Default hero label that pairs with legacy `#` hrefs from older drafts. */
const SHOP_COLLECTION_LABEL = "shop collection";

/**
 * Resolves magic storefront hrefs against a base path.
 * Examples: `/preview/{workspaceId}` or `/s/{storeSlug}`.
 */
export function resolveStorefrontHref(
  link: StorefrontLink,
  basePath?: string,
): string {
  if (!basePath) return link.href;
  const root = basePath.replace(/\/$/, "");
  const label = link.label.trim().toLowerCase();
  if (
    link.href === PREVIEW_SHOP_COLLECTION_HREF ||
    (link.href === "#" && label === SHOP_COLLECTION_LABEL)
  ) {
    return `${root}/shop`;
  }
  if (link.href.startsWith(PREVIEW_CUSTOM_PAGE_HREF_PREFIX)) {
    const slug = link.href.slice(PREVIEW_CUSTOM_PAGE_HREF_PREFIX.length);
    if (slug.trim()) return `${root}/${slug}`;
  }
  return link.href;
}

/** @deprecated Prefer `resolveStorefrontHref` with an explicit base path. */
export function resolvePreviewShopCollectionHref(
  link: StorefrontLink,
  workspaceId: string | undefined,
): string {
  return resolveStorefrontHref(
    link,
    workspaceId ? `/preview/${workspaceId}` : undefined,
  );
}

export function previewStorefrontBasePath(workspaceId: string): string {
  return `/preview/${workspaceId}`;
}

export function publicStorefrontBasePath(storeSlug: string): string {
  return `/s/${storeSlug}`;
}
