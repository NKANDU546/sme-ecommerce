"use client";

import Link from "next/link";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { WorkspaceEmptyState } from "@/components/dashboard/workspace-empty-state";
import { ProductsPanel } from "@/components/dashboard/products-panel";
import { StorefrontPanel } from "@/components/storefront/storefront-panel";
import {
  DASHBOARD_NAV_IDS,
  getDashboardSection,
  type DashboardNavId,
} from "@/lib/dashboard-nav";

type DashboardWorkspaceClientProps = {
  workspaceId: string;
};

export function DashboardWorkspaceClient({
  workspaceId,
}: DashboardWorkspaceClientProps) {
  const [activeId, setActiveId] = useQueryState(
    "section",
    parseAsStringLiteral(DASHBOARD_NAV_IDS)
      .withDefault("dashboard")
      .withOptions({ history: "push", shallow: true }),
  );
  const section = getDashboardSection(activeId);

  function selectNav(id: DashboardNavId) {
    void setActiveId(id);
  }

  const showWorkspaceSidebar = activeId !== "storefront";

  return (
    <div className="relative flex min-h-screen bg-background">
      {showWorkspaceSidebar ? (
        <DashboardSidebar
          workspaceId={workspaceId}
          activeId={activeId}
          onSelect={selectNav}
        />
      ) : null}

      <div
        className={
          activeId === "storefront" || activeId === "products"
            ? "flex h-dvh max-h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
            : "flex min-h-0 min-w-0 flex-1 flex-col"
        }
      >
        <header className="shrink-0 flex flex-wrap items-center justify-between gap-4 border-b border-primary-blue/10 bg-white px-5 py-4 sm:px-8">
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-xl font-light text-primary-blue sm:text-2xl">
              {section.panelTitle}
            </h1>
            <p className="mt-0.5 font-sans text-sm text-muted-foreground">
              {section.panelSubtitle}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {activeId === "storefront" ? (
              <button
                type="button"
                onClick={() => selectNav("dashboard")}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-primary-blue/15 text-primary-blue transition-colors hover:bg-blue-gray/40"
                aria-label="Back to dashboard"
                title="Back to dashboard"
              >
                <svg
                  aria-hidden
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 12h16.5M10.5 5.25 3.75 12l6.75 6.75"
                  />
                </svg>
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
        ) : activeId === "products" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <ProductsPanel workspaceId={workspaceId} />
          </div>
        ) : (
          <WorkspaceEmptyState
            title={section.empty.title}
            description={section.empty.description}
            action={section.empty.action}
            onNavigateSection={selectNav}
          />
        )}
      </div>
    </div>
  );
}
