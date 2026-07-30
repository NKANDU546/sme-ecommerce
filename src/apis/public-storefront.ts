import { getSmeApiBaseUrl } from "@/apis/config";
import { networkFailure, parseApiEnvelope } from "@/apis/api-result";
import { asProductApi } from "@/lib/product-mapper";
import type {
  PublicPage,
  PublicPageResult,
  PublicStorefront,
  PublicStorefrontResult,
} from "@/types/public-storefront";
import type {
  ListProductsParams,
  ProductApi,
  ProductPage,
  ProductResult,
  ProductsPageResult,
} from "@/types/product";

function asPublicStorefront(raw: PublicStorefront): PublicStorefront {
  return {
    workspaceId: String(raw.workspaceId),
    storeSlug: String(raw.storeSlug ?? ""),
    storeName: String(raw.storeName ?? ""),
    status: String(raw.status ?? ""),
    templateId: String(raw.templateId ?? "classic-boutique"),
    templateVersion: Number(raw.templateVersion ?? 1),
    configVersion: Number(raw.configVersion ?? 1),
    config:
      raw.config && typeof raw.config === "object"
        ? (raw.config as Record<string, unknown>)
        : {},
    publishedAt: String(raw.publishedAt ?? ""),
    seo: raw.seo
      ? {
          title: String(raw.seo.title ?? ""),
          description: String(raw.seo.description ?? ""),
          imageUrl: raw.seo.imageUrl == null ? null : String(raw.seo.imageUrl),
        }
      : null,
  };
}

function asPublicPage(raw: PublicPage): PublicPage {
  return {
    slug: String(raw.slug ?? ""),
    title: String(raw.title ?? ""),
    page:
      raw.page && typeof raw.page === "object"
        ? (raw.page as Record<string, unknown>)
        : {},
  };
}

function asPage(raw: ProductPage): ProductPage {
  return {
    items: Array.isArray(raw.items) ? raw.items.map(asProductApi) : [],
    page: Number(raw.page ?? 0),
    limit: Number(raw.limit ?? 20),
    totalItems: Number(raw.totalItems ?? 0),
    totalPages: Number(raw.totalPages ?? 0),
  };
}

function publicBase(storeSlug: string): string {
  return `${getSmeApiBaseUrl()}/public/storefronts/${encodeURIComponent(storeSlug)}`;
}

/** GET /public/storefronts/{storeSlug} — no auth. */
export async function getPublicStorefront(
  storeSlug: string,
): Promise<PublicStorefrontResult> {
  let res: Response;
  try {
    res = await fetch(publicBase(storeSlug), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not load this store. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<PublicStorefront>(
    res,
    "Store could not be loaded.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asPublicStorefront(parsed.data) };
}

/** GET /public/storefronts/{storeSlug}/products — active only. */
export async function listPublicProducts(
  storeSlug: string,
  params: Omit<ListProductsParams, "status" | "categoryId"> & {
    category?: string;
  } = {},
): Promise<ProductsPageResult> {
  const qs = new URLSearchParams();
  if (params.category?.trim()) qs.set("category", params.category.trim());
  if (params.search?.trim()) qs.set("search", params.search.trim());
  if (params.onSale === true) qs.set("onSale", "true");
  if (params.onSale === false) qs.set("onSale", "false");
  if (params.sort) qs.set("sort", params.sort);
  qs.set("page", String(params.page ?? 0));
  qs.set("limit", String(params.limit ?? 50));

  let res: Response;
  try {
    res = await fetch(`${publicBase(storeSlug)}/products?${qs}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not load products. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<ProductPage>(
    res,
    "Products could not be loaded.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asPage(parsed.data) };
}

/** GET /public/storefronts/{storeSlug}/products/{productSlug} */
export async function getPublicProduct(
  storeSlug: string,
  productSlug: string,
): Promise<ProductResult> {
  let res: Response;
  try {
    res = await fetch(
      `${publicBase(storeSlug)}/products/${encodeURIComponent(productSlug)}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );
  } catch {
    return networkFailure(
      "Could not load this product. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<ProductApi>(
    res,
    "Product could not be loaded.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asProductApi(parsed.data) };
}

/** GET /public/storefronts/{storeSlug}/pages/{pageSlug} */
export async function getPublicPage(
  storeSlug: string,
  pageSlug: string,
): Promise<PublicPageResult> {
  let res: Response;
  try {
    res = await fetch(
      `${publicBase(storeSlug)}/pages/${encodeURIComponent(pageSlug)}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );
  } catch {
    return networkFailure(
      "Could not load this page. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<PublicPage>(
    res,
    "Page could not be loaded.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asPublicPage(parsed.data) };
}
