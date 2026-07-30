"use client";

import Link from "next/link";
import { StorefrontSections } from "@/components/storefront/sections/storefront-section-renderer";
import { StorefrontThemeRoot } from "@/components/storefront/storefront-theme-root";
import { ClassicBoutiqueSiteFooter } from "@/components/storefront/templates/classic-boutique-site-footer";
import { ClassicBoutiqueSiteHeader } from "@/components/storefront/templates/classic-boutique-site-header";
import {
  usePublicPage,
  usePublicStorefront,
} from "@/hooks/use-public-storefront";
import { publicStorefrontBasePath } from "@/lib/preview-shop-href";
import { isReservedStorefrontPageSlug } from "@/lib/storefront-reserved-slugs";
import { upgradeStorefrontConfig } from "@/lib/storefront-storage";
import type { StorefrontCustomPage, StorefrontSection } from "@/types/storefront";

type PublicCustomPageClientProps = {
  storeSlug: string;
  pageSlug: string;
};

function asCustomPage(
  slug: string,
  title: string,
  page: Record<string, unknown>,
): StorefrontCustomPage {
  const sections = Array.isArray(page.sections)
    ? (page.sections as StorefrontSection[])
    : [];
  return {
    id: String(page.id ?? slug),
    title: String(page.title ?? title),
    slug: String(page.slug ?? slug),
    sections,
  };
}

export function PublicCustomPageClient({
  storeSlug,
  pageSlug,
}: PublicCustomPageClientProps) {
  const basePath = publicStorefrontBasePath(storeSlug);
  const storefrontQuery = usePublicStorefront(storeSlug);
  const pageQuery = usePublicPage(
    storeSlug,
    pageSlug,
    !isReservedStorefrontPageSlug(pageSlug),
  );

  if (isReservedStorefrontPageSlug(pageSlug)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <h1 className="font-serif text-2xl text-primary-blue">
          Page not found
        </h1>
        <Link
          href={basePath}
          className="mt-2 font-sans text-sm font-semibold text-primary-blue underline"
        >
          Back to storefront
        </Link>
      </div>
    );
  }

  if (storefrontQuery.isLoading || pageQuery.isLoading) {
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

  if (pageQuery.isError || !pageQuery.data) {
    return (
      <StorefrontThemeRoot config={config}>
        <div className="flex min-h-screen flex-col bg-[color:var(--sf-page-bg)]">
          <ClassicBoutiqueSiteHeader config={config} basePath={basePath} />
          <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <h1 className="font-serif text-3xl font-light text-[color:var(--sf-accent)]">
              Page not found
            </h1>
            <Link
              href={basePath}
              className="mt-4 font-sans text-sm font-semibold text-[color:var(--sf-accent)] underline"
            >
              Back to storefront
            </Link>
          </main>
          <ClassicBoutiqueSiteFooter config={config} basePath={basePath} />
        </div>
      </StorefrontThemeRoot>
    );
  }

  const page = asCustomPage(
    pageQuery.data.slug,
    pageQuery.data.title,
    pageQuery.data.page,
  );
  // Ensure section shapes from published snapshot are upgraded if needed.
  const upgraded = upgradeStorefrontConfig({
    ...config,
    pages: [page],
  });
  const resolvedPage = upgraded.pages[0] ?? page;

  return (
    <StorefrontThemeRoot config={config}>
      <div className="min-h-full">
        <ClassicBoutiqueSiteHeader config={config} basePath={basePath} />
        <StorefrontSections
          sections={resolvedPage.sections}
          config={config}
          basePath={basePath}
        />
        <ClassicBoutiqueSiteFooter config={config} basePath={basePath} />
      </div>
    </StorefrontThemeRoot>
  );
}
