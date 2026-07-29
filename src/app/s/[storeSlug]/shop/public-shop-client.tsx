"use client";

import Link from "next/link";
import { useMemo } from "react";
import { StorefrontButtonLink } from "@/components/storefront/storefront-button";
import { ClassicBoutiqueSiteFooter } from "@/components/storefront/templates/classic-boutique-site-footer";
import { ClassicBoutiqueSiteHeader } from "@/components/storefront/templates/classic-boutique-site-header";
import { StorefrontThemeRoot } from "@/components/storefront/storefront-theme-root";
import {
  usePublicProducts,
  usePublicStorefront,
} from "@/hooks/use-public-storefront";
import { publicStorefrontBasePath } from "@/lib/preview-shop-href";
import { productApiToCatalog } from "@/lib/product-mapper";

type PublicShopClientProps = {
  storeSlug: string;
};

export function PublicShopClient({ storeSlug }: PublicShopClientProps) {
  const basePath = publicStorefrontBasePath(storeSlug);
  const storefrontQuery = usePublicStorefront(storeSlug);
  const productsQuery = usePublicProducts(storeSlug, { page: 0, limit: 100 });

  const products = useMemo(
    () =>
      (productsQuery.data?.items ?? []).map((item) => ({
        catalog: productApiToCatalog(item),
        slug: item.slug,
      })),
    [productsQuery.data],
  );

  if (storefrontQuery.isLoading || productsQuery.isLoading) {
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

  if (productsQuery.isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <h1 className="font-serif text-2xl text-primary-blue">
          Could not load products
        </h1>
        <p className="max-w-md font-sans text-sm text-muted-foreground">
          {productsQuery.error instanceof Error
            ? productsQuery.error.message
            : "Please try again."}
        </p>
      </div>
    );
  }

  const config = storefrontQuery.data.config;

  return (
    <StorefrontThemeRoot config={config}>
      <div className="min-h-full bg-[color:var(--sf-page-bg)]">
        <ClassicBoutiqueSiteHeader config={config} basePath={basePath} />

        <main className="mx-auto max-w-[100%] px-4 py-12 sm:px-8 sm:py-16">
          <h1 className="font-serif text-3xl font-light text-[color:var(--sf-accent)] sm:text-4xl">
            Shop collection
          </h1>
          <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-[color:var(--sf-accent-text-60)] sm:text-base">
            Browse products from {storefrontQuery.data.storefront.storeName}.
          </p>

          {products.length === 0 ? (
            <p className="mt-12 font-sans text-sm text-[color:var(--sf-accent-text-55)]">
              No products available yet.
            </p>
          ) : (
            <ul className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
              {products.map(({ catalog: p, slug }) => (
                <li
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-[color:var(--sf-accent-border-10)] bg-white shadow-sm"
                >
                  <Link
                    href={`${basePath}/shop/${encodeURIComponent(slug)}`}
                    className="group flex flex-1 flex-col px-3 pb-2 pt-3 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[color:var(--sf-accent)]/30"
                  >
                    <article className="flex flex-col">
                      <div className="aspect-square overflow-hidden rounded-xl border border-[color:var(--sf-accent-border-10)] bg-[color:var(--sf-card-frame-bg)]">
                        {p.imageUrl.trim() ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.imageUrl}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
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
                      <h2 className="mt-4 font-sans text-[15px] font-semibold text-[color:var(--sf-accent)]">
                        {p.title}
                      </h2>
                      <p className="mt-1 font-sans text-sm text-[color:var(--sf-accent-text-55)]">
                        {p.priceLabel}
                      </p>
                      <p className="mt-1 font-sans text-[11px] uppercase tracking-wide text-[color:var(--sf-accent-text-45)]">
                        {p.category}
                      </p>
                    </article>
                  </Link>
                  <div className="mt-auto border-t border-[color:var(--sf-accent-border-5)] px-3 py-2">
                    <StorefrontButtonLink
                      href={`${basePath}/shop/${encodeURIComponent(slug)}`}
                      size="sm"
                      className="w-full"
                    >
                      View product
                    </StorefrontButtonLink>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>

        <ClassicBoutiqueSiteFooter config={config} basePath={basePath} />
      </div>
    </StorefrontThemeRoot>
  );
}
