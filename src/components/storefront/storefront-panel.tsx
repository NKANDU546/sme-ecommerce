"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  StorefrontEditor,
  type StorefrontCustomizeMode,
} from "@/components/storefront/storefront-editor";
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
  const [customizeMode, setCustomizeMode] =
    useState<StorefrontCustomizeMode>("sections");

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

  const asideMobileHeightClass =
    customizeMode === "section"
      ? "max-lg:min-h-0 max-lg:max-h-[calc(100dvh-6rem)] max-lg:flex-1"
      : "max-lg:max-h-[min(60dvh,28rem)]";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
      <aside
        className={`flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-b border-primary-blue/10 bg-white ${asideMobileHeightClass} lg:sticky lg:top-0 lg:z-20 lg:max-h-[calc(100dvh-6rem)] lg:w-[min(100%,22rem)] lg:self-start lg:border-b-0 lg:border-r`}
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-primary-blue/10 px-5 py-4">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary-blue/55">
            Customize
          </p>
          <Link
            href={`/preview/${workspaceId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden font-sans text-xs font-medium text-primary-blue underline decoration-primary-blue/30 underline-offset-2 hover:decoration-primary-blue lg:inline"
          >
            Open customer preview
          </Link>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pt-2">
          <StorefrontEditor
            config={config}
            onChange={persist}
            previewHref={`/preview/${workspaceId}`}
            onCustomizeModeChange={setCustomizeMode}
          />
        </div>
        <footer
          className={`sticky bottom-0 z-10 shrink-0 border-t border-primary-blue/10 bg-white/95 px-5 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/85 ${
            customizeMode === "section" ? "max-lg:hidden" : ""
          }`}
        >
          <p className="font-sans text-[11px] leading-relaxed text-muted-foreground">
            Edits save automatically in this browser until your API is ready.
          </p>
          <Link
            href={`/preview/${workspaceId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex font-sans text-xs font-semibold text-primary-blue underline decoration-primary-blue/30 underline-offset-2 hover:decoration-primary-blue lg:hidden"
          >
            Open customer preview
          </Link>
        </footer>
      </aside>
      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-blue-gray/30 ${
          customizeMode === "section" ? "max-lg:hidden" : ""
        }`}
      >
        <p className="sticky top-0 z-10 shrink-0 border-b border-primary-blue/10 bg-white/90 px-4 py-2 text-center font-sans text-[11px] uppercase tracking-[0.14em] text-primary-blue/50 backdrop-blur supports-[backdrop-filter]:bg-white/75">
          Live preview · template: {config.templateId}
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <StorefrontTemplateView config={config} workspaceId={workspaceId} />
        </div>
        <footer className="shrink-0 border-t border-primary-blue/10 bg-white px-4 py-2.5 text-center font-sans text-[11px] leading-snug text-primary-blue/55">
          <span className="font-medium text-primary-blue/70">
            {config.shopName}
          </span>
          <span className="mx-1.5 text-primary-blue/30" aria-hidden>
            ·
          </span>
          <span>{config.copyrightLine}</span>
        </footer>
      </div>
    </div>
  );
}
