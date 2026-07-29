"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ClassicBoutiqueSmartLink as SmartLink } from "@/components/storefront/templates/classic-boutique-smart-link";
import { storefrontButtonClassName } from "@/components/storefront/storefront-button";
import { useProducts } from "@/hooks/use-products";
import { usePublicProducts } from "@/hooks/use-public-storefront";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import { productApiToCatalog } from "@/lib/product-mapper";
import { resolveStorefrontProductSectionLimit } from "@/lib/storefront-product-section-limit";
import type { StorefrontFeaturedProductsSection } from "@/types/storefront";

function storeSlugFromBasePath(basePath?: string): string | undefined {
  if (!basePath) return undefined;
  const match = basePath.replace(/\/$/, "").match(/^\/s\/([^/]+)$/);
  return match?.[1];
}

function SectionProductCard({
  title,
  priceLabel,
  imageUrl,
  href,
}: {
  title: string;
  priceLabel: string;
  imageUrl: string;
  href?: string;
}) {
  const card = (
    <article className="group flex flex-col">
      <div className="aspect-square overflow-hidden rounded-xl border border-[color:var(--sf-accent-border-10)] bg-[color:var(--sf-card-frame-bg)]">
        {imageUrl.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-[color:var(--sf-hero-placeholder)] font-sans text-xs text-[color:var(--sf-accent-text-45)]"
            aria-hidden
          >
            No image
          </div>
        )}
      </div>
      <h3 className="mt-4 font-sans text-[15px] font-semibold text-[color:var(--sf-accent)]">
        {title}
      </h3>
      <p className="mt-1 font-sans text-sm text-[color:var(--sf-accent-text-55)]">
        {priceLabel}
      </p>
    </article>
  );

  if (!href) return card;
  return (
    <Link
      href={href}
      className="outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sf-accent)]/30"
    >
      {card}
    </Link>
  );
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
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <h2
          id={`${section.id}-heading`}
          className="font-serif text-2xl font-light text-[color:var(--sf-accent)] sm:text-3xl"
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
        <p className="font-sans text-sm text-[color:var(--sf-accent-text-55)]">
          No active products yet. Add and publish products in the Products
          panel.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
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
              <SectionProductCard
                key={p.id}
                title={p.title}
                priceLabel={p.priceLabel}
                imageUrl={p.imageUrl}
                href={productHref}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
