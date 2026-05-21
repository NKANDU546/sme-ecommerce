import { ClassicBoutiqueSiteFooter } from "@/components/storefront/templates/classic-boutique-site-footer";
import { ClassicBoutiqueSiteHeader } from "@/components/storefront/templates/classic-boutique-site-header";
import { StorefrontSections } from "@/components/storefront/sections/storefront-section-renderer";
import type { StorefrontConfig, StorefrontSection } from "@/types/storefront";

type ClassicBoutiqueStorefrontProps = {
  config: StorefrontConfig;
  /** When set (dashboard live preview or customer preview), `@shop` CTAs resolve to the collection page. */
  workspaceId?: string;
  isEditing?: boolean;
  onMoveSection?: (from: number, to: number) => void;
  onAddSection?: (type: StorefrontSection["type"], index: number) => void;
  onEditSection?: (sectionId: string) => void;
};

export function ClassicBoutiqueStorefront({
  config,
  workspaceId,
  isEditing,
  onMoveSection,
  onAddSection,
  onEditSection,
}: ClassicBoutiqueStorefrontProps) {
  return (
    <div className="min-h-full">
      <ClassicBoutiqueSiteHeader config={config} />
      <StorefrontSections
        sections={config.sections}
        config={config}
        workspaceId={workspaceId}
        isEditing={isEditing}
        onMoveSection={onMoveSection}
        onAddSection={onAddSection}
        onEditSection={onEditSection}
      />

      <ClassicBoutiqueSiteFooter config={config} workspaceId={workspaceId} />
    </div>
  );
}
