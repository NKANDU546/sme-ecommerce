import { PublicCartCheckoutClient } from "@/app/s/[storeSlug]/cart/public-cart-checkout-client";

type PageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function PublicCartPage({ params }: PageProps) {
  const { storeSlug } = await params;
  return <PublicCartCheckoutClient storeSlug={storeSlug} />;
}
