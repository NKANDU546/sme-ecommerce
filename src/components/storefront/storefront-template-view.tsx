import type { StorefrontConfig } from "@/types/storefront";
import { ClassicBoutiqueStorefront } from "@/components/storefront/templates/classic-boutique-storefront";

type StorefrontTemplateViewProps = {
  config: StorefrontConfig;
};

/** Registry: add cases when new `templateId` values ship from the backend. */
export function StorefrontTemplateView({ config }: StorefrontTemplateViewProps) {
  switch (config.templateId) {
    case "classic-boutique":
      return <ClassicBoutiqueStorefront config={config} />;
    default:
      return <ClassicBoutiqueStorefront config={config} />;
  }
}
