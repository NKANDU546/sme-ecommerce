import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

type PageProps = {
  params: Promise<{ workspaceId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { workspaceId } = await params;
  return {
    title: `Workspace ${workspaceId.slice(0, 8)}… | SME Operations`,
    description: "Your SME Operations merchant workspace.",
  };
}

export default async function WorkspaceDashboardPage({ params }: PageProps) {
  const { workspaceId } = await params;
  return <DashboardShell workspaceId={workspaceId} />;
}
