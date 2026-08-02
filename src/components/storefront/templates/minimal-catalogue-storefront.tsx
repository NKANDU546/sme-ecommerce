import { MinimalCatalogueSiteFooter } from "@/components/storefront/templates/minimal-catalogue-site-footer";
import { MinimalCatalogueSiteHeader } from "@/components/storefront/templates/minimal-catalogue-site-header";
import { StorefrontSections } from "@/components/storefront/sections/storefront-section-renderer";
import type { StorefrontConfig, StorefrontSection } from "@/types/storefront";

type MinimalCatalogueStorefrontProps = {
  config: StorefrontConfig;
  workspaceId?: string;
  basePath?: string;
  isEditing?: boolean;
  forceViewport?: "mobile" | "desktop";
  onMoveSection?: (from: number, to: number) => void;
  onAddSection?: (type: StorefrontSection["type"], index: number) => void;
  onEditSection?: (sectionId: string) => void;
  onRemoveSection?: (index: number) => void;
};

export function MinimalCatalogueStorefront({
  config,
  workspaceId,
  basePath,
  isEditing,
  forceViewport,
  onMoveSection,
  onAddSection,
  onEditSection,
  onRemoveSection,
}: MinimalCatalogueStorefrontProps) {
  return (
    <div className="@container/storefront min-h-full">
      <MinimalCatalogueSiteHeader
        config={config}
        basePath={basePath}
        workspaceId={workspaceId}
        forceViewport={forceViewport}
      />
      <StorefrontSections
        sections={config.sections}
        config={config}
        workspaceId={workspaceId}
        basePath={basePath}
        isEditing={isEditing}
        onMoveSection={onMoveSection}
        onAddSection={onAddSection}
        onEditSection={onEditSection}
        onRemoveSection={onRemoveSection}
      />
      <MinimalCatalogueSiteFooter
        config={config}
        workspaceId={workspaceId}
        basePath={basePath}
      />
    </div>
  );
}
