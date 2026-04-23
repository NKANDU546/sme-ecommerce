import type {
  CatalogProduct,
  CatalogProductHighlight,
  CatalogProductSidebarBlock,
} from "@/types/catalog-product";

export type CatalogProductPdpView = CatalogProduct & {
  summary: string;
  gallery: string[];
  configurationLabel: string;
  warrantyNote: string;
  shippingNote: string;
  standardsTitle: string;
  standardsSubtitle: string;
  standards: CatalogProductHighlight[];
  hardwareTitle: string;
  hardwareBody: string;
  hardwareSpecs: string[];
  sidebarSections: CatalogProductSidebarBlock[];
  inStock: boolean;
};

const DEFAULT_STANDARDS: CatalogProductHighlight[] = [
  {
    title: "Quality you can trust",
    description:
      "Every unit is checked for finish and function so what arrives matches what you showed online.",
  },
  {
    title: "Thoughtful packaging",
    description:
      "Protective outer cartons and minimal inner plastic keep returns and damage rare.",
  },
  {
    title: "Merchant-first support",
    description:
      "When something slips, your queue stays readable so you can reply without losing the thread.",
  },
];

const DEFAULT_SIDEBAR: CatalogProductSidebarBlock[] = [
  {
    kicker: "Fulfilment",
    body: "Reserve stock for showroom and online in one view—counts stay honest as orders pick up.",
  },
  {
    kicker: "Returns",
    body: "Clear policies and simple messaging reduce back-and-forth when a customer changes their mind.",
  },
  {
    kicker: "Sustainability",
    body: "Highlight repairability, local suppliers, or low-impact materials where it matters to your buyers.",
  },
];

export function enrichCatalogProductForPdp(
  product: CatalogProduct,
): CatalogProductPdpView {
  const inStock = product.status === "active";

  const galleryFrom = [product.imageUrl, ...(product.galleryUrls ?? [])];
  const seen = new Set<string>();
  const gallery: string[] = [];
  for (const u of galleryFrom) {
    const t = u.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    gallery.push(t);
  }
  if (gallery.length === 0) gallery.push("");

  const summary =
    product.summary?.trim() ||
    `${product.title} is part of your local catalogue—tune copy, imagery, and pricing in the dashboard until your API is ready. Built for SMEs who sell on WhatsApp first and need a calm public face.`;

  const standards = product.standards?.length
    ? product.standards
    : DEFAULT_STANDARDS;

  const sidebarSections = product.sidebarSections?.length
    ? product.sidebarSections
    : DEFAULT_SIDEBAR;

  const hardwareSpecs =
    product.hardwareSpecs?.length && product.hardwareSpecs.some((s) => s.trim())
      ? product.hardwareSpecs
      : [
          "Premium materials and finish",
          "Designed for daily use",
          "Backed by your store policies",
          "Ready for pickup or delivery",
        ];

  return {
    ...product,
    summary,
    gallery,
    configurationLabel:
      product.configurationLabel?.trim() || "Standard configuration",
    warrantyNote:
      product.warrantyNote?.trim() || "Store warranty as published at checkout.",
    shippingNote:
      product.shippingNote?.trim() ||
      "Shipping options and cut-offs follow your workspace rules.",
    standardsTitle:
      product.standardsTitle?.trim() || "Uncompromising standards",
    standardsSubtitle:
      product.standardsSubtitle?.trim() ||
      "Clear promises, honest specs, and packaging that respects your brand.",
    standards,
    hardwareTitle: product.hardwareTitle?.trim() || "Product excellence",
    hardwareBody:
      product.hardwareBody?.trim() ||
      "Lead with what makes this SKU worth the price—materials, craft, and the story only you can tell.",
    hardwareSpecs,
    sidebarSections,
    inStock: product.status !== "archived",
  };
}
