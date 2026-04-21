import Link from "next/link";
import type { ReactNode } from "react";
import type {
  DashboardNavId,
  DashboardSectionAction,
} from "@/lib/dashboard-nav";

export type WorkspaceEmptyStateProps = {
  title: string;
  description: string;
  /** Extra controls (e.g. custom setup buttons) rendered after the description */
  children?: ReactNode;
  action?: DashboardSectionAction;
  /** Used when `action.kind === "section"` to switch dashboard tab */
  onNavigateSection?: (section: DashboardNavId) => void;
  className?: string;
};

export function WorkspaceEmptyState({
  title,
  description,
  children,
  action,
  onNavigateSection,
  className = "",
}: WorkspaceEmptyStateProps) {
  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center px-6 py-12 sm:py-16 ${className}`}
    >
      <div className="w-full max-w-md rounded-lg border border-primary-blue/12 bg-white px-6 py-10 text-center shadow-sm sm:px-8 sm:py-12">
        <h2 className="font-serif text-2xl font-light text-primary-blue sm:text-3xl">
          {title}
        </h2>
        <p className="mt-4 font-sans text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
        {children ? <div className="mt-6">{children}</div> : null}
        {action ? (
          <div className="mt-8">
            <EmptyStateActionControl
              action={action}
              onNavigateSection={onNavigateSection}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EmptyStateActionControl({
  action,
  onNavigateSection,
}: {
  action: DashboardSectionAction;
  onNavigateSection?: (section: DashboardNavId) => void;
}) {
  if (action.kind === "href") {
    return (
      <Link
        href={action.href}
        className="inline-flex items-center justify-center bg-primary-blue px-5 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-primary-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
      >
        {action.label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onNavigateSection?.(action.section)}
      className="inline-flex items-center justify-center bg-primary-blue px-5 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-primary-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
    >
      {action.label}
    </button>
  );
}
