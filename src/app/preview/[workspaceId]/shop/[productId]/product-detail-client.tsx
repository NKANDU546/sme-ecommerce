"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StorefrontProductDetailView } from "@/components/storefront/storefront-product-detail-view";
import { StorefrontThemeRoot } from "@/components/storefront/storefront-theme-root";
import { enrichCatalogProductForPdp } from "@/lib/catalog-product-pdp";
import { getCatalogProductById } from "@/lib/catalog-storage";
import { loadStorefront } from "@/lib/storefront-storage";
import type { CatalogProduct } from "@/types/catalog-product";
import type { StorefrontConfig } from "@/types/storefront";

type ProductDetailClientProps = {
  workspaceId: string;
  productId: string;
};

export function ProductDetailClient({
  workspaceId,
  productId,
}: ProductDetailClientProps) {
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConfig(loadStorefront(workspaceId));
    setProduct(getCatalogProductById(workspaceId, productId));
    setReady(true);
  }, [workspaceId, productId]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-sans text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <h1 className="font-serif text-2xl text-primary-blue">
          No storefront in this browser
        </h1>
        <Link
          href={`/dashboard/${workspaceId}`}
          className="mt-2 font-sans text-sm font-semibold text-primary-blue underline"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  if (!product) {
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
