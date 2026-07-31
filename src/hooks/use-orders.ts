"use client";

import { useQuery } from "@tanstack/react-query";
import { getWorkspaceOrder, listWorkspaceOrders } from "@/apis/orders";
import { getStoredAuthSession } from "@/lib/auth-login-storage";

export const merchantOrderKeys = {
  list: (workspaceId: string) => ["merchant-orders", workspaceId] as const,
  detail: (workspaceId: string, orderId: string) =>
    ["merchant-orders", workspaceId, orderId] as const,
};

function requireAccessToken(): string {
  const session = getStoredAuthSession();
  if (!session?.accessToken) {
    throw new Error("Sign in to view orders.");
  }
  return session.accessToken;
}

export function useMerchantOrders(workspaceId: string, enabled = true) {
  return useQuery({
    queryKey: merchantOrderKeys.list(workspaceId),
    enabled: enabled && Boolean(workspaceId),
    refetchInterval: 15_000,
    queryFn: async () => {
      const result = await listWorkspaceOrders(
        workspaceId,
        requireAccessToken(),
      );
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
  });
}

export function useMerchantOrder(
  workspaceId: string,
  orderId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: merchantOrderKeys.detail(workspaceId, orderId ?? ""),
    enabled: enabled && Boolean(workspaceId && orderId),
    queryFn: async () => {
      const result = await getWorkspaceOrder(
        workspaceId,
        orderId!,
        requireAccessToken(),
      );
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
  });
}
