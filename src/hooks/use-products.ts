"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  archiveProduct,
  createProduct,
  draftProduct,
  getProduct,
  listCategories,
  listProducts,
  publishProduct,
  updateProduct,
} from "@/apis/products";
import type {
  CreateProductBody,
  ListProductsParams,
  UpdateProductBody,
} from "@/types/product";

export const productKeys = {
  all: (workspaceId: string) => ["products", workspaceId] as const,
  list: (workspaceId: string, params: ListProductsParams) =>
    ["products", workspaceId, "list", params] as const,
  detail: (workspaceId: string, productId: string) =>
    ["products", workspaceId, "detail", productId] as const,
  categories: (workspaceId: string) =>
    ["products", workspaceId, "categories"] as const,
};

export function useProducts(
  workspaceId: string | null | undefined,
  accessToken: string | null | undefined,
  params: ListProductsParams = {},
) {
  return useQuery({
    queryKey: productKeys.list(workspaceId ?? "", params),
    enabled: Boolean(workspaceId && accessToken),
    queryFn: async () => {
      const result = await listProducts(workspaceId!, accessToken!, params);
      if (!result.ok) {
        throw new Error(result.errorMessage);
      }
      return result.data;
    },
  });
}

export function useProduct(
  workspaceId: string | null | undefined,
  productId: string | null | undefined,
  accessToken: string | null | undefined,
) {
  return useQuery({
    queryKey: productKeys.detail(workspaceId ?? "", productId ?? ""),
    enabled: Boolean(workspaceId && productId && accessToken),
    queryFn: async () => {
      const result = await getProduct(workspaceId!, productId!, accessToken!);
      if (!result.ok) {
        throw new Error(result.errorMessage);
      }
      return result.data;
    },
  });
}

export function useProductCategories(
  workspaceId: string | null | undefined,
  accessToken: string | null | undefined,
) {
  return useQuery({
    queryKey: productKeys.categories(workspaceId ?? ""),
    enabled: Boolean(workspaceId && accessToken),
    queryFn: async () => {
      const result = await listCategories(workspaceId!, accessToken!);
      if (!result.ok) {
        throw new Error(result.errorMessage);
      }
      return result.data;
    },
  });
}

function useInvalidateProducts(workspaceId: string) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: productKeys.all(workspaceId) });
}

export function useCreateProduct(
  workspaceId: string,
  accessToken: string | null | undefined,
) {
  const invalidate = useInvalidateProducts(workspaceId);
  return useMutation({
    mutationFn: async (body: CreateProductBody) => {
      if (!accessToken) throw new Error("You need to sign in again.");
      const result = await createProduct(workspaceId, accessToken, body);
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
    onSuccess: () => invalidate(),
  });
}

export function useUpdateProduct(
  workspaceId: string,
  accessToken: string | null | undefined,
) {
  const invalidate = useInvalidateProducts(workspaceId);
  return useMutation({
    mutationFn: async ({
      productId,
      body,
    }: {
      productId: string;
      body: UpdateProductBody;
    }) => {
      if (!accessToken) throw new Error("You need to sign in again.");
      const result = await updateProduct(
        workspaceId,
        productId,
        accessToken,
        body,
      );
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
    onSuccess: () => invalidate(),
  });
}

export function usePublishProduct(
  workspaceId: string,
  accessToken: string | null | undefined,
) {
  const invalidate = useInvalidateProducts(workspaceId);
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!accessToken) throw new Error("You need to sign in again.");
      const result = await publishProduct(workspaceId, productId, accessToken);
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
    onSuccess: () => invalidate(),
  });
}

export function useArchiveProduct(
  workspaceId: string,
  accessToken: string | null | undefined,
) {
  const invalidate = useInvalidateProducts(workspaceId);
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!accessToken) throw new Error("You need to sign in again.");
      const result = await archiveProduct(workspaceId, productId, accessToken);
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
    onSuccess: () => invalidate(),
  });
}

export function useDraftProduct(
  workspaceId: string,
  accessToken: string | null | undefined,
) {
  const invalidate = useInvalidateProducts(workspaceId);
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!accessToken) throw new Error("You need to sign in again.");
      const result = await draftProduct(workspaceId, productId, accessToken);
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
    onSuccess: () => invalidate(),
  });
}
