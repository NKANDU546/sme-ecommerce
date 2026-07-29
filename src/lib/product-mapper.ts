import type { CatalogProduct, CatalogProductStatus } from "@/types/catalog-product";
import type { ProductApi, ProductCategory } from "@/types/product";

function parseUpdatedAt(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const ms = Date.parse(value);
    if (!Number.isNaN(ms)) return ms;
  }
  if (Array.isArray(value) && value.length >= 3) {
    const [y, m, d, h = 0, min = 0, s = 0] = value.map(Number);
    const ms = Date.UTC(y, (m || 1) - 1, d || 1, h, min, s);
    if (!Number.isNaN(ms)) return ms;
  }
  return Date.now();
}

function normalizeStatus(raw: unknown): CatalogProductStatus {
  const value = String(raw ?? "draft").toLowerCase();
  if (value === "active" || value === "draft" || value === "archived") {
    return value;
  }
  return "draft";
}

export function asProductCategory(raw: ProductCategory): ProductCategory {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
  };
}

export function asProductApi(raw: ProductApi): ProductApi {
  const priceAmount = Number(raw.priceAmount ?? 0);
  const compareRaw = raw.compareAtPriceAmount;
  const compareAtPriceAmount =
    compareRaw == null || compareRaw === ("" as unknown)
      ? null
      : Number(compareRaw);
  const normalizedCompare =
    compareAtPriceAmount != null && Number.isFinite(compareAtPriceAmount)
      ? compareAtPriceAmount
      : null;
  const onSale =
    typeof raw.onSale === "boolean"
      ? raw.onSale
      : normalizedCompare != null && normalizedCompare > priceAmount;

  return {
    id: String(raw.id),
    workspaceId: String(raw.workspaceId),
    title: String(raw.title ?? ""),
    slug: String(raw.slug ?? ""),
    sku: String(raw.sku ?? ""),
    priceAmount,
    compareAtPriceAmount: normalizedCompare,
    currency: String(raw.currency ?? "ZAR"),
    priceLabel: String(raw.priceLabel ?? "R 0.00"),
    compareAtPriceLabel:
      raw.compareAtPriceLabel == null || raw.compareAtPriceLabel === ""
        ? null
        : String(raw.compareAtPriceLabel),
    onSale,
    category: raw.category ? asProductCategory(raw.category) : null,
    status: normalizeStatus(raw.status),
    mainImageId: raw.mainImageId == null ? null : String(raw.mainImageId),
    imageUrl: raw.imageUrl == null ? null : String(raw.imageUrl),
    summary: raw.summary == null ? null : String(raw.summary),
    galleryMediaIds: Array.isArray(raw.galleryMediaIds)
      ? raw.galleryMediaIds.map(String)
      : null,
    galleryUrls: Array.isArray(raw.galleryUrls)
      ? raw.galleryUrls.map(String)
      : null,
    configurationLabel:
      raw.configurationLabel == null ? null : String(raw.configurationLabel),
    warrantyNote: raw.warrantyNote == null ? null : String(raw.warrantyNote),
    shippingNote: raw.shippingNote == null ? null : String(raw.shippingNote),
    metadata:
      raw.metadata && typeof raw.metadata === "object"
        ? (raw.metadata as Record<string, unknown>)
        : null,
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
  };
}

/** Maps backend ProductDto into the existing dashboard/preview CatalogProduct shape. */
export function productApiToCatalog(product: ProductApi): CatalogProduct {
  const p = asProductApi(product);
  return {
    id: p.id,
    title: p.title,
    sku: p.sku,
    priceLabel: p.priceLabel,
    compareAtPriceLabel: p.compareAtPriceLabel ?? undefined,
    onSale: p.onSale,
    category: p.category?.name ?? "",
    status: normalizeStatus(p.status),
    imageUrl: p.imageUrl ?? "",
    updatedAt: parseUpdatedAt(p.updatedAt),
    summary: p.summary ?? undefined,
    galleryUrls: p.galleryUrls?.length ? p.galleryUrls : undefined,
    configurationLabel: p.configurationLabel ?? undefined,
    warrantyNote: p.warrantyNote ?? undefined,
    shippingNote: p.shippingNote ?? undefined,
  };
}
