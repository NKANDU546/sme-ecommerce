"use client";

import { StorefrontTemplateView } from "@/components/storefront/storefront-template-view";
import { usePublicStorefront } from "@/hooks/use-public-storefront";
import { publicStorefrontBasePath } from "@/lib/preview-shop-href";

type PublicStorefrontHomeClientProps = {
  storeSlug: string;
};

export function PublicStorefrontHomeClient({
  storeSlug,
}: PublicStorefrontHomeClientProps) {
  const query = usePublicStorefront(storeSlug);
  const basePath = publicStorefrontBasePath(storeSlug);

  if (query.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-sans text-sm text-muted-foreground">
        Loading store…
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <h1 className="font-serif text-2xl text-primary-blue">
          Store not available
        </h1>
        <p className="max-w-md font-sans text-sm text-muted-foreground">
          {query.error instanceof Error
            ? query.error.message
            : "This storefront is unpublished, suspended, or does not exist."}
        </p>
      </div>
    );
  }

  return (
    <StorefrontTemplateView
      config={query.data.config}
      basePath={basePath}
    />
  );
}
