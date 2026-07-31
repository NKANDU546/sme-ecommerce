import { STOREFRONT_DEFAULT_MEDIA } from "@/lib/storefront-default-media";
import type {
  StorefrontCollectionPageConfig,
  StorefrontCollectionPageId,
  StorefrontCollectionPages,
  StorefrontShopChromeConfig,
} from "@/types/storefront";

export const STOREFRONT_COLLECTION_PAGE_META: Array<{
  id: StorefrontCollectionPageId;
  label: string;
  pathHint: string;
}> = [
  { id: "shop", label: "Shop", pathHint: "/shop" },
  { id: "new", label: "New arrivals", pathHint: "/shop?collection=new" },
  { id: "sale", label: "Sale", pathHint: "/shop?collection=sale" },
];

export function defaultShopChrome(): StorefrontShopChromeConfig {
  return {
    showSearch: true,
    showCollectionTabs: true,
    showCategoryFilters: true,
    tabAll: true,
    tabNew: true,
    tabSale: true,
  };
}

export function defaultCollectionPages(): StorefrontCollectionPages {
  const chrome = defaultShopChrome();
  return {
    shop: {
      eyebrow: "Shop",
      title: "All products",
      description:
        "Browse the full collection — search, filter by category, or shop the sale.",
      imageUrl: STOREFRONT_DEFAULT_MEDIA.promo[0],
      chrome: { ...chrome },
    },
    new: {
      eyebrow: "Just landed",
      title: "New arrivals",
      description: "Fresh pieces added to the collection.",
      imageUrl: STOREFRONT_DEFAULT_MEDIA.promo[1],
      chrome: { ...chrome },
    },
    sale: {
      eyebrow: "Sale",
      title: "Offers on now",
      description: "Hand-picked deals while stocks last.",
      imageUrl: STOREFRONT_DEFAULT_MEDIA.saleBanner,
      chrome: { ...chrome },
    },
  };
}

export function mergeShopChrome(
  raw: Partial<StorefrontShopChromeConfig> | undefined,
  fallback: StorefrontShopChromeConfig = defaultShopChrome(),
): StorefrontShopChromeConfig {
  return {
    showSearch: Boolean(raw?.showSearch ?? fallback.showSearch),
    showCollectionTabs: Boolean(
      raw?.showCollectionTabs ?? fallback.showCollectionTabs,
    ),
    showCategoryFilters: Boolean(
      raw?.showCategoryFilters ?? fallback.showCategoryFilters,
    ),
    tabAll: Boolean(raw?.tabAll ?? fallback.tabAll),
    tabNew: Boolean(raw?.tabNew ?? fallback.tabNew),
    tabSale: Boolean(raw?.tabSale ?? fallback.tabSale),
  };
}

export function mergeCollectionPage(
  raw: Partial<StorefrontCollectionPageConfig> | undefined,
  fallback: StorefrontCollectionPageConfig,
  legacyChrome?: Partial<StorefrontShopChromeConfig>,
): StorefrontCollectionPageConfig {
  return {
    eyebrow: String(raw?.eyebrow ?? fallback.eyebrow),
    title: String(raw?.title ?? fallback.title),
    description: String(raw?.description ?? fallback.description),
    imageUrl: String(raw?.imageUrl ?? fallback.imageUrl),
    chrome: mergeShopChrome(
      raw?.chrome ?? legacyChrome,
      fallback.chrome ?? defaultShopChrome(),
    ),
  };
}

export function mergeCollectionPages(
  raw: Partial<StorefrontCollectionPages> | undefined,
  fallback: StorefrontCollectionPages = defaultCollectionPages(),
  /** Migrate older drafts that stored chrome once at config root. */
  legacyChrome?: Partial<StorefrontShopChromeConfig>,
): StorefrontCollectionPages {
  return {
    shop: mergeCollectionPage(raw?.shop, fallback.shop, legacyChrome),
    new: mergeCollectionPage(raw?.new, fallback.new, legacyChrome),
    sale: mergeCollectionPage(raw?.sale, fallback.sale, legacyChrome),
  };
}

export function isCollectionPageId(
  value: string,
): value is StorefrontCollectionPageId {
  return value === "shop" || value === "new" || value === "sale";
}

const COLLECTION_PAGE_SELECTION_PREFIX = "collection:";

export function collectionPageSelectionId(
  id: StorefrontCollectionPageId,
): string {
  return `${COLLECTION_PAGE_SELECTION_PREFIX}${id}`;
}

export function parseCollectionPageSelectionId(
  value: string,
): StorefrontCollectionPageId | null {
  if (!value.startsWith(COLLECTION_PAGE_SELECTION_PREFIX)) return null;
  const id = value.slice(COLLECTION_PAGE_SELECTION_PREFIX.length);
  return isCollectionPageId(id) ? id : null;
}

/** Maps shop `?collection=` values to editable system page ids. */
export function collectionPageIdFromShopCollection(
  collection: string | null | undefined,
): StorefrontCollectionPageId {
  if (collection === "new" || collection === "sale") return collection;
  return "shop";
}

export function shopCollectionFromPageId(
  id: StorefrontCollectionPageId,
): "all" | "new" | "sale" {
  return id === "shop" ? "all" : id;
}

export function resolveCollectionPage(
  pages: StorefrontCollectionPages | undefined,
  id: StorefrontCollectionPageId,
): StorefrontCollectionPageConfig {
  return mergeCollectionPages(pages)[id];
}

export function resolveShopChrome(
  chrome: StorefrontShopChromeConfig | undefined,
): StorefrontShopChromeConfig {
  return mergeShopChrome(chrome);
}
