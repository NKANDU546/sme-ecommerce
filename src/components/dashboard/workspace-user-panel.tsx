"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { logoutAction } from "@/actions/auth";
import {
  clearStoredAuthSession,
  getStoredAuthSession,
} from "@/lib/auth-login-storage";
import {
  SME_WORKSPACE_STORAGE_KEY,
  type StoredWorkspace,
} from "@/lib/workspace-id";

type WorkspaceUserPanelProps = {
  workspaceId: string;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function WorkspaceUserPanel({ workspaceId }: WorkspaceUserPanelProps) {
  const router = useRouter();
  const [stored, setStored] = useState<StoredWorkspace | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(SME_WORKSPACE_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as StoredWorkspace;
        if (parsed.workspaceId === workspaceId) setStored(parsed);
      } catch {
        /* ignore */
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [workspaceId]);

  const displayName = stored?.name?.trim() || "Merchant";
  const displayEmail = stored?.email?.trim() || "Workspace";

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const session = getStoredAuthSession();
    if (session?.refreshToken) {
      const result = await logoutAction(session.refreshToken);
      if (!result.ok) {
        toast.error(result.errorMessage, {
          description: "Your local session will still be cleared.",
        });
      }
    }

    clearStoredAuthSession();
    setIsLoggingOut(false);
    toast.success("Logged out");
    router.push("/signin");
  }

  return (
    <div className="mt-auto border-t border-primary-blue/10 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-blue/15 bg-primary-blue font-sans text-xs font-semibold text-white">
          {initials(displayName)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-sans text-sm font-semibold text-primary-blue">
            {displayName}
          </p>
          <p className="truncate font-sans text-xs text-muted-foreground">
            {displayEmail}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="mt-4 flex w-full cursor-pointer items-center justify-center rounded border border-primary-blue/15 px-3 py-2 font-sans text-xs font-semibold text-primary-blue transition-colors hover:bg-blue-gray/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoggingOut ? "Logging out..." : "Log out"}
      </button>
    </div>
  );
}
