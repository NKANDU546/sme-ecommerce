import type { Metadata } from "next";
import { PreviewClient } from "@/app/preview/[workspaceId]/preview-client";

type PageProps = {
  params: Promise<{ workspaceId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { workspaceId } = await params;
  return {
    title: `Store preview · ${workspaceId.slice(0, 8)}…`,
    robots: { index: false, follow: false },
  };
}

export default async function StorePreviewPage({ params }: PageProps) {
  const { workspaceId } = await params;
  return <PreviewClient workspaceId={workspaceId} />;
}
