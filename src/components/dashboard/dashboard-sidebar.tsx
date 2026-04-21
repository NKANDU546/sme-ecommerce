import Link from "next/link";
import { CopyWorkspaceUrl } from "@/components/dashboard/copy-workspace-url";
import { WorkspaceUserPanel } from "@/components/dashboard/workspace-user-panel";
import {
  DASHBOARD_SECTIONS,
  type DashboardNavId,
} from "@/lib/dashboard-nav";

function NavIcon({ name }: { name: (typeof DASHBOARD_SECTIONS)[number]["icon"] }) {
  const common = "h-5 w-5 shrink-0";
  switch (name) {
    case "grid":
      return (
        <svg className={common} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" d="M4 5h6v6H4V5zm10 0h6v6h-6V5zM4 13h6v6H4v-6zm10 0h6v6h-6v-6z" />
        </svg>
      );
    case "orders":
      return (
        <svg className={common} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" d="M9 5H5v4M15 5h4v4M9 19H5v-4M15 19h4v-4" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      );
    case "box":
      return (
        <svg className={common} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
          <path d="M4 8l8-4 8 4v8l-8 4-8-4V8z" />
          <path d="M4 8l8 4M12 12v8M20 8l-8 4" />
        </svg>
      );
    case "store":
      return (
        <svg className={common} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
          <path d="M4 10V20h16V10M4 10l2-6h12l2 6M4 10h16" />
        </svg>
      );
    case "users":
      return (
        <svg className={common} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
          <path d="M8 11a4 4 0 108 0 4 4 0 10-8 0zM4 20a6 6 0 0116 0" />
        </svg>
      );
    case "chart":
      return (
        <svg className={common} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" d="M4 19V5M8 19v-6M12 19V9M16 19v-4M20 19v-9" />
        </svg>
      );
    case "inventory":
      return (
        <svg className={common} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
          <path d="M4 7h16v10H4V7zM8 7V5h8v2" />
        </svg>
      );
    case "report":
      return (
        <svg className={common} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
          <path d="M6 4h9l3 3v13H6V4zM9 4v4h6M8 12h8M8 16h6" />
        </svg>
      );
    case "gear":
      return (
        <svg className={common} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="3" />
          <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );
    default:
      return null;
  }
}

type DashboardSidebarProps = {
  workspaceId: string;
  activeId: DashboardNavId;
  onSelect: (id: DashboardNavId) => void;
};

export function DashboardSidebar({
  workspaceId,
  activeId,
  onSelect,
}: DashboardSidebarProps) {
  return (
    <aside className="flex w-[min(100%,17rem)] shrink-0 flex-col border-r border-primary-blue/10 bg-white">
      <div className="border-b border-primary-blue/10 px-5 py-6">
        <Link href="/" className="block text-left">
          <p className="font-sans text-lg font-bold tracking-tight text-primary-blue">
            SME Operations
          </p>
          <p className="mt-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-blue/50">
            Merchant console
          </p>
        </Link>
        <div className="mt-4 flex items-center gap-2 rounded border border-primary-blue/10 bg-blue-gray/30 px-2 py-2">
          <p className="min-w-0 flex-1 truncate font-mono text-[10px] text-primary-blue/70" title={workspaceId}>
            {workspaceId.slice(0, 8)}…
          </p>
          <CopyWorkspaceUrl workspaceId={workspaceId} />
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4" aria-label="Workspace">
        {DASHBOARD_SECTIONS.map(({ id, label, icon }) => {
          const active = id === activeId;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left font-sans text-sm transition-colors ${
                active
                  ? "bg-blue-gray/70 font-medium text-primary-blue"
                  : "text-primary-blue/55 hover:bg-blue-gray/40 hover:text-primary-blue/80"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <NavIcon name={icon} />
              {label}
            </button>
          );
        })}
      </nav>

      <WorkspaceUserPanel workspaceId={workspaceId} />
    </aside>
  );
}
