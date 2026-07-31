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
  const source = raw as ProductApi & {
    quantity_available?: unknown;
    in_stock?: unknown;
  };
  const priceAmount = Number(source.priceAmount ?? 0);
  const compareRaw = source.compareAtPriceAmount;
  const compareAtPriceAmount =
    compareRaw == null || compareRaw === ("" as unknown)
      ? null
      : Number(compareRaw);
  const normalizedCompare =
    compareAtPriceAmount != null && Number.isFinite(compareAtPriceAmount)
      ? compareAtPriceAmount
      : null;
  const onSale =
    typeof source.onSale === "boolean"
      ? source.onSale
      : normalizedCompare != null && normalizedCompare > priceAmount;
  const quantityRaw =
    source.quantityAvailable ?? source.quantity_available ?? 0;
  const quantityAvailable = Math.max(0, Math.floor(Number(quantityRaw)));
  const inStockRaw = source.inStock ?? source.in_stock;
  const inStock =
    typeof inStockRaw === "boolean" ? inStockRaw : quantityAvailable > 0;

  return {
    id: String(source.id),
    workspaceId: String(source.workspaceId),
    title: String(source.title ?? ""),
    slug: String(source.slug ?? ""),
    sku: String(source.sku ?? ""),
    priceAmount,
    compareAtPriceAmount: normalizedCompare,
    currency: String(source.currency ?? "ZAR"),
    priceLabel: String(source.priceLabel ?? "R 0.00"),
    compareAtPriceLabel:
      source.compareAtPriceLabel == null || source.compareAtPriceLabel === ""
        ? null
        : String(source.compareAtPriceLabel),
    onSale,
    quantityAvailable,
    inStock,
    category: source.category ? asProductCategory(source.category) : null,
    status: normalizeStatus(source.status),
    mainImageId: source.mainImageId == null ? null : String(source.mainImageId),
    imageUrl: source.imageUrl == null ? null : String(source.imageUrl),
    summary: source.summary == null ? null : String(source.summary),
    galleryMediaIds: Array.isArray(source.galleryMediaIds)
      ? source.galleryMediaIds.map(String)
      : null,
    galleryUrls: Array.isArray(source.galleryUrls)
      ? source.galleryUrls.map(String)
      : null,
    configurationLabel:
      source.configurationLabel == null
        ? null
        : String(source.configurationLabel),
    warrantyNote:
      source.warrantyNote == null ? null : String(source.warrantyNote),
    shippingNote:
      source.shippingNote == null ? null : String(source.shippingNote),
    metadata:
      source.metadata && typeof source.metadata === "object"
        ? (source.metadata as Record<string, unknown>)
        : null,
    createdAt: String(source.createdAt ?? ""),
    updatedAt: String(source.updatedAt ?? ""),
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
    quantityAvailable: p.quantityAvailable,
    inStock: p.inStock,
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
