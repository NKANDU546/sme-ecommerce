import { PublicCustomPageClient } from "@/app/s/[storeSlug]/[pageSlug]/public-custom-page-client";

type PageProps = {
  params: Promise<{ storeSlug: string; pageSlug: string }>;
};

export default async function PublicCustomPageRoute({ params }: PageProps) {
  const { storeSlug, pageSlug } = await params;
  return <PublicCustomPageClient storeSlug={storeSlug} pageSlug={pageSlug} />;
}
