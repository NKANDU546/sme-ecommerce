import { StorefrontThemeRoot } from "@/components/storefront/storefront-theme-root";
import { ClassicBoutiqueStorefront } from "@/components/storefront/templates/classic-boutique-storefront";
import type { StorefrontConfig, StorefrontSection } from "@/types/storefront";

type StorefrontTemplateViewProps = {
  config: StorefrontConfig;
  /** Pass in preview contexts so `@shop` links resolve to `/preview/{id}/shop`. */
  workspaceId?: string;
  isEditing?: boolean;
  onMoveSection?: (from: number, to: number) => void;
  onAddSection?: (type: StorefrontSection["type"], index: number) => void;
  onEditSection?: (sectionId: string) => void;
};

/** Registry: add cases when new `templateId` values ship from the backend. */
export function StorefrontTemplateView({
  config,
  workspaceId,
  isEditing,
  onMoveSection,
  onAddSection,
  onEditSection,
}: StorefrontTemplateViewProps) {
  const body =
    config.templateId === "classic-boutique" ? (
      <ClassicBoutiqueStorefront
        config={config}
        workspaceId={workspaceId}
        isEditing={isEditing}
        onMoveSection={onMoveSection}
        onAddSection={onAddSection}
        onEditSection={onEditSection}
      />
    ) : (
      <ClassicBoutiqueStorefront
        config={config}
        workspaceId={workspaceId}
        isEditing={isEditing}
        onMoveSection={onMoveSection}
        onAddSection={onAddSection}
        onEditSection={onEditSection}
      />
    );
  return <StorefrontThemeRoot config={config}>{body}</StorefrontThemeRoot>;
}
