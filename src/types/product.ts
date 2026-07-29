import type { CatalogProductStatus } from "@/types/catalog-product";

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ProductApi = {
  id: string;
  workspaceId: string;
  title: string;
  slug: string;
  sku: string;
  priceAmount: number;
  /** Was-price in minor units; null when not on sale. */
  compareAtPriceAmount: number | null;
  currency: string;
  priceLabel: string;
  compareAtPriceLabel: string | null;
  /** Derived: compare-at set and greater than selling price. */
  onSale: boolean;
  category: ProductCategory | null;
  status: CatalogProductStatus | string;
  mainImageId: string | null;
  imageUrl: string | null;
  summary: string | null;
  galleryMediaIds: string[] | null;
  galleryUrls: string[] | null;
  configurationLabel: string | null;
  warrantyNote: string | null;
  shippingNote: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductPage = {
  items: ProductApi[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type CreateProductBody = {
  title: string;
  sku: string;
  slug?: string;
  priceAmount: number;
  compareAtPriceAmount?: number | null;
  currency?: string;
  categoryId?: string;
  categoryName?: string;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED" | "draft" | "active" | "archived";
  imageUrl?: string;
  mainImageId?: string;
  summary?: string;
  galleryUrls?: string[];
  galleryMediaIds?: string[];
  configurationLabel?: string;
  warrantyNote?: string;
  shippingNote?: string;
  metadata?: Record<string, unknown>;
};

export type UpdateProductBody = {
  title?: string;
  sku?: string;
  slug?: string;
  priceAmount?: number;
  compareAtPriceAmount?: number | null;
  clearCompareAtPrice?: boolean;
  currency?: string;
  categoryId?: string;
  categoryName?: string;
  clearCategory?: boolean;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED" | "draft" | "active" | "archived";
  imageUrl?: string;
  mainImageId?: string;
  clearMainImage?: boolean;
  summary?: string;
  galleryUrls?: string[];
  galleryMediaIds?: string[];
  configurationLabel?: string;
  warrantyNote?: string;
  shippingNote?: string;
  metadata?: Record<string, unknown>;
};

export type ProductListSort =
  | "newest"
  | "updated"
  | "price_asc"
  | "price_desc";

export type ListProductsParams = {
  status?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  onSale?: boolean;
  sort?: ProductListSort;
};

export type ApiErrorResult = {
  ok: false;
  errorMessage: string;
  errorCode?: string;
  status?: number;
};

export type ProductsPageResult =
  | { ok: true; data: ProductPage }
  | ApiErrorResult;

export type ProductResult =
  | { ok: true; data: ProductApi }
  | ApiErrorResult;

export type CategoriesResult =
  | { ok: true; data: ProductCategory[] }
  | ApiErrorResult;
