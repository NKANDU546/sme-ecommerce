export type CatalogProductStatus = "active" | "draft" | "archived";

export type CatalogProductHighlight = {
  title: string;
  description: string;
};

export type CatalogProductSidebarBlock = {
  kicker: string;
  body: string;
};

export type CatalogProduct = {
  id: string;
  title: string;
  sku: string;
  priceLabel: string;
  category: string;
  status: CatalogProductStatus;
  imageUrl: string;
  updatedAt: number;
  /** Long body for product detail (falls back in `enrichCatalogProductForPdp`). */
  summary?: string;
  /** Extra gallery images; main `imageUrl` is always first in the viewer. */
  galleryUrls?: string[];
  configurationLabel?: string;
  warrantyNote?: string;
  shippingNote?: string;
  standardsTitle?: string;
  standardsSubtitle?: string;
  standards?: CatalogProductHighlight[];
  hardwareTitle?: string;
  hardwareBody?: string;
  hardwareSpecs?: string[];
  sidebarSections?: CatalogProductSidebarBlock[];
};
