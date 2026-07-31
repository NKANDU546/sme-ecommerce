import { PublicOrderTrackClient } from "@/app/s/[storeSlug]/orders/track/public-order-track-client";

type PageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function PublicOrderTrackPage({ params }: PageProps) {
  const { storeSlug } = await params;
  return <PublicOrderTrackClient storeSlug={storeSlug} />;
}
