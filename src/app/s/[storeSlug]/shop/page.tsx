import { PublicShopClient } from "@/app/s/[storeSlug]/shop/public-shop-client";

type PageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function PublicShopPage({ params }: PageProps) {
  const { storeSlug } = await params;
  return <PublicShopClient storeSlug={storeSlug} />;
}
