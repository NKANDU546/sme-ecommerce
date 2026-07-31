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
import { resolveStorefrontHref } from "@/lib/preview-shop-href";
import { isPublicStorefrontContext } from "@/lib/storefront-public-context";
import type { StorefrontShopByCategorySection } from "@/types/storefront";

function storeSlugFromBasePath(basePath?: string): string | undefined {
  if (!basePath) return undefined;
  const match = basePath.replace(/\/$/, "").match(/^\/s\/([^/]+)$/);
  return match?.[1];
}

type ShopByCategorySectionProps = {
  section: StorefrontShopByCategorySection;
  workspaceId?: string;
  basePath?: string;
};

export function ShopByCategorySection({
  section,
  workspaceId,
  basePath,
}: ShopByCategorySectionProps) {
  const storeSlug = storeSlugFromBasePath(basePath);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const usePublic = Boolean(storeSlug);
  const resolvedBase =
    basePath ?? (workspaceId ? `/preview/${workspaceId}` : undefined);

  useEffect(() => {
    setAccessToken(getStoredAuthSession()?.accessToken ?? null);
  }, []);

  const publicQuery = usePublicProducts(
    storeSlug ?? "",
    { page: 0, limit: 50 },
    usePublic && section.categories.length === 0,
  );
  const workspaceQuery = useProducts(workspaceId, accessToken, {
    page: 0,
    limit: 50,
    status: "active",
  });

  const derived = useMemo(() => {
    if (section.categories.length > 0) return section.categories;
    const items =
      (usePublic ? publicQuery.data : workspaceQuery.data)?.items ?? [];
    const map = new Map<
      string,
      { name: string; imageUrl: string; href: string }
    >();
    for (const product of items) {
      const cat = product.category;
      if (!cat?.name?.trim()) continue;
      const key = cat.slug || cat.id || cat.name;
      if (map.has(key)) continue;
      map.set(key, {
        name: cat.name,
        imageUrl: product.imageUrl ?? "",
        href: `@shop/category:${cat.slug || key}`,
      });
    }
    return [...map.values()].slice(0, 6);
  }, [section.categories, usePublic, publicQuery.data, workspaceQuery.data]);

  const loading =
    section.categories.length === 0 &&
    (usePublic ? publicQuery.isLoading : workspaceQuery.isLoading);

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
        <SmartLink
          link={section.viewAll}
          workspaceId={workspaceId}
          basePath={basePath}
          className={storefrontButtonClassName({ variant: "text" })}
        />
      </div>

      {loading ? (
        <p className="font-sans text-sm text-[color:var(--sf-accent-text-55)]">
          Loading categories…
        </p>
      ) : derived.length === 0 ? (
        <StorefrontSectionEmpty
          basePath={basePath}
          merchantMessage="Add category cards in the editor, or publish products with categories."
          publicMessage="Nothing here yet."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 @md/storefront:grid-cols-3 @md/storefront:gap-6">
          {derived.map((cat) => {
            const href = resolveStorefrontHref(
              { label: cat.name, href: cat.href },
              resolvedBase,
            );
            const card = (
              <article className="group overflow-hidden rounded-xl border border-[color:var(--sf-accent-border-10)] bg-[color:var(--sf-card-frame-bg)]">
                <div className="aspect-[4/3] overflow-hidden bg-[color:var(--sf-hero-placeholder)]">
                  {cat.imageUrl.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.imageUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <StorefrontImagePlaceholder
                      label={cat.name}
                      hint={
                        isPublicStorefrontContext(basePath)
                          ? undefined
                          : "Needs image"
                      }
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-sans text-sm font-semibold text-[color:var(--sf-accent)] sm:text-base">
                    {cat.name}
                  </h3>
                </div>
              </article>
            );
            return href.startsWith("/") ? (
              <Link key={cat.name} href={href} className="outline-none">
                {card}
              </Link>
            ) : (
              <a key={cat.name} href={href} className="outline-none">
                {card}
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}
