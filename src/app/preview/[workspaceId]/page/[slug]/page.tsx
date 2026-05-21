import type { Metadata } from "next";
import { CustomPageClient } from "@/app/preview/[workspaceId]/page/[slug]/custom-page-client";

type PageProps = {
  params: Promise<{ workspaceId: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { workspaceId, slug } = await params;
  return {
    title: `${slug} · ${workspaceId.slice(0, 8)}…`,
    robots: { index: false, follow: false },
  };
}

export default async function CustomPreviewPage({ params }: PageProps) {
  const { workspaceId, slug } = await params;
  return <CustomPageClient workspaceId={workspaceId} slug={slug} />;
}
