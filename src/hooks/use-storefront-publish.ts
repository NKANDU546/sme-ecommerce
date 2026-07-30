"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getPublishHistory,
  getPublishedStorefront,
  publishStorefront,
  unpublishStorefront,
} from "@/apis/storefronts";
import { workspaceQueryKey, workspacesQueryKey } from "@/hooks/use-workspaces";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import type {
  PublishHistoryItem,
  PublishResult,
  PublishedStorefront,
  UnpublishResult,
} from "@/types/workspace";

export function publishedStorefrontQueryKey(workspaceId: string) {
  return ["storefront-published", workspaceId] as const;
}

export function publishHistoryQueryKey(workspaceId: string) {
  return ["storefront-publish-history", workspaceId] as const;
}

function requireAccessToken(): string {
  const session = getStoredAuthSession();
  if (!session?.accessToken) {
    throw new Error("Sign in to manage publishing.");
  }
  return session.accessToken;
}

function isNotPublishedYet(errorCode?: string, status?: number): boolean {
  return (
    errorCode === "PUBLISHED_STOREFRONT_NOT_FOUND" || status === 404
  );
}

/** Latest published snapshot, or `null` if nothing has been published yet. */
export function usePublishedStorefront(workspaceId: string, enabled = true) {
  return useQuery({
    queryKey: publishedStorefrontQueryKey(workspaceId),
    enabled: enabled && Boolean(workspaceId),
    queryFn: async (): Promise<PublishedStorefront | null> => {
      const result = await getPublishedStorefront(
        workspaceId,
        requireAccessToken(),
      );
      if (!result.ok) {
        if (isNotPublishedYet(result.errorCode, result.status)) {
          return null;
        }
        throw new Error(result.errorMessage);
      }
      return result.data;
    },
  });
}

export function usePublishHistory(workspaceId: string, enabled = true) {
  return useQuery({
    queryKey: publishHistoryQueryKey(workspaceId),
    enabled: enabled && Boolean(workspaceId),
    queryFn: async (): Promise<PublishHistoryItem[]> => {
      const result = await getPublishHistory(workspaceId, requireAccessToken());
      if (!result.ok) {
        throw new Error(result.errorMessage);
      }
      return result.data;
    },
  });
}

export function usePublishStorefront(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input?: {
      notes?: string;
    }): Promise<PublishResult> => {
      const result = await publishStorefront(
        workspaceId,
        requireAccessToken(),
        { confirm: true, notes: input?.notes },
      );
      if (!result.ok) {
        throw new Error(result.errorMessage);
      }
      return result.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: publishedStorefrontQueryKey(workspaceId),
        }),
        queryClient.invalidateQueries({
          queryKey: publishHistoryQueryKey(workspaceId),
        }),
        queryClient.invalidateQueries({
          queryKey: workspaceQueryKey(workspaceId),
        }),
        queryClient.invalidateQueries({ queryKey: workspacesQueryKey }),
      ]);
    },
  });
}

export function useUnpublishStorefront(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<UnpublishResult> => {
      const result = await unpublishStorefront(
        workspaceId,
        requireAccessToken(),
      );
      if (!result.ok) {
        throw new Error(result.errorMessage);
      }
      return result.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: publishedStorefrontQueryKey(workspaceId),
        }),
        queryClient.invalidateQueries({
          queryKey: publishHistoryQueryKey(workspaceId),
        }),
        queryClient.invalidateQueries({
          queryKey: workspaceQueryKey(workspaceId),
        }),
        queryClient.invalidateQueries({ queryKey: workspacesQueryKey }),
      ]);
    },
  });
}
