"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { WorkspaceEmptyState } from "@/components/dashboard/workspace-empty-state";
import { StorefrontPanel } from "@/components/storefront/storefront-panel";
import {
  getDashboardSection,
  type DashboardNavId,
} from "@/lib/dashboard-nav";

type DashboardWorkspaceClientProps = {
  workspaceId: string;
};

export function DashboardWorkspaceClient({
  workspaceId,
}: DashboardWorkspaceClientProps) {
  const [activeId, setActiveId] = useState<DashboardNavId>("dashboard");
  /** When false on Storefront, the workspace sidebar is hidden for a wider editor. */
  const [workspaceRailOpen, setWorkspaceRailOpen] = useState(true);
  const section = getDashboardSection(activeId);

  useEffect(() => {
    if (activeId === "storefront") setWorkspaceRailOpen(false);
    else setWorkspaceRailOpen(true);
  }, [activeId]);

  const showWorkspaceSidebar =
    activeId !== "storefront" || workspaceRailOpen;

  return (
    <div className="relative flex min-h-screen bg-background">
      {showWorkspaceSidebar ? (
        <DashboardSidebar
          workspaceId={workspaceId}
          activeId={activeId}
          onSelect={setActiveId}
        />
      ) : null}

      {activeId === "storefront" && !workspaceRailOpen ? (
        <button
          type="button"
          onClick={() => setWorkspaceRailOpen(true)}
          className="fixed left-3 top-[4.5rem] z-[60] rounded border border-primary-blue/20 bg-white px-3 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-blue shadow-md transition-colors hover:bg-blue-gray/50 sm:left-4 sm:top-20"
        >
          Workspace menu
        </button>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-primary-blue/10 bg-white px-5 py-4 sm:px-8">
          <div>
            <h1 className="font-serif text-xl font-light text-primary-blue sm:text-2xl">
              {section.panelTitle}
            </h1>
            <p className="mt-0.5 font-sans text-sm text-muted-foreground">
              {section.panelSubtitle}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {activeId === "storefront" && workspaceRailOpen ? (
              <button
                type="button"
                onClick={() => setWorkspaceRailOpen(false)}
                className="font-sans text-sm font-medium text-primary-blue underline decoration-primary-blue/30 underline-offset-4 transition-colors hover:decoration-primary-blue"
              >
                Focus editor
              </button>
            ) : null}
            {activeId === "storefront" ? (
              <Link
                href={`/preview/${workspaceId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm font-medium text-primary-blue underline decoration-primary-blue/30 underline-offset-4 transition-colors hover:decoration-primary-blue"
              >
                Customer preview
              </Link>
            ) : null}
            {section.showHeaderCta ? (
              <button
                type="button"
                className="bg-primary-blue px-4 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-primary-blue/90"
              >
                {section.headerCtaLabel ?? "New order"}
              </button>
            ) : null}
          </div>
        </header>
        {activeId === "storefront" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <StorefrontPanel workspaceId={workspaceId} />
          </div>
        ) : (
          <WorkspaceEmptyState
            title={section.empty.title}
            description={section.empty.description}
            action={section.empty.action}
            onNavigateSection={setActiveId}
          />
        )}
      </div>
    </div>
  );
}
