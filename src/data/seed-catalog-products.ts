import type { CatalogProduct } from "@/types/catalog-product";

/** Demo catalogue used until your API is ready. */
export const SEED_CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: "p-1",
    title: "Titanium task light",
    sku: "SKU-LGT-001",
    priceLabel: "R 249.00",
    category: "Home",
    status: "active",
    imageUrl:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=800&q=80",
    ],
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: "p-2",
    title: "Ceramic tea set",
    sku: "SKU-HOM-014",
    priceLabel: "R 189.00",
    category: "Home",
    status: "active",
    imageUrl:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=1200&q=80",
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: "p-3",
    title: "Studio task chair",
    sku: "SKU-OFC-003",
    priceLabel: "R 2 450.00",
    category: "Office",
    status: "active",
    imageUrl:
      "https://images.unsplash.com/photo-1580480055272-228038267cbd?auto=format&fit=crop&w=1200&q=80",
    updatedAt: Date.now() - 86400000,
  },
  {
    id: "p-4",
    title: "Wireless headphones",
    sku: "SKU-ELC-221",
    priceLabel: "R 899.00",
    category: "Electronics",
    status: "active",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618366712010-f4ae9f6470a6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=800&q=80",
    ],
    summary:
      "A calm, precise listening profile for long work sessions—premium drivers, adaptive noise control, and a frame built to survive daily commutes. Tuned for merchants who want flagship feel without flagship noise.",
    configurationLabel: "Pro audio pack · matte black",
    warrantyNote: "2-year limited warranty",
    shippingNote: "Free express on orders over R500 (preview)",
    standardsTitle: "Uncompromising standards",
    standardsSubtitle:
      "Engineered for clarity, comfort, and confidence—whether you are on the floor or on a call.",
    standards: [
      {
        title: "Precision-tuned drivers",
        description:
          "Balanced sound stage with controlled bass so voice and detail stay legible at any volume.",
      },
      {
        title: "Adaptive comfort",
        description:
          "Memory-foam cushions and featherweight housing reduce fatigue through double shifts.",
      },
      {
        title: "Sealed acoustic design",
        description:
          "Passive isolation keeps side noise out so your storefront playlist stays in the background.",
      },
    ],
    hardwareTitle: "Hardware excellence",
    hardwareBody:
      "From the hinge to the headband, every touchpoint is considered—metal accents, soft-touch coatings, and strain-relieved cabling.",
    hardwareSpecs: [
      "40mm dynamic drivers · hi-res capable",
      "32-hour battery · USB-C fast charge",
      "Dual-mic beamforming for calls",
      "Fold-flat carry profile",
    ],
    sidebarSections: [
      {
        kicker: "Sound architecture",
        body: "Closed-back geometry and tuned ports keep low-end tight without masking mids—ideal for demos and client calls.",
      },
      {
        kicker: "Ecosystem synergy",
        body: "Pairs cleanly with laptops, phones, and POS tablets—one SKU for front-of-house and back office.",
      },
      {
        kicker: "Sustainability",
        body: "Replaceable ear pads and a two-year service path stretch useful life before refresh cycles.",
      },
    ],
    updatedAt: Date.now() - 3600000 * 6,
  },
  {
    id: "p-5",
    title: "Linen throw blanket",
    sku: "SKU-HOM-088",
    priceLabel: "R 420.00",
    category: "Home",
    status: "active",
    imageUrl:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
    updatedAt: Date.now() - 86400000 * 12,
  },
  {
    id: "p-6",
    title: "Standing desk frame",
    sku: "SKU-OFC-102",
    priceLabel: "R 3 200.00",
    category: "Office",
    status: "active",
    imageUrl:
      "https://images.unsplash.com/photo-1518455027357-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: "p-7",
    title: "USB-C hub (7-in-1)",
    sku: "SKU-ELC-404",
    priceLabel: "R 599.00",
    category: "Electronics",
    status: "active",
    imageUrl:
      "https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=1200&q=80",
    updatedAt: Date.now() - 86400000 * 7,
  },
  {
    id: "p-8",
    title: "Leather desk mat",
    sku: "SKU-ACC-055",
    priceLabel: "R 310.00",
    category: "Accessories",
    status: "archived",
    imageUrl:
      "https://images.unsplash.com/photo-1619641809657-3c3b67b0b5c4?auto=format&fit=crop&w=1200&q=80",
    updatedAt: Date.now() - 86400000 * 90,
  },
];
