import { ClassicBoutiqueSiteFooter } from "@/components/storefront/templates/classic-boutique-site-footer";
import { ClassicBoutiqueSiteHeader } from "@/components/storefront/templates/classic-boutique-site-header";
import { MinimalCatalogueSiteFooter } from "@/components/storefront/templates/minimal-catalogue-site-footer";
import { MinimalCatalogueSiteHeader } from "@/components/storefront/templates/minimal-catalogue-site-header";
import type { StorefrontConfig, StorefrontTemplateId } from "@/types/storefront";

export type StorefrontChromeProps = {
  config: StorefrontConfig;
  basePath?: string;
  workspaceId?: string;
  forceViewport?: "mobile" | "desktop";
};

function resolveTemplateId(
  config: StorefrontConfig,
): StorefrontTemplateId {
  return config.templateId === "minimal-catalogue"
    ? "minimal-catalogue"
    : "classic-boutique";
}

/** Header chrome for the active `config.templateId`. */
export function StorefrontSiteHeader(props: StorefrontChromeProps) {
  if (resolveTemplateId(props.config) === "minimal-catalogue") {
    return <MinimalCatalogueSiteHeader {...props} />;
  }
  return <ClassicBoutiqueSiteHeader {...props} />;
}

/** Footer chrome for the active `config.templateId`. */
export function StorefrontSiteFooter(
  props: Omit<StorefrontChromeProps, "forceViewport">,
) {
  if (resolveTemplateId(props.config) === "minimal-catalogue") {
    return <MinimalCatalogueSiteFooter {...props} />;
  }
  return <ClassicBoutiqueSiteFooter {...props} />;
}
