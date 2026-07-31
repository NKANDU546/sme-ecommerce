import type { ReactNode } from "react";
import { PublicStoreCartLayoutClient } from "@/app/s/[storeSlug]/public-store-cart-layout-client";

type PublicStoreLayoutProps = {
  children: ReactNode;
  params: Promise<{ storeSlug: string }>;
};

export default async function PublicStoreLayout({
  children,
  params,
}: PublicStoreLayoutProps) {
  const { storeSlug } = await params;
  return (
    <PublicStoreCartLayoutClient storeSlug={storeSlug}>
      {children}
    </PublicStoreCartLayoutClient>
  );
}
