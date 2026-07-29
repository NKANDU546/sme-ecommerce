import type { Metadata } from "next";
import { PublicStorefrontHomeClient } from "@/app/s/[storeSlug]/public-storefront-home-client";
import { getPublicStorefront } from "@/apis/public-storefront";

type PageProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  const result = await getPublicStorefront(storeSlug);
  if (!result.ok) {
    return { title: "Store not found" };
  }
  const seo = result.data.seo;
  return {
    title: seo?.title || result.data.storeName,
    description: seo?.description || undefined,
    openGraph: seo?.imageUrl
      ? { images: [{ url: seo.imageUrl }] }
      : undefined,
  };
}

export default async function PublicStorefrontHomePage({ params }: PageProps) {
  const { storeSlug } = await params;
  return <PublicStorefrontHomeClient storeSlug={storeSlug} />;
}
