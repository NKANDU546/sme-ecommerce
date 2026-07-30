"use client";

import Link from "next/link";
import { useMemo } from "react";
import { StorefrontProductDetailView } from "@/components/storefront/storefront-product-detail-view";
import { StorefrontThemeRoot } from "@/components/storefront/storefront-theme-root";
import { useProduct } from "@/hooks/use-products";
import { usePreviewStorefrontConfig } from "@/hooks/use-preview-storefront-config";
import { enrichCatalogProductForPdp } from "@/lib/catalog-product-pdp";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import { productApiToCatalog } from "@/lib/product-mapper";

type ProductDetailClientProps = {
  workspaceId: string;
  productId: string;
};

export function ProductDetailClient({
  workspaceId,
  productId,
}: ProductDetailClientProps) {
  const storefront = usePreviewStorefrontConfig(workspaceId);
  const accessToken = getStoredAuthSession()?.accessToken ?? null;
  const productQuery = useProduct(workspaceId, productId, accessToken);

  const product = useMemo(() => {
    if (!productQuery.data) return null;
    return productApiToCatalog(productQuery.data);
  }, [productQuery.data]);

  if (storefront.status === "loading" || productQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-sans text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (storefront.status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <h1 className="font-serif text-2xl text-primary-blue">
          Sign in to preview
        </h1>
        <Link
          href="/signin"
          className="mt-2 font-sans text-sm font-semibold text-primary-blue underline"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  if (storefront.status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <h1 className="font-serif text-2xl text-primary-blue">
          No storefront draft
        </h1>
        <p className="max-w-md font-sans text-sm text-muted-foreground">
          {storefront.message}
        </p>
        <Link
          href={`/dashboard/${workspaceId}`}
          className="mt-2 font-sans text-sm font-semibold text-primary-blue underline"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  const config = storefront.config;

  if (productQuery.isError || !product) {
    return (
      <StorefrontThemeRoot config={config}>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[color:var(--sf-page-bg)] px-6 text-center">
          <h1 className="font-serif text-2xl text-[color:var(--sf-accent)]">
            Product not found
          </h1>
          <Link
            href={`/preview/${workspaceId}/shop`}
            className="font-sans text-sm font-semibold text-[color:var(--sf-accent)] underline"
          >
            Back to shop collection
          </Link>
        </div>
      </StorefrontThemeRoot>
    );
  }

  const pdp = enrichCatalogProductForPdp(product);

  return (
    <StorefrontThemeRoot config={config}>
      <StorefrontProductDetailView
        workspaceId={workspaceId}
        config={config}
        product={pdp}
      />
    </StorefrontThemeRoot>
  );
}
