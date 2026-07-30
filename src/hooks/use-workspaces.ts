"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { listWorkspaces, getWorkspace } from "@/apis/workspaces";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import type { Workspace } from "@/types/workspace";

export const workspacesQueryKey = ["workspaces"] as const;

export function workspaceQueryKey(workspaceId: string) {
  return ["workspace", workspaceId] as const;
}

function requireAccessToken(): string {
  const session = getStoredAuthSession();
  if (!session?.accessToken) {
    throw new Error("Sign in to load your workspaces.");
  }
  return session.accessToken;
}

export function useWorkspaces(enabled = true) {
  return useQuery({
    queryKey: workspacesQueryKey,
    enabled,
    queryFn: async (): Promise<Workspace[]> => {
      const result = await listWorkspaces(requireAccessToken());
      if (!result.ok) {
        throw new Error(result.errorMessage);
      }
      return result.data;
    },
  });
}

export function useWorkspace(workspaceId: string, enabled = true) {
  return useQuery({
    queryKey: workspaceQueryKey(workspaceId),
    enabled: enabled && Boolean(workspaceId),
    queryFn: async (): Promise<Workspace> => {
      const result = await getWorkspace(workspaceId, requireAccessToken());
      if (!result.ok) {
        throw new Error(result.errorMessage);
      }
      return result.data;
    },
  });
}

/** Resolve the merchant's primary workspace (auto-created on first list). */
export function useEnsurePrimaryWorkspace(enabled = true) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<Workspace> => {
      const result = await listWorkspaces(requireAccessToken());
      if (!result.ok) {
        throw new Error(result.errorMessage);
      }
      const primary = result.data[0];
      if (!primary) {
        throw new Error("No workspace is available for this account yet.");
      }
      return primary;
    },
    onSuccess: (workspace) => {
      queryClient.setQueryData(workspacesQueryKey, [workspace]);
      queryClient.setQueryData(workspaceQueryKey(workspace.id), workspace);
    },
  });
}
