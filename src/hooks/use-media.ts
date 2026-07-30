"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteMedia, listMedia } from "@/apis/media";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import { uploadWorkspaceImage } from "@/lib/media-upload";
import type { ListMediaParams } from "@/types/media";

export const mediaKeys = {
  all: (workspaceId: string) => ["media", workspaceId] as const,
  list: (workspaceId: string, params: ListMediaParams) =>
    ["media", workspaceId, "list", params] as const,
};

function requireAccessToken(): string {
  const session = getStoredAuthSession();
  if (!session?.accessToken) {
    throw new Error("Sign in to manage media.");
  }
  return session.accessToken;
}

export function useMediaLibrary(
  workspaceId: string | null | undefined,
  params: ListMediaParams = { type: "image", page: 0, limit: 40 },
  enabled = true,
) {
  return useQuery({
    queryKey: mediaKeys.list(workspaceId ?? "", params),
    enabled: enabled && Boolean(workspaceId),
    queryFn: async () => {
      const result = await listMedia(
        workspaceId!,
        requireAccessToken(),
        params,
      );
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
  });
}

export function useUploadMedia(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const result = await uploadWorkspaceImage(
        workspaceId,
        requireAccessToken(),
        file,
      );
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: mediaKeys.all(workspaceId),
      });
    },
  });
}

export function useDeleteMedia(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mediaId: string) => {
      const result = await deleteMedia(
        workspaceId,
        mediaId,
        requireAccessToken(),
      );
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: mediaKeys.all(workspaceId),
      });
    },
  });
}
