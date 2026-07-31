"use client";

import { useEffect, useMemo, useState } from "react";
import { ClassicBoutiqueSmartLink as SmartLink } from "@/components/storefront/templates/classic-boutique-smart-link";
import { storefrontButtonClassName } from "@/components/storefront/storefront-button";
import { StorefrontProductCard } from "@/components/storefront/storefront-product-card";
import { StorefrontSectionEmpty } from "@/components/storefront/storefront-section-empty";
import { useProducts } from "@/hooks/use-products";
import { usePublicProducts } from "@/hooks/use-public-storefront";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import { productApiToCatalog } from "@/lib/product-mapper";
import { isPublicStorefrontContext } from "@/lib/storefront-public-context";
import { resolveStorefrontProductSectionLimit } from "@/lib/storefront-product-section-limit";
import type { StorefrontFeaturedProductsSection } from "@/types/storefront";

function storeSlugFromBasePath(basePath?: string): string | undefined {
  if (!basePath) return undefined;
  const match = basePath.replace(/\/$/, "").match(/^\/s\/([^/]+)$/);
  return match?.[1];
}

type FeaturedProductsSectionProps = {
  section: StorefrontFeaturedProductsSection;
  workspaceId?: string;
  basePath?: string;
};

/** Renders active catalogue products from the API (not storefront config placeholders). */
export function FeaturedProductsSection({
  section,
  workspaceId,
  basePath,
}: FeaturedProductsSectionProps) {
  const storeSlug = storeSlugFromBasePath(basePath);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const usePublic = Boolean(storeSlug);
  const limit = resolveStorefrontProductSectionLimit(section.limit);

  useEffect(() => {
    setAccessToken(getStoredAuthSession()?.accessToken ?? null);
  }, []);

  const listParams = { page: 0, limit: limit };

  const publicQuery = usePublicProducts(storeSlug ?? "", listParams, usePublic);
  const workspaceQuery = useProducts(workspaceId, accessToken, {
    ...listParams,
    status: "active",
  });

  const query = usePublic ? publicQuery : workspaceQuery;

  const products = useMemo(() => {
    const items = query.data?.items ?? [];
    return items
      .map(productApiToCatalog)
      .filter((p) => p.status === "active")
      .slice(0, limit);
  }, [query.data, limit]);

  return (
    <section
      className="mx-auto max-w-[100%] px-4 py-14 sm:px-8 sm:py-20"
      aria-labelledby={`${section.id}-heading`}
    >
      <div className="mb-8 flex flex-col gap-3 @sm/storefront:mb-10 @sm/storefront:flex-row @sm/storefront:flex-wrap @sm/storefront:items-end @sm/storefront:justify-between @sm/storefront:gap-4">
        <h2
          id={`${section.id}-heading`}
          className="font-serif text-2xl font-light text-[color:var(--sf-accent)] @sm/storefront:text-3xl"
        >
          {section.title}
        </h2>
        {section.viewAll ? (
          <SmartLink
            link={section.viewAll}
            workspaceId={workspaceId}
            basePath={basePath}
            className={storefrontButtonClassName({ variant: "text" })}
          />
        ) : null}
      </div>

      {query.isLoading ? (
        <p className="font-sans text-sm text-[color:var(--sf-accent-text-55)]">
          Loading products…
        </p>
      ) : query.isError ? (
        <p className="font-sans text-sm text-[color:var(--sf-accent-text-55)]">
          {query.error instanceof Error
            ? query.error.message
            : "Could not load products."}
        </p>
      ) : products.length === 0 ? (
        <StorefrontSectionEmpty
          basePath={basePath}
          merchantMessage="No active products yet. Add and publish products in the Products panel."
          publicMessage="Nothing here yet."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 @md/storefront:grid-cols-3 @md/storefront:gap-6 @xl/storefront:grid-cols-4 @xl/storefront:gap-8">
          {products.map((p) => {
            const apiItem = query.data?.items.find((i) => i.id === p.id);
            const pathSegment =
              usePublic && apiItem?.slug ? apiItem.slug : p.id;
            const productHref = basePath
              ? `${basePath.replace(/\/$/, "")}/shop/${encodeURIComponent(pathSegment)}`
              : workspaceId
                ? `/preview/${workspaceId}/shop/${encodeURIComponent(p.id)}`
                : undefined;
            return (
              <StorefrontProductCard
                key={p.id}
                title={p.title}
                priceLabel={p.priceLabel}
                compareAtPriceLabel={p.compareAtPriceLabel}
                imageUrl={p.imageUrl}
                href={productHref}
                badges={(() => {
                  const list: Array<"Sold out" | "Sale"> = [];
                  if (p.inStock === false) list.push("Sold out");
                  if (p.onSale || p.compareAtPriceLabel?.trim()) list.push("Sale");
                  return list.length ? list : undefined;
                })()}
                showUploadHint={!isPublicStorefrontContext(basePath)}
                ctaLabel="View product"
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
