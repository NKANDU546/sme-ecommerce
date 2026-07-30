"use client";

import Link from "next/link";
import { useMemo } from "react";
import { StorefrontProductDetailView } from "@/components/storefront/storefront-product-detail-view";
import { StorefrontThemeRoot } from "@/components/storefront/storefront-theme-root";
import {
  usePublicProduct,
  usePublicStorefront,
} from "@/hooks/use-public-storefront";
import { enrichCatalogProductForPdp } from "@/lib/catalog-product-pdp";
import { publicStorefrontBasePath } from "@/lib/preview-shop-href";
import { productApiToCatalog } from "@/lib/product-mapper";

type PublicProductDetailClientProps = {
  storeSlug: string;
  productSlug: string;
};

export function PublicProductDetailClient({
  storeSlug,
  productSlug,
}: PublicProductDetailClientProps) {
  const basePath = publicStorefrontBasePath(storeSlug);
  const storefrontQuery = usePublicStorefront(storeSlug);
  const productQuery = usePublicProduct(storeSlug, productSlug);

  const product = useMemo(() => {
    if (!productQuery.data) return null;
    return productApiToCatalog(productQuery.data);
  }, [productQuery.data]);

  if (storefrontQuery.isLoading || productQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-sans text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (storefrontQuery.isError || !storefrontQuery.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <h1 className="font-serif text-2xl text-primary-blue">
          Store not available
        </h1>
        <p className="max-w-md font-sans text-sm text-muted-foreground">
          {storefrontQuery.error instanceof Error
            ? storefrontQuery.error.message
            : "This storefront is unpublished or does not exist."}
        </p>
      </div>
    );
  }

  const config = storefrontQuery.data.config;

  if (productQuery.isError || !product) {
    return (
      <StorefrontThemeRoot config={config}>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[color:var(--sf-page-bg)] px-6 text-center">
          <h1 className="font-serif text-2xl text-[color:var(--sf-accent)]">
            Product not found
          </h1>
          <Link
            href={`${basePath}/shop`}
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
        basePath={basePath}
        config={config}
        product={pdp}
      />
    </StorefrontThemeRoot>
  );
}
