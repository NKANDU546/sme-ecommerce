import { SEED_CATALOG_PRODUCTS } from "@/data/seed-catalog-products";
import type {
  CatalogProduct,
  CatalogProductHighlight,
  CatalogProductSidebarBlock,
  CatalogProductStatus,
} from "@/types/catalog-product";

const STORAGE_PREFIX = "sme_catalog_v1_";

export function catalogStorageKey(workspaceId: string): string {
  return `${STORAGE_PREFIX}${workspaceId}`;
}

function isStatus(v: unknown): v is CatalogProductStatus {
  return v === "active" || v === "draft" || v === "archived";
}

function optionalString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? v : undefined;
}

function optionalStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v.filter(
    (x): x is string => typeof x === "string" && x.trim().length > 0,
  );
  return out.length ? out : undefined;
}

function optionalHighlights(v: unknown): CatalogProductHighlight[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out: CatalogProductHighlight[] = [];
  for (const row of v) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const title = optionalString(o.title);
    const description = optionalString(o.description);
    if (title && description) out.push({ title, description });
  }
  return out.length ? out : undefined;
}

function optionalSidebar(v: unknown): CatalogProductSidebarBlock[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out: CatalogProductSidebarBlock[] = [];
  for (const row of v) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const kicker = optionalString(o.kicker);
    const body = optionalString(o.body);
    if (kicker && body) out.push({ kicker, body });
  }
  return out.length ? out : undefined;
}

function normalizeProduct(raw: unknown, fallback: CatalogProduct): CatalogProduct {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const o = raw as Record<string, unknown>;
  const base: CatalogProduct = {
    id: typeof o.id === "string" && o.id ? o.id : fallback.id,
    title: typeof o.title === "string" ? o.title : fallback.title,
    sku: typeof o.sku === "string" ? o.sku : fallback.sku,
    priceLabel:
      typeof o.priceLabel === "string" ? o.priceLabel : fallback.priceLabel,
    category:
      typeof o.category === "string" ? o.category : fallback.category,
    status: isStatus(o.status) ? o.status : fallback.status,
    imageUrl:
      typeof o.imageUrl === "string" ? o.imageUrl : fallback.imageUrl,
    updatedAt:
      typeof o.updatedAt === "number" && Number.isFinite(o.updatedAt)
        ? o.updatedAt
        : fallback.updatedAt,
    summary: optionalString(o.summary) ?? fallback.summary,
    galleryUrls: optionalStringArray(o.galleryUrls) ?? fallback.galleryUrls,
    configurationLabel:
      optionalString(o.configurationLabel) ?? fallback.configurationLabel,
    warrantyNote: optionalString(o.warrantyNote) ?? fallback.warrantyNote,
    shippingNote: optionalString(o.shippingNote) ?? fallback.shippingNote,
    standardsTitle:
      optionalString(o.standardsTitle) ?? fallback.standardsTitle,
    standardsSubtitle:
      optionalString(o.standardsSubtitle) ?? fallback.standardsSubtitle,
    standards: optionalHighlights(o.standards) ?? fallback.standards,
    hardwareTitle: optionalString(o.hardwareTitle) ?? fallback.hardwareTitle,
    hardwareBody: optionalString(o.hardwareBody) ?? fallback.hardwareBody,
    hardwareSpecs:
      optionalStringArray(o.hardwareSpecs) ?? fallback.hardwareSpecs,
    sidebarSections:
      optionalSidebar(o.sidebarSections) ?? fallback.sidebarSections,
  };
  return base;
}

export function loadCatalogProducts(workspaceId: string): CatalogProduct[] {
  if (typeof window === "undefined") return [...SEED_CATALOG_PRODUCTS];
  try {
    const raw = localStorage.getItem(catalogStorageKey(workspaceId));
    if (!raw) return [...SEED_CATALOG_PRODUCTS];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [...SEED_CATALOG_PRODUCTS];
    }
    const fallback = (i: number): CatalogProduct => ({
      id: `p-${i}`,
      title: "Product",
      sku: "SKU-UNKNOWN",
      priceLabel: "R 0.00",
      category: "Home",
      status: "draft",
      imageUrl: "",
      updatedAt: Date.now(),
    });
    return parsed.map((row, i) =>
      normalizeProduct(row, SEED_CATALOG_PRODUCTS[i] ?? fallback(i)),
    );
  } catch {
    return [...SEED_CATALOG_PRODUCTS];
  }
}

export function getCatalogProductById(
  workspaceId: string,
  productId: string,
): CatalogProduct | null {
  const list = loadCatalogProducts(workspaceId);
  return list.find((p) => p.id === productId) ?? null;
}

export function saveCatalogProducts(
  workspaceId: string,
  products: CatalogProduct[],
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      catalogStorageKey(workspaceId),
      JSON.stringify(products),
    );
  } catch {
    /* ignore quota / private mode */
  }
}
