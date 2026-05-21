import type { StorefrontLink } from "@/types/storefront";

/**
 * Magic `href` on a storefront link (e.g. hero primary CTA) that resolves to
 * the workspace shop collection preview when `workspaceId` is known.
 */
export const PREVIEW_SHOP_COLLECTION_HREF = "@shop";
export const PREVIEW_CUSTOM_PAGE_HREF_PREFIX = "@page:";

/** Default hero label that pairs with legacy `#` hrefs from older drafts. */
const SHOP_COLLECTION_LABEL = "shop collection";

export function resolvePreviewShopCollectionHref(
  link: StorefrontLink,
  workspaceId: string | undefined,
): string {
  if (!workspaceId) return link.href;
  const label = link.label.trim().toLowerCase();
  if (
    link.href === PREVIEW_SHOP_COLLECTION_HREF ||
    (link.href === "#" && label === SHOP_COLLECTION_LABEL)
  ) {
    return `/preview/${workspaceId}/shop`;
  }
  if (link.href.startsWith(PREVIEW_CUSTOM_PAGE_HREF_PREFIX)) {
    const slug = link.href.slice(PREVIEW_CUSTOM_PAGE_HREF_PREFIX.length);
    if (slug.trim()) return `/preview/${workspaceId}/page/${slug}`;
  }
  return link.href;
}
