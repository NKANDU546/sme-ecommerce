"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getStorefrontDraft,
  resetStorefrontDraft,
  updateStorefrontDraft,
} from "@/apis/storefronts";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import {
  configToUpdateDraftBody,
  storefrontDraftToConfig,
} from "@/lib/storefront-draft-mapper";
import type { StorefrontConfig } from "@/types/storefront";
import type { StorefrontDraft } from "@/types/workspace";

export function storefrontDraftQueryKey(workspaceId: string) {
  return ["storefront-draft", workspaceId] as const;
}

function requireAccessToken(): string {
  const session = getStoredAuthSession();
  if (!session?.accessToken) {
    throw new Error("Sign in to load your storefront draft.");
  }
  return session.accessToken;
}

export type StorefrontDraftView = {
  draft: StorefrontDraft;
  config: StorefrontConfig;
};

export function useStorefrontDraft(workspaceId: string, enabled = true) {
  return useQuery({
    queryKey: storefrontDraftQueryKey(workspaceId),
    enabled: enabled && Boolean(workspaceId),
    queryFn: async (): Promise<StorefrontDraftView> => {
      const result = await getStorefrontDraft(
        workspaceId,
        requireAccessToken(),
      );
      if (!result.ok) {
        throw new Error(result.errorMessage);
      }
      return {
        draft: result.data,
        config: storefrontDraftToConfig(result.data),
      };
    },
  });
}

export function useSaveStorefrontDraft(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      config: StorefrontConfig;
      templateVersion: number;
    }): Promise<StorefrontDraftView> => {
      const body = configToUpdateDraftBody(
        input.config,
        input.templateVersion,
      );
      const result = await updateStorefrontDraft(
        workspaceId,
        requireAccessToken(),
        body,
      );
      if (!result.ok) {
        throw new Error(result.errorMessage);
      }
      return {
        draft: result.data,
        config: storefrontDraftToConfig(result.data),
      };
    },
    onSuccess: (view) => {
      queryClient.setQueryData(storefrontDraftQueryKey(workspaceId), view);
    },
  });
}

export function useResetStorefrontDraft(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input?: {
      templateId?: string;
      templateVersion?: number;
    }): Promise<StorefrontDraftView> => {
      const result = await resetStorefrontDraft(
        workspaceId,
        requireAccessToken(),
        {
          templateId: input?.templateId ?? "classic-boutique",
          templateVersion: input?.templateVersion ?? 1,
        },
      );
      if (!result.ok) {
        throw new Error(result.errorMessage);
      }
      return {
        draft: result.data,
        config: storefrontDraftToConfig(result.data),
      };
    },
    onSuccess: (view) => {
      queryClient.setQueryData(storefrontDraftQueryKey(workspaceId), view);
    },
  });
}
