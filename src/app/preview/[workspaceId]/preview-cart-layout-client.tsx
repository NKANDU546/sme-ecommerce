"use client";

import type { ReactNode } from "react";
import { PreviewCartDrawer } from "@/components/storefront/preview-cart-drawer";
import { PreviewCartProvider } from "@/contexts/preview-cart-context";

type PreviewCartLayoutClientProps = {
  workspaceId: string;
  children: ReactNode;
};

export function PreviewCartLayoutClient({
  workspaceId,
  children,
}: PreviewCartLayoutClientProps) {
  return (
    <PreviewCartProvider workspaceId={workspaceId}>
      {children}
      <PreviewCartDrawer />
    </PreviewCartProvider>
  );
}
