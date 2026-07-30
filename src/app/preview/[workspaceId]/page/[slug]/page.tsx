import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ workspaceId: string; slug: string }>;
};

/** Legacy `/page/{slug}` preview URLs redirect to `/{slug}`. */
export default async function LegacyCustomPreviewPageRedirect({
  params,
}: PageProps) {
  const { workspaceId, slug } = await params;
  redirect(`/preview/${workspaceId}/${slug}`);
}
