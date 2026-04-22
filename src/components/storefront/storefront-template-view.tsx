import { StorefrontThemeRoot } from "@/components/storefront/storefront-theme-root";
import { ClassicBoutiqueStorefront } from "@/components/storefront/templates/classic-boutique-storefront";
import type { StorefrontConfig } from "@/types/storefront";

type StorefrontTemplateViewProps = {
  config: StorefrontConfig;
};

/** Registry: add cases when new `templateId` values ship from the backend. */
export function StorefrontTemplateView({ config }: StorefrontTemplateViewProps) {
  const body =
    config.templateId === "classic-boutique" ? (
      <ClassicBoutiqueStorefront config={config} />
    ) : (
      <ClassicBoutiqueStorefront config={config} />
    );
  return <StorefrontThemeRoot config={config}>{body}</StorefrontThemeRoot>;
}
