"use client";

import { useEffect, useState } from "react";
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
  const [stored, setStored] = useState<StoredWorkspace | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SME_WORKSPACE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredWorkspace;
      if (parsed.workspaceId === workspaceId) setStored(parsed);
    } catch {
      /* ignore */
    }
  }, [workspaceId]);

  const displayName = stored?.name?.trim() || "Merchant";
  const displayEmail = stored?.email?.trim() || "Workspace";

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
    </div>
  );
}
