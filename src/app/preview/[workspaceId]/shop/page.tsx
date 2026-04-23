import type { Metadata } from "next";
import { ShopCollectionClient } from "@/app/preview/[workspaceId]/shop/shop-collection-client";

type PageProps = {
  params: Promise<{ workspaceId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { workspaceId } = await params;
  return {
    title: `Shop collection · ${workspaceId.slice(0, 8)}…`,
    robots: { index: false, follow: false },
  };
}

export default async function ShopCollectionPage({ params }: PageProps) {
  const { workspaceId } = await params;
  return <ShopCollectionClient workspaceId={workspaceId} />;
}
