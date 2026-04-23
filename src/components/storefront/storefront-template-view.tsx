import { StorefrontThemeRoot } from "@/components/storefront/storefront-theme-root";
import { ClassicBoutiqueStorefront } from "@/components/storefront/templates/classic-boutique-storefront";
import type { StorefrontConfig } from "@/types/storefront";

type StorefrontTemplateViewProps = {
  config: StorefrontConfig;
  /** Pass in preview contexts so `@shop` links resolve to `/preview/{id}/shop`. */
  workspaceId?: string;
};

/** Registry: add cases when new `templateId` values ship from the backend. */
export function StorefrontTemplateView({
  config,
  workspaceId,
}: StorefrontTemplateViewProps) {
  const body =
    config.templateId === "classic-boutique" ? (
      <ClassicBoutiqueStorefront config={config} workspaceId={workspaceId} />
    ) : (
      <ClassicBoutiqueStorefront config={config} workspaceId={workspaceId} />
    );
  return <StorefrontThemeRoot config={config}>{body}</StorefrontThemeRoot>;
}
