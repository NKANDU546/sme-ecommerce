"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getPublicPage,
  getPublicProduct,
  getPublicStorefront,
  listPublicProducts,
} from "@/apis/public-storefront";
import { publicStorefrontToConfig } from "@/lib/public-storefront-mapper";
import type { ListProductsParams } from "@/types/product";

export const publicStoreKeys = {
  storefront: (storeSlug: string) =>
    ["public-storefront", storeSlug] as const,
  products: (
    storeSlug: string,
    params: Omit<ListProductsParams, "status" | "categoryId"> & {
      category?: string;
    },
  ) => ["public-storefront", storeSlug, "products", params] as const,
  product: (storeSlug: string, productSlug: string) =>
    ["public-storefront", storeSlug, "product", productSlug] as const,
  page: (storeSlug: string, pageSlug: string) =>
    ["public-storefront", storeSlug, "page", pageSlug] as const,
};

export function usePublicStorefront(storeSlug: string, enabled = true) {
  return useQuery({
    queryKey: publicStoreKeys.storefront(storeSlug),
    enabled: enabled && Boolean(storeSlug),
    queryFn: async () => {
      const result = await getPublicStorefront(storeSlug);
      if (!result.ok) throw new Error(result.errorMessage);
      return {
        storefront: result.data,
        config: publicStorefrontToConfig(result.data),
      };
    },
  });
}

export function usePublicProducts(
  storeSlug: string,
  params: Omit<ListProductsParams, "status" | "categoryId"> & {
    category?: string;
  } = {},
  enabled = true,
) {
  return useQuery({
    queryKey: publicStoreKeys.products(storeSlug, params),
    enabled: enabled && Boolean(storeSlug),
    queryFn: async () => {
      const result = await listPublicProducts(storeSlug, params);
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
  });
}

export function usePublicProduct(
  storeSlug: string,
  productSlug: string,
  enabled = true,
) {
  return useQuery({
    queryKey: publicStoreKeys.product(storeSlug, productSlug),
    enabled: enabled && Boolean(storeSlug && productSlug),
    queryFn: async () => {
      const result = await getPublicProduct(storeSlug, productSlug);
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
  });
}

export function usePublicPage(
  storeSlug: string,
  pageSlug: string,
  enabled = true,
) {
  return useQuery({
    queryKey: publicStoreKeys.page(storeSlug, pageSlug),
    enabled: enabled && Boolean(storeSlug && pageSlug),
    queryFn: async () => {
      const result = await getPublicPage(storeSlug, pageSlug);
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
  });
}
