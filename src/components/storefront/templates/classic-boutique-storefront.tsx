import { ClassicBoutiqueSiteFooter } from "@/components/storefront/templates/classic-boutique-site-footer";
import { ClassicBoutiqueSiteHeader } from "@/components/storefront/templates/classic-boutique-site-header";
import { StorefrontSections } from "@/components/storefront/sections/storefront-section-renderer";
import type { StorefrontConfig, StorefrontSection } from "@/types/storefront";

type ClassicBoutiqueStorefrontProps = {
  config: StorefrontConfig;
  /** When set (dashboard live preview or customer preview), `@shop` CTAs resolve to the collection page. */
  workspaceId?: string;
  /** Explicit storefront root, e.g. `/s/my-store`. */
  basePath?: string;
  isEditing?: boolean;
  onMoveSection?: (from: number, to: number) => void;
  onAddSection?: (type: StorefrontSection["type"], index: number) => void;
  onEditSection?: (sectionId: string) => void;
  onRemoveSection?: (index: number) => void;
};

export function ClassicBoutiqueStorefront({
  config,
  workspaceId,
  basePath,
  isEditing,
  onMoveSection,
  onAddSection,
  onEditSection,
  onRemoveSection,
}: ClassicBoutiqueStorefrontProps) {
  return (
    <div className="min-h-full">
      <ClassicBoutiqueSiteHeader config={config} basePath={basePath} workspaceId={workspaceId} />
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

      <ClassicBoutiqueSiteFooter
        config={config}
        workspaceId={workspaceId}
        basePath={basePath}
      />
    </div>
  );
}
