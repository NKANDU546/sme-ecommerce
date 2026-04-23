import type { Metadata } from "next";
import { ProductDetailClient } from "@/app/preview/[workspaceId]/shop/[productId]/product-detail-client";

type PageProps = {
  params: Promise<{ workspaceId: string; productId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { workspaceId, productId } = await params;
  return {
    title: `Product · ${productId} · ${workspaceId.slice(0, 8)}…`,
    robots: { index: false, follow: false },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { workspaceId, productId } = await params;
  return (
    <ProductDetailClient workspaceId={workspaceId} productId={productId} />
  );
}
