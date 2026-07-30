"use client";

import { useStorefrontDraft } from "@/hooks/use-storefront-draft";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import type { StorefrontConfig } from "@/types/storefront";

export type PreviewStorefrontLoad =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "error"; message: string }
  | { status: "ready"; config: StorefrontConfig };

/** Shared draft loader for merchant preview routes (Step 01 backend draft API). */
export function usePreviewStorefrontConfig(
  workspaceId: string,
): PreviewStorefrontLoad {
  const signedIn = Boolean(getStoredAuthSession()?.accessToken);
  const draftQuery = useStorefrontDraft(workspaceId, signedIn);

  if (!signedIn) {
    return { status: "unauthenticated" };
  }
  if (draftQuery.isLoading) {
    return { status: "loading" };
  }
  if (draftQuery.isError || !draftQuery.data) {
    return {
      status: "error",
      message:
        draftQuery.error instanceof Error
          ? draftQuery.error.message
          : "The storefront draft could not be loaded.",
    };
  }
  return { status: "ready", config: draftQuery.data.config };
}
