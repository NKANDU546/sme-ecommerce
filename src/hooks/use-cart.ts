"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCartItem,
  createCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/apis/carts";
import type { AddCartItemBody, UpdateCartItemBody } from "@/types/cart";

export const cartKeys = {
  detail: (storeSlug: string, cartId: string) =>
    ["cart", storeSlug, cartId] as const,
};

export function useCart(
  storeSlug: string | null | undefined,
  cartId: string | null | undefined,
) {
  return useQuery({
    queryKey: cartKeys.detail(storeSlug ?? "", cartId ?? ""),
    enabled: Boolean(storeSlug && cartId),
    queryFn: async () => {
      const result = await getCart(storeSlug!, cartId!);
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
  });
}

export function useCreateCart(storeSlug: string) {
  return useMutation({
    mutationFn: async () => {
      const result = await createCart(storeSlug);
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
  });
}

function useInvalidateCart(storeSlug: string, cartId: string) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: cartKeys.detail(storeSlug, cartId),
    });
}

export function useAddCartItem(storeSlug: string, cartId: string) {
  const invalidate = useInvalidateCart(storeSlug, cartId);
  return useMutation({
    mutationFn: async (body: AddCartItemBody) => {
      const result = await addCartItem(storeSlug, cartId, body);
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
    onSuccess: () => invalidate(),
  });
}

export function useUpdateCartItem(storeSlug: string, cartId: string) {
  const invalidate = useInvalidateCart(storeSlug, cartId);
  return useMutation({
    mutationFn: async ({
      itemId,
      body,
    }: {
      itemId: string;
      body: UpdateCartItemBody;
    }) => {
      const result = await updateCartItem(storeSlug, cartId, itemId, body);
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
    onSuccess: () => invalidate(),
  });
}

export function useRemoveCartItem(storeSlug: string, cartId: string) {
  const invalidate = useInvalidateCart(storeSlug, cartId);
  return useMutation({
    mutationFn: async (itemId: string) => {
      const result = await removeCartItem(storeSlug, cartId, itemId);
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
    onSuccess: () => invalidate(),
  });
}
