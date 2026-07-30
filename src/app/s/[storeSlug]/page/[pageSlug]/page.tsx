import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ storeSlug: string; pageSlug: string }>;
};

/** Legacy `/page/{slug}` URLs redirect to `/{slug}`. */
export default async function LegacyPublicCustomPageRedirect({
  params,
}: PageProps) {
  const { storeSlug, pageSlug } = await params;
  redirect(`/s/${storeSlug}/${pageSlug}`);
}
