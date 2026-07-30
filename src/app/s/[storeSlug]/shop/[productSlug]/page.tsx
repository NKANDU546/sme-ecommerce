import { PublicProductDetailClient } from "@/app/s/[storeSlug]/shop/[productSlug]/public-product-detail-client";

type PageProps = {
  params: Promise<{ storeSlug: string; productSlug: string }>;
};

export default async function PublicProductDetailPage({ params }: PageProps) {
  const { storeSlug, productSlug } = await params;
  return (
    <PublicProductDetailClient
      storeSlug={storeSlug}
      productSlug={productSlug}
    />
  );
}
