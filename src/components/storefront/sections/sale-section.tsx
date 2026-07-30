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
import type { StorefrontSaleSection } from "@/types/storefront";

function storeSlugFromBasePath(basePath?: string): string | undefined {
  if (!basePath) return undefined;
  const match = basePath.replace(/\/$/, "").match(/^\/s\/([^/]+)$/);
  return match?.[1];
}

type SaleSectionProps = {
  section: StorefrontSaleSection;
  workspaceId?: string;
  basePath?: string;
};

export function SaleSection({
  section,
  workspaceId,
  basePath,
}: SaleSectionProps) {
  const storeSlug = storeSlugFromBasePath(basePath);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const usePublic = Boolean(storeSlug);
  const limit = resolveStorefrontProductSectionLimit(section.limit);
  const eyebrow = section.eyebrow?.trim() ?? "";
  const title = section.title.trim();
  const description = section.description.trim();
  const showHeader = Boolean(eyebrow || title || description || section.viewAll);

  useEffect(() => {
    setAccessToken(getStoredAuthSession()?.accessToken ?? null);
  }, []);

  const listParams = {
    page: 0,
    limit,
    onSale: true as const,
    sort: "newest" as const,
  };

  const publicQuery = usePublicProducts(storeSlug ?? "", listParams, usePublic);
  const workspaceQuery = useProducts(workspaceId, accessToken, {
    ...listParams,
    status: "active",
  });

  const query = usePublic ? publicQuery : workspaceQuery;

  const products = useMemo(() => {
    const items = query.data?.items ?? [];
    return items
      .map((item) => ({ api: item, catalog: productApiToCatalog(item) }))
      .filter(({ api, catalog }) => {
        if (catalog.status !== "active") return false;
        if (api.onSale) return true;
        // Client fallback until Step 03B `onSale` filter + fields ship.
        return (
          api.compareAtPriceAmount != null &&
          api.compareAtPriceAmount > api.priceAmount
        );
      })
      .slice(0, limit);
  }, [query.data, limit]);

  return (
    <section
      className="mx-auto max-w-[100%] px-4 py-14 sm:px-8 sm:py-20"
      aria-labelledby={title ? `${section.id}-heading` : undefined}
      aria-label={title ? undefined : "Sale"}
    >
      {showHeader ? (
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          {eyebrow || title || description ? (
            <div>
              {eyebrow ? (
                <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--sf-accent-text-45)]">
                  {eyebrow}
                </p>
              ) : null}
              {title ? (
                <h2
                  id={`${section.id}-heading`}
                  className={`font-serif text-2xl font-light text-[color:var(--sf-accent)] sm:text-3xl ${
                    eyebrow ? "mt-2" : ""
                  }`}
                >
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-2 max-w-xl font-sans text-sm leading-relaxed text-[color:var(--sf-accent-text-60)]">
                  {description}
                </p>
              ) : null}
            </div>
          ) : (
            <div />
          )}
          {section.viewAll ? (
            <SmartLink
              link={section.viewAll}
              workspaceId={workspaceId}
              basePath={basePath}
              className={storefrontButtonClassName({ variant: "text" })}
            />
          ) : null}
        </div>
      ) : null}

      {query.isLoading ? (
        <p className="font-sans text-sm text-[color:var(--sf-accent-text-55)]">
          Loading sale products…
        </p>
      ) : query.isError ? (
        <p className="font-sans text-sm text-[color:var(--sf-accent-text-55)]">
          {query.error instanceof Error
            ? query.error.message
            : "Could not load sale products."}
        </p>
      ) : products.length === 0 ? (
        <p className="font-sans text-sm text-[color:var(--sf-accent-text-55)]">
          No sale products yet. Set a compare-at price higher than the selling
          price on active products in the Products panel.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {products.map(({ api, catalog }) => {
            const pathSegment =
              usePublic && api.slug ? api.slug : catalog.id;
            const productHref = basePath
              ? `${basePath.replace(/\/$/, "")}/shop/${encodeURIComponent(pathSegment)}`
              : workspaceId
                ? `/preview/${workspaceId}/shop/${encodeURIComponent(catalog.id)}`
                : undefined;

            const card = (
              <article className="group flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-[color:var(--sf-accent-border-10)] bg-[color:var(--sf-card-frame-bg)]">
                  {catalog.imageUrl.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={catalog.imageUrl}
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
                  <span className="absolute left-3 top-3 bg-[color:var(--sf-accent)] px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                    Sale
                  </span>
                </div>
                <h3 className="mt-3 font-sans text-[15px] font-semibold text-[color:var(--sf-accent)]">
                  {catalog.title}
                </h3>
                <p className="mt-1 flex flex-wrap items-baseline gap-2 font-sans text-sm">
                  <span className="font-semibold text-[color:var(--sf-accent)]">
                    {catalog.priceLabel}
                  </span>
                  {catalog.compareAtPriceLabel?.trim() ? (
                    <span className="text-[color:var(--sf-accent-text-45)] line-through">
                      {catalog.compareAtPriceLabel}
                    </span>
                  ) : null}
                </p>
              </article>
            );

            return productHref ? (
              <Link
                key={catalog.id}
                href={productHref}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sf-accent)]/30"
              >
                {card}
              </Link>
            ) : (
              <div key={catalog.id}>{card}</div>
            );
          })}
        </div>
      )}
    </section>
  );
}
