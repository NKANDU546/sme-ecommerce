import { PreviewCartLayoutClient } from "@/app/preview/[workspaceId]/preview-cart-layout-client";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
};

export default async function PreviewWorkspaceLayout({
  children,
  params,
}: LayoutProps) {
  const { workspaceId } = await params;
  return (
    <PreviewCartLayoutClient workspaceId={workspaceId}>
      {children}
    </PreviewCartLayoutClient>
  );
}
