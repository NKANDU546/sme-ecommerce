import { StorefrontThemeRoot } from "@/components/storefront/storefront-theme-root";
import { ClassicBoutiqueStorefront } from "@/components/storefront/templates/classic-boutique-storefront";
import type { StorefrontConfig, StorefrontSection } from "@/types/storefront";

type StorefrontTemplateViewProps = {
  config: StorefrontConfig;
  /** Pass in preview contexts so `@shop` links resolve to `/preview/{id}/shop`. */
  workspaceId?: string;
  /** Public storefront root, e.g. `/s/my-store`. */
  basePath?: string;
  isEditing?: boolean;
  /** Force mobile/desktop chrome when previewing inside a fixed-width frame. */
  forceViewport?: "mobile" | "desktop";
  onMoveSection?: (from: number, to: number) => void;
  onAddSection?: (type: StorefrontSection["type"], index: number) => void;
  onEditSection?: (sectionId: string) => void;
  onRemoveSection?: (index: number) => void;
};

/** Registry: add cases when new `templateId` values ship from the backend. */
export function StorefrontTemplateView({
  config,
  workspaceId,
  basePath,
  isEditing,
  forceViewport,
  onMoveSection,
  onAddSection,
  onEditSection,
  onRemoveSection,
}: StorefrontTemplateViewProps) {
  const body = (
    <ClassicBoutiqueStorefront
      config={config}
      workspaceId={workspaceId}
      basePath={basePath}
      isEditing={isEditing}
      forceViewport={forceViewport}
      onMoveSection={onMoveSection}
      onAddSection={onAddSection}
      onEditSection={onEditSection}
      onRemoveSection={onRemoveSection}
    />
  );
  return <StorefrontThemeRoot config={config}>{body}</StorefrontThemeRoot>;
}
