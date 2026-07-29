"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getOrderConfirmation, postCheckout } from "@/apis/checkout";
import type { CheckoutBody } from "@/types/cart";

export const checkoutKeys = {
  order: (storeSlug: string, orderId: string) =>
    ["order", storeSlug, orderId] as const,
};

export function useOrderConfirmation(
  storeSlug: string | null | undefined,
  orderId: string | null | undefined,
) {
  return useQuery({
    queryKey: checkoutKeys.order(storeSlug ?? "", orderId ?? ""),
    enabled: Boolean(storeSlug && orderId),
    queryFn: async () => {
      const result = await getOrderConfirmation(storeSlug!, orderId!);
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
  });
}

export function useCheckout(storeSlug: string) {
  return useMutation({
    mutationFn: async (body: CheckoutBody) => {
      const result = await postCheckout(storeSlug, body);
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
  });
}
