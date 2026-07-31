"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  connectPaystackSubaccount,
  getPaymentSettings,
  initializeOrderPayment,
  listPaystackBanks,
  updatePaymentSettings,
} from "@/apis/payments";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import type { UpdatePaymentSettingsBody } from "@/types/payments";

export const paymentKeys = {
  settings: (workspaceId: string) =>
    ["payments-settings", workspaceId] as const,
  banks: (country: string) => ["paystack-banks", country] as const,
};

function requireAccessToken(): string {
  const session = getStoredAuthSession();
  if (!session?.accessToken) {
    throw new Error("Sign in to manage payment settings.");
  }
  return session.accessToken;
}

export function usePaymentSettings(workspaceId: string, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.settings(workspaceId),
    enabled: enabled && Boolean(workspaceId),
    queryFn: async () => {
      const result = await getPaymentSettings(workspaceId, requireAccessToken());
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
  });
}

export function usePaystackBanks(country: string, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.banks(country),
    enabled: enabled && Boolean(country),
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      const result = await listPaystackBanks(requireAccessToken(), country);
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
  });
}

export function useUpdatePaymentSettings(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdatePaymentSettingsBody) => {
      const result = await updatePaymentSettings(
        workspaceId,
        requireAccessToken(),
        body,
      );
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(paymentKeys.settings(workspaceId), data);
    },
  });
}

export function useConnectPaystackSubaccount(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const result = await connectPaystackSubaccount(
        workspaceId,
        requireAccessToken(),
      );
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(paymentKeys.settings(workspaceId), data);
    },
  });
}

export function useInitializeOrderPayment(storeSlug: string) {
  return useMutation({
    mutationFn: async (input: { orderId: string; callbackUrl?: string }) => {
      const result = await initializeOrderPayment(
        storeSlug,
        input.orderId,
        input.callbackUrl ? { callbackUrl: input.callbackUrl } : undefined,
      );
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
  });
}
