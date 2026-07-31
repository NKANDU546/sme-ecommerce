"use client";

import type { ReactNode } from "react";
import { PreviewCartDrawer } from "@/components/storefront/preview-cart-drawer";
import { ApiCartProvider } from "@/contexts/api-cart-context";
import { publicStorefrontBasePath } from "@/lib/preview-shop-href";

type PublicStoreCartLayoutClientProps = {
  storeSlug: string;
  children: ReactNode;
};

export function PublicStoreCartLayoutClient({
  storeSlug,
  children,
}: PublicStoreCartLayoutClientProps) {
  const basePath = publicStorefrontBasePath(storeSlug);
  return (
    <ApiCartProvider storeSlug={storeSlug}>
      {children}
      <PreviewCartDrawer basePath={basePath} />
    </ApiCartProvider>
  );
}
