"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrderConfirmation,
  postCheckout,
  verifyOrderPayment,
} from "@/apis/checkout";
import type { CheckoutBody, Order } from "@/types/cart";

export const checkoutKeys = {
  order: (storeSlug: string, orderId: string) =>
    ["order", storeSlug, orderId] as const,
};

export function useOrderConfirmation(
  storeSlug: string | null | undefined,
  orderId: string | null | undefined,
  options?: {
    refetchInterval?:
      | number
      | false
      | ((order: Order | undefined) => number | false);
  },
) {
  return useQuery({
    queryKey: checkoutKeys.order(storeSlug ?? "", orderId ?? ""),
    enabled: Boolean(storeSlug && orderId),
    refetchInterval: (query) => {
      const interval = options?.refetchInterval;
      if (typeof interval === "function") {
        return interval(query.state.data);
      }
      return interval ?? false;
    },
    queryFn: async () => {
      const result = await getOrderConfirmation(storeSlug!, orderId!);
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
  });
}

export function useVerifyOrderPayment(storeSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { orderId: string; reference?: string }) => {
      const result = await verifyOrderPayment(
        storeSlug,
        input.orderId,
        input.reference,
      );
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
    onSuccess: (order) => {
      queryClient.setQueryData(
        checkoutKeys.order(storeSlug, order.id),
        order,
      );
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
