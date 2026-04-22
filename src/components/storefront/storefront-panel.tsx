"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StorefrontEditor } from "@/components/storefront/storefront-editor";
import { StorefrontTemplateView } from "@/components/storefront/storefront-template-view";
import { WorkspaceEmptyState } from "@/components/dashboard/workspace-empty-state";
import {
  createInitialStorefrontFromSeed,
  loadStorefront,
  saveStorefront,
} from "@/lib/storefront-storage";
import type { StorefrontConfig } from "@/types/storefront";

type StorefrontPanelProps = {
  workspaceId: string;
};

export function StorefrontPanel({ workspaceId }: StorefrontPanelProps) {
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConfig(loadStorefront(workspaceId));
    setHydrated(true);
  }, [workspaceId]);

  const persist = useCallback(
    (next: StorefrontConfig) => {
      const stamped = { ...next, updatedAt: Date.now() };
      setConfig(stamped);
      saveStorefront(workspaceId, stamped);
    },
    [workspaceId],
  );

  function startFromTemplate() {
    const initial = createInitialStorefrontFromSeed();
    persist(initial);
  }

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16 font-sans text-sm text-muted-foreground">
        Loading storefront…
      </div>
    );
  }

  if (!config) {
    return (
      <WorkspaceEmptyState
        title="No storefront yet"
        description="Start from our default boutique-style layout. You can edit copy, colours, WhatsApp details, and placeholder products—everything stays in this browser until your API is ready."
      >
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={startFromTemplate}
            className="inline-flex items-center justify-center bg-primary-blue px-5 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-primary-blue/90"
          >
            Use default template
          </button>
        </div>
      </WorkspaceEmptyState>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
      <aside className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-b border-primary-blue/10 bg-white max-lg:max-h-[min(48vh,22rem)] lg:w-[min(100%,22rem)] lg:border-b-0 lg:border-r">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-primary-blue/10 px-5 py-4">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary-blue/55">
            Customize
          </p>
          <Link
            href={`/preview/${workspaceId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-xs font-medium text-primary-blue underline decoration-primary-blue/30 underline-offset-2 hover:decoration-primary-blue"
          >
            Open customer preview
          </Link>
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-5 pb-4 pt-2">
          <StorefrontEditor config={config} onChange={persist} />
        </div>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-blue-gray/30">
        <p className="border-b border-primary-blue/10 bg-white/80 px-4 py-2 text-center font-sans text-[11px] uppercase tracking-[0.14em] text-primary-blue/50">
          Live preview · template: {config.templateId}
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <StorefrontTemplateView config={config} />
        </div>
      </div>
    </div>
  );
}
