"use client";

import Link from "next/link";
import { StorefrontSections } from "@/components/storefront/sections/storefront-section-renderer";
import { StorefrontThemeRoot } from "@/components/storefront/storefront-theme-root";
import { ClassicBoutiqueSiteFooter } from "@/components/storefront/templates/classic-boutique-site-footer";
import { ClassicBoutiqueSiteHeader } from "@/components/storefront/templates/classic-boutique-site-header";
import { usePreviewStorefrontConfig } from "@/hooks/use-preview-storefront-config";
import { isReservedStorefrontPageSlug } from "@/lib/storefront-reserved-slugs";

type CustomPageClientProps = {
  workspaceId: string;
  slug: string;
};

export function CustomPageClient({ workspaceId, slug }: CustomPageClientProps) {
  const storefront = usePreviewStorefrontConfig(workspaceId);

  if (isReservedStorefrontPageSlug(slug)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <h1 className="font-serif text-2xl text-primary-blue">
          Page not found
        </h1>
        <Link
          href={`/preview/${workspaceId}`}
          className="mt-2 font-sans text-sm font-semibold text-primary-blue underline"
        >
          Back to storefront
        </Link>
      </div>
    );
  }

  if (storefront.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-sans text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (storefront.status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <h1 className="font-serif text-2xl text-primary-blue">
          Sign in to preview
        </h1>
        <Link
          href="/signin"
          className="mt-2 font-sans text-sm font-semibold text-primary-blue underline"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  if (storefront.status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <h1 className="font-serif text-2xl text-primary-blue">
          No storefront draft
        </h1>
        <p className="max-w-md font-sans text-sm text-muted-foreground">
          {storefront.message}
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

  const config = storefront.config;
  const page = config.pages.find((p) => p.slug === slug);

  if (!page) {
    return (
      <StorefrontThemeRoot config={config}>
        <div className="flex min-h-screen flex-col bg-[color:var(--sf-page-bg)]">
          <ClassicBoutiqueSiteHeader config={config} workspaceId={workspaceId} />
          <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <h1 className="font-serif text-3xl font-light text-[color:var(--sf-accent)]">
              Page not found
            </h1>
            <Link
              href={`/preview/${workspaceId}`}
              className="mt-4 font-sans text-sm font-semibold text-[color:var(--sf-accent)] underline"
            >
              Back to storefront
            </Link>
          </main>
          <ClassicBoutiqueSiteFooter config={config} workspaceId={workspaceId} />
        </div>
      </StorefrontThemeRoot>
    );
  }

  return (
    <StorefrontThemeRoot config={config}>
      <div className="min-h-full">
        <ClassicBoutiqueSiteHeader config={config} workspaceId={workspaceId} />
        <StorefrontSections
          sections={page.sections}
          config={config}
          workspaceId={workspaceId}
        />
        <ClassicBoutiqueSiteFooter config={config} workspaceId={workspaceId} />
      </div>
    </StorefrontThemeRoot>
  );
}
