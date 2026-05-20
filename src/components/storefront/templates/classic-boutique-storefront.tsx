import { ClassicBoutiqueSiteFooter } from "@/components/storefront/templates/classic-boutique-site-footer";
import { ClassicBoutiqueSiteHeader } from "@/components/storefront/templates/classic-boutique-site-header";
import { StorefrontSections } from "@/components/storefront/sections/storefront-section-renderer";
import type { StorefrontConfig } from "@/types/storefront";

type ClassicBoutiqueStorefrontProps = {
  config: StorefrontConfig;
  /** When set (dashboard live preview or customer preview), `@shop` CTAs resolve to the collection page. */
  workspaceId?: string;
};

export function ClassicBoutiqueStorefront({
  config,
  workspaceId,
}: ClassicBoutiqueStorefrontProps) {
  return (
    <div className="min-h-full">
      <ClassicBoutiqueSiteHeader config={config} />
      <StorefrontSections
        sections={config.sections}
        config={config}
        workspaceId={workspaceId}
      />

      <ClassicBoutiqueSiteFooter config={config} workspaceId={workspaceId} />
    </div>
  );
}
