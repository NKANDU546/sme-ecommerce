import { DashboardWorkspaceClient } from "@/components/dashboard/dashboard-workspace-client";

type DashboardShellProps = {
  workspaceId: string;
};

export function DashboardShell({ workspaceId }: DashboardShellProps) {
  return <DashboardWorkspaceClient workspaceId={workspaceId} />;
}
