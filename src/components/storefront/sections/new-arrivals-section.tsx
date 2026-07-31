"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ClassicBoutiqueSmartLink as SmartLink } from "@/components/storefront/templates/classic-boutique-smart-link";
import { storefrontButtonClassName } from "@/components/storefront/storefront-button";
import { StorefrontImagePlaceholder } from "@/components/storefront/storefront-image-placeholder";
import { StorefrontSectionEmpty } from "@/components/storefront/storefront-section-empty";
import { useProducts } from "@/hooks/use-products";
import { usePublicProducts } from "@/hooks/use-public-storefront";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import { productApiToCatalog } from "@/lib/product-mapper";
import { resolveStorefrontProductSectionLimit } from "@/lib/storefront-product-section-limit";
import type { StorefrontNewArrivalsSection } from "@/types/storefront";

function storeSlugFromBasePath(basePath?: string): string | undefined {
  if (!basePath) return undefined;
  const match = basePath.replace(/\/$/, "").match(/^\/s\/([^/]+)$/);
  return match?.[1];
}

type NewArrivalsSectionProps = {
  section: StorefrontNewArrivalsSection;
  workspaceId?: string;
  basePath?: string;
};

export function NewArrivalsSection({
  section,
  workspaceId,
  basePath,
}: NewArrivalsSectionProps) {
  const storeSlug = storeSlugFromBasePath(basePath);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const usePublic = Boolean(storeSlug);
  const limit = resolveStorefrontProductSectionLimit(section.limit);
  const eyebrow = section.eyebrow?.trim() ?? "";
  const title = section.title.trim();
  const showHeader = Boolean(eyebrow || title || section.viewAll);

  useEffect(() => {
    setAccessToken(getStoredAuthSession()?.accessToken ?? null);
  }, []);

  const listParams = {
    page: 0,
    limit,
    sort: "newest" as const,
  };

  const publicQuery = usePublicProducts(storeSlug ?? "", listParams, usePublic);
  const workspaceQuery = useProducts(workspaceId, accessToken, {
    ...listParams,
    status: "active",
  });

  const query = usePublic ? publicQuery : workspaceQuery;

  const products = useMemo(() => {
    const items = [...(query.data?.items ?? [])];
    // Fallback client sort if backend ignores `sort` until Step 03B ships.
    items.sort((a, b) => {
      const aMs = Date.parse(a.createdAt) || 0;
      const bMs = Date.parse(b.createdAt) || 0;
      return bMs - aMs;
    });
    return items
      .map(productApiToCatalog)
      .filter((p) => p.status === "active")
      .slice(0, limit);
  }, [query.data, limit]);

  return (
    <section
      className="border-y border-[color:var(--sf-accent-border-10)] bg-[color:var(--sf-values-section-bg)] py-14 sm:py-20"
      aria-labelledby={title ? `${section.id}-heading` : undefined}
      aria-label={title ? undefined : "New arrivals"}
    >
      <div className="mx-auto max-w-[100%] px-4 sm:px-8">
        {showHeader ? (
          <div className="mb-10 text-center">
            {eyebrow ? (
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--sf-accent-text-45)]">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2
                id={`${section.id}-heading`}
                className={`font-serif text-3xl font-light text-[color:var(--sf-accent)] sm:text-4xl ${
                  eyebrow ? "mt-3" : ""
                }`}
              >
                {title}
              </h2>
            ) : null}
            {section.viewAll ? (
              <div className={title || eyebrow ? "mt-5" : ""}>
                <SmartLink
                  link={section.viewAll}
                  workspaceId={workspaceId}
                  basePath={basePath}
                  className={storefrontButtonClassName({ variant: "text" })}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {query.isLoading ? (
          <p className="text-center font-sans text-sm text-[color:var(--sf-accent-text-55)]">
            Loading new arrivals…
          </p>
        ) : products.length === 0 ? (
          <StorefrontSectionEmpty
            basePath={basePath}
            align="center"
            merchantMessage="No active products yet. Add and publish products in the Products panel."
            publicMessage="Nothing here yet."
          />
        ) : (
          <div
            className={`mx-auto grid gap-4 sm:gap-5 ${
              limit > 4
                ? "max-w-6xl grid-cols-1 @sm/storefront:grid-cols-2 @lg/storefront:grid-cols-3 @xl/storefront:grid-cols-4"
                : "max-w-5xl grid-cols-1 @sm/storefront:grid-cols-2"
            }`}
          >
            {products.map((p) => {
              const apiItem = query.data?.items.find((i) => i.id === p.id);
              const pathSegment =
                usePublic && apiItem?.slug ? apiItem.slug : p.id;
              const productHref = basePath
                ? `${basePath.replace(/\/$/, "")}/shop/${encodeURIComponent(pathSegment)}`
                : workspaceId
                  ? `/preview/${workspaceId}/shop/${encodeURIComponent(p.id)}`
                  : undefined;

              const card = (
                <article
                  className={`group relative overflow-hidden ${
                    limit > 4
                      ? "min-h-[16rem] sm:min-h-[18rem]"
                      : "min-h-[22rem] sm:min-h-[26rem]"
                  }`}
                >
                  <div className="absolute inset-0 bg-[color:var(--sf-hero-placeholder)]">
                    {p.imageUrl.trim() ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <StorefrontImagePlaceholder label={p.title} />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <span className="absolute left-4 top-4 bg-white px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--sf-accent)] shadow-sm">
                    New
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <h3 className="font-serif text-2xl font-light text-white sm:text-[1.75rem]">
                      {p.title}
                    </h3>
                    <p className="mt-2 font-sans text-sm font-medium text-white/85">
                      {p.priceLabel}
                    </p>
                  </div>
                </article>
              );

              return productHref ? (
                <Link
                  key={p.id}
                  href={productHref}
                  className="outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sf-accent)]/40"
                >
                  {card}
                </Link>
              ) : (
                <div key={p.id}>{card}</div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
