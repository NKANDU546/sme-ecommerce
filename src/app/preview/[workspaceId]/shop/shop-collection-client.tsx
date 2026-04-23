"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePreviewCartOptional } from "@/contexts/preview-cart-context";
import { ClassicBoutiqueSiteHeader } from "@/components/storefront/templates/classic-boutique-site-header";
import { StorefrontThemeRoot } from "@/components/storefront/storefront-theme-root";
import { loadCatalogProducts } from "@/lib/catalog-storage";
import { loadStorefront } from "@/lib/storefront-storage";
import type { CatalogProduct } from "@/types/catalog-product";
import type { StorefrontConfig } from "@/types/storefront";

type ShopCollectionClientProps = {
  workspaceId: string;
};

export function ShopCollectionClient({ workspaceId }: ShopCollectionClientProps) {
  const cart = usePreviewCartOptional();
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConfig(loadStorefront(workspaceId));
    setProducts(loadCatalogProducts(workspaceId));
    setReady(true);
  }, [workspaceId]);

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
        <p className="max-w-md font-sans text-sm text-muted-foreground">
          Set up a storefront from the dashboard for this workspace, then open
          the shop collection again.
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

  const visible = products.filter((p) => p.status !== "archived");

  return (
    <StorefrontThemeRoot config={config}>
      <div className="min-h-full bg-[color:var(--sf-page-bg)]">
        <ClassicBoutiqueSiteHeader config={config} />

        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
          <h1 className="font-serif text-3xl font-light text-[color:var(--sf-accent)] sm:text-4xl">
            Shop collection
          </h1>
          <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-[color:var(--sf-accent-text-60)] sm:text-base">
            Browse the catalogue synced from your workspace (local draft on this
            device until your API is ready).
          </p>

          {visible.length === 0 ? (
            <p className="mt-12 font-sans text-sm text-[color:var(--sf-accent-text-55)]">
              No products to show yet. Add products under{" "}
              <strong>Products</strong> in the dashboard.
            </p>
          ) : (
            <ul className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
              {visible.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-[color:var(--sf-accent-border-10)] bg-white shadow-sm"
                >
                  <Link
                    href={`/preview/${workspaceId}/shop/${p.id}`}
                    className="group block flex flex-1 flex-col px-3 pb-2 pt-3 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[color:var(--sf-accent)]/30"
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
                  {cart ? (
                    <div className="mt-auto border-t border-[color:var(--sf-accent-border-5)] px-3 py-2">
                      <button
                        type="button"
                        onClick={() =>
                          cart.addItem(
                            {
                              productId: p.id,
                              title: p.title,
                              sku: p.sku,
                              priceLabel: p.priceLabel,
                              imageUrl: p.imageUrl,
                              quantity: 1,
                            },
                            { openDrawer: false },
                          )
                        }
                        className="w-full rounded-md bg-[color:var(--sf-accent)] py-2 font-sans text-xs font-semibold text-[color:var(--sf-cart-badge-fg)] transition-opacity hover:opacity-95"
                      >
                        Add to cart
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </StorefrontThemeRoot>
  );
}
