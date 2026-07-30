import type { StorefrontTemplateId } from "@/types/storefront";

export type StorefrontTemplateCatalogEntry = {
  id: StorefrontTemplateId | string;
  name: string;
  description: string;
  /** Short label shown on the gallery card. */
  vibe: string;
  available: boolean;
  templateVersion: number;
  /** Hero / cover image for the gallery card. */
  previewImageUrl: string;
};

/**
 * Frontend template catalog until `GET /storefront-templates` ships.
 * Only `classic-boutique` can be applied today.
 */
export const STOREFRONT_TEMPLATE_CATALOG: StorefrontTemplateCatalogEntry[] = [
  {
    id: "classic-boutique",
    name: "Classic Boutique",
    description:
      "Editorial homepage with hero, featured products, promos, and values — a polished retail layout from day one.",
    vibe: "Editorial retail",
    available: true,
    templateVersion: 1,
    previewImageUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
  },
];

export function getStorefrontTemplateCatalogEntry(
  id: string,
): StorefrontTemplateCatalogEntry | undefined {
  return STOREFRONT_TEMPLATE_CATALOG.find((t) => t.id === id);
}
