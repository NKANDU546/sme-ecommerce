import defaultStorefrontJson from "@/data/default-storefront.json";
import {
  STOREFRONT_THEME_DEFINITIONS,
  normalizeStorefrontThemeId,
} from "@/lib/storefront-themes";
import type {
  StorefrontConfig,
  StorefrontFeature,
  StorefrontFaqItem,
  StorefrontLink,
  StorefrontCustomPage,
  StorefrontProductPlaceholder,
  StorefrontPromoCard,
  StorefrontSection,
  StorefrontSeed,
  StorefrontTemplateId,
  StorefrontThemeId,
} from "@/types/storefront";

const STORAGE_PREFIX = "sme_storefront_v1_";

export function storefrontStorageKey(workspaceId: string): string {
  return `${STORAGE_PREFIX}${workspaceId}`;
}

function mergeLink(
  raw: StorefrontLink | undefined,
  seed: StorefrontLink,
): StorefrontLink {
  if (!raw) return { ...seed };
  return {
    label: String(raw.label ?? seed.label),
    href: String(raw.href ?? seed.href),
  };
}

/** `null` = intentionally hidden; `undefined` = legacy missing → use seed. */
function mergeOptionalLink(
  raw: StorefrontLink | null | undefined,
  seed: StorefrontLink,
): StorefrontLink | null {
  if (raw === null) return null;
  return mergeLink(raw, seed);
}

/**
 * Persists section product limits.
 * `null` means "show all"; omit / invalid falls back to `fallback`.
 */
function clampSectionProductLimit(
  raw: unknown,
  fallback: number | null | undefined,
): number | null | undefined {
  if (raw === null) return null;
  if (raw === undefined || raw === "") return fallback;
  if (typeof raw === "string" && raw.trim().toLowerCase() === "all") {
    return null;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(48, Math.max(1, Math.floor(n)));
}

function mergeLinkList(
  raw: StorefrontLink[] | undefined,
  seed: StorefrontLink[],
): StorefrontLink[] {
  if (!raw?.length) return [...seed];
  return raw.map((l, i) => mergeLink(l, seed[Math.min(i, seed.length - 1)]));
}

function mergeProducts(
  raw: StorefrontProductPlaceholder[] | undefined,
  seed: StorefrontProductPlaceholder[],
): StorefrontProductPlaceholder[] {
  const base = seed.length
    ? seed
    : [{ title: "New product", priceLabel: "R 0.00", imageUrl: "" }];
  if (!raw?.length) return [...base];
  const mapped = raw.map((p, i) => {
    const s = base[Math.min(i, base.length - 1)];
    return {
      title: String(p.title ?? s.title),
      priceLabel: String(p.priceLabel ?? s.priceLabel),
      imageUrl: String(p.imageUrl ?? s.imageUrl),
    };
  });
  while (mapped.length < base.length) {
    mapped.push({ ...base[mapped.length] });
  }
  return mapped;
}

function mergePromos(
  raw: StorefrontPromoCard[] | undefined,
  seed: [StorefrontPromoCard, StorefrontPromoCard],
): [StorefrontPromoCard, StorefrontPromoCard] {
  if (!raw || raw.length !== 2) return [...seed] as [StorefrontPromoCard, StorefrontPromoCard];
  return raw.map((card, i) => {
    const s = seed[i];
    return {
      title: String(card.title ?? s.title),
      description: String(card.description ?? s.description),
      buttonLabel: String(card.buttonLabel ?? s.buttonLabel),
      imageUrl: String(card.imageUrl ?? s.imageUrl),
      href: String(card.href ?? s.href),
    };
  }) as [StorefrontPromoCard, StorefrontPromoCard];
}

const VALID_ICONS = new Set(["check", "truck", "sparkle"]);
const VALID_SECTION_TYPES = new Set<StorefrontSection["type"]>([
  "hero",
  "featuredProducts",
  "promoBanner",
  "textImage",
  "features",
  "faq",
  "contactCta",
  "testimonials",
  "instagramGallery",
  "newsletter",
  "shopByCategory",
  "newArrivals",
  "sale",
]);
const VALID_DESKTOP_LAYOUTS = new Set(["full", "half"]);

function mergeFeatures(
  raw: StorefrontFeature[] | undefined,
  seed: [StorefrontFeature, StorefrontFeature, StorefrontFeature],
): [StorefrontFeature, StorefrontFeature, StorefrontFeature] {
  if (!raw || raw.length !== 3) return [...seed] as [StorefrontFeature, StorefrontFeature, StorefrontFeature];
  return raw.map((f, i) => {
    const s = seed[i];
    const ic = typeof f.icon === "string" ? f.icon : "";
    const icon = VALID_ICONS.has(ic)
      ? (ic as StorefrontFeature["icon"])
      : s.icon;
    return {
      title: String(f.title ?? s.title),
      description: String(f.description ?? s.description),
      icon,
    };
  }) as [StorefrontFeature, StorefrontFeature, StorefrontFeature];
}

function mergeFeatureItems(
  raw: StorefrontFeature[] | undefined,
  seed: StorefrontFeature[],
): StorefrontFeature[] {
  const base = seed.length ? seed : getDefaultStorefrontSeed().features;
  if (!raw?.length) return [...base];
  return raw.map((f, i) => {
    const s = base[Math.min(i, base.length - 1)];
    const ic = typeof f.icon === "string" ? f.icon : "";
    const icon = VALID_ICONS.has(ic)
      ? (ic as StorefrontFeature["icon"])
      : s.icon;
    return {
      title: String(f.title ?? s.title),
      description: String(f.description ?? s.description),
      icon,
    };
  });
}

function sectionId(prefix: string, index: number): string {
  return `${prefix}-${index + 1}`;
}

function defaultHomeSections(config: StorefrontConfig): StorefrontSection[] {
  return [
    {
      id: "home-hero",
      type: "hero",
      imageUrl: String(config.heroBackgroundImageUrl || ""),
      heading: String(config.heroHeading || "Welcome to our store"),
      subheading: String(config.heroSubheading || ""),
      primaryCta: mergeLink(config.heroPrimaryCta, {
        label: "Shop collection",
        href: "@shop",
      }),
      secondaryCta: mergeLink(config.heroSecondaryCta, {
        label: "Learn more",
        href: "#",
      }),
    },
    {
      id: "home-featured-products",
      type: "featuredProducts",
      title: String(config.featuredTitle || "Featured products"),
      viewAll: mergeLink(config.featuredViewAll, {
        label: "View all",
        href: "@shop",
      }),
      limit: 4,
    },
    ...config.promos.map((promo, index) => ({
      id: `home-promo-${index + 1}`,
      type: "promoBanner" as const,
      title: String(promo.title || "Promotion"),
      description: String(promo.description || ""),
      buttonLabel: String(promo.buttonLabel || "Shop now"),
      imageUrl: String(promo.imageUrl || ""),
      href: String(promo.href || "#"),
    })),
    {
      id: "home-features",
      type: "features",
      title: "Why shop with us",
      items: config.features,
    },
    {
      id: "home-contact",
      type: "contactCta",
      title: "Need help choosing?",
      body: "Message us on WhatsApp and we will help you find the right products for your order.",
      buttonLabel: "Contact us",
      href: config.whatsappNumber ? `https://wa.me/${config.whatsappNumber.replace(/\D/g, "")}` : "#",
    },
  ];
}

function mergeFaqItems(raw: StorefrontFaqItem[] | undefined): StorefrontFaqItem[] {
  if (!raw?.length) {
    return [
      {
        question: "How do I place an order?",
        answer: "Browse the shop, add products to your cart, and complete checkout.",
      },
      {
        question: "Can I contact you before ordering?",
        answer: "Yes, use the contact button and we will help you on WhatsApp.",
      },
    ];
  }
  return raw.map((item) => ({
    question: String(item.question ?? "Question"),
    answer: String(item.answer ?? "Answer"),
  }));
}

function mergeSection(
  raw: StorefrontSection | undefined,
  fallback: StorefrontSection,
  index: number,
): StorefrontSection {
  if (!raw || !VALID_SECTION_TYPES.has(raw.type)) {
    return { ...fallback, id: fallback.id || sectionId("section", index) };
  }
  const id = String(raw.id || fallback.id || sectionId(raw.type, index));
  const desktopLayout = VALID_DESKTOP_LAYOUTS.has(raw.desktopLayout ?? "")
    ? raw.desktopLayout
    : fallback.desktopLayout;
  switch (raw.type) {
    case "hero":
      return {
        ...raw,
        id,
        desktopLayout,
        imageUrl: String(raw.imageUrl ?? ""),
        heading: String(raw.heading ?? "Welcome to our store"),
        subheading: String(raw.subheading ?? ""),
        primaryCta: mergeOptionalLink(raw.primaryCta, {
          label: "Shop collection",
          href: "@shop",
        }),
        secondaryCta: mergeOptionalLink(raw.secondaryCta, {
          label: "Learn more",
          href: "#",
        }),
      };
    case "featuredProducts":
      return {
        ...raw,
        id,
        desktopLayout,
        title: String(raw.title ?? "Featured products"),
        viewAll: mergeOptionalLink(raw.viewAll, {
          label: "View all",
          href: "@shop",
        }),
        limit: clampSectionProductLimit(
          (raw as { limit?: unknown }).limit,
          undefined,
        ),
      };
    case "promoBanner":
      return {
        ...raw,
        id,
        desktopLayout,
        title: String(raw.title ?? "Promotion"),
        description: String(raw.description ?? ""),
        buttonLabel: String(raw.buttonLabel ?? "Shop now"),
        imageUrl: String(raw.imageUrl ?? ""),
        href: String(raw.href ?? "#"),
      };
    case "textImage":
      return {
        ...raw,
        id,
        desktopLayout,
        eyebrow: String(raw.eyebrow ?? "Our story"),
        title: String(raw.title ?? "Tell customers what makes you different"),
        body: String(raw.body ?? ""),
        imageUrl: String(raw.imageUrl ?? ""),
        imagePosition: raw.imagePosition === "left" ? "left" : "right",
        cta: mergeLink(raw.cta, { label: "Learn more", href: "#" }),
      };
    case "features":
      return {
        ...raw,
        id,
        desktopLayout,
        title: String(raw.title ?? "Why shop with us"),
        items: mergeFeatureItems(
          raw.items,
          fallback.type === "features"
            ? fallback.items
            : getDefaultStorefrontSeed().features,
        ),
      };
    case "faq":
      return {
        ...raw,
        id,
        desktopLayout,
        title: String(raw.title ?? "Frequently asked questions"),
        items: mergeFaqItems(raw.items),
      };
    case "contactCta":
      return {
        ...raw,
        id,
        desktopLayout,
        title: String(raw.title ?? "Contact us"),
        body: String(raw.body ?? ""),
        buttonLabel: String(raw.buttonLabel ?? "Contact us"),
        href: String(raw.href ?? "#"),
      };
    case "testimonials":
      return {
        ...raw,
        id,
        desktopLayout,
        title: String(raw.title ?? "What customers say"),
        items: Array.isArray(raw.items)
          ? raw.items.map((item) => ({
              quote: String(item.quote ?? ""),
              name: String(item.name ?? "Customer"),
              role: String(item.role ?? ""),
              imageUrl: String(item.imageUrl ?? ""),
            }))
          : [
              {
                quote: "Beautiful products and such an easy ordering experience.",
                name: "Thandi M.",
                role: "Cape Town",
                imageUrl: "",
              },
            ],
      };
    case "instagramGallery":
      return {
        ...raw,
        id,
        desktopLayout,
        title: String(raw.title ?? "Follow us"),
        handle: String(raw.handle ?? "@yourstore"),
        images: Array.isArray(raw.images)
          ? raw.images.map((item) => ({
              imageUrl: String(item.imageUrl ?? ""),
              href: String(item.href ?? "#"),
            }))
          : [
              { imageUrl: "", href: "#" },
              { imageUrl: "", href: "#" },
              { imageUrl: "", href: "#" },
              { imageUrl: "", href: "#" },
            ],
      };
    case "newsletter":
      return {
        ...raw,
        id,
        desktopLayout,
        title: String(raw.title ?? "Stay in the loop"),
        body: String(
          raw.body ?? "Get new arrivals and offers first. No spam.",
        ),
        placeholder: String(raw.placeholder ?? "you@email.com"),
        buttonLabel: String(raw.buttonLabel ?? "Subscribe"),
        successMessage: String(
          raw.successMessage ?? "Thanks — you are on the list.",
        ),
      };
    case "shopByCategory":
      return {
        ...raw,
        id,
        desktopLayout,
        title: String(raw.title ?? "Shop by category"),
        viewAll: mergeLink(raw.viewAll, { label: "View all", href: "@shop" }),
        categories: Array.isArray(raw.categories)
          ? raw.categories.map((item) => ({
              name: String(item.name ?? "Category"),
              imageUrl: String(item.imageUrl ?? ""),
              href: String(item.href ?? "@shop"),
            }))
          : [],
      };
    case "newArrivals": {
      const na = raw as StorefrontSection & {
        type: "newArrivals";
        eyebrow?: string;
        viewAll?: StorefrontLink | null;
        limit?: unknown;
      };
      return {
        ...raw,
        id,
        desktopLayout,
        title: String(raw.title ?? "New arrivals"),
        eyebrow:
          typeof na.eyebrow === "string" ? na.eyebrow : "Just landed",
        viewAll: mergeOptionalLink(na.viewAll, {
          label: "Shop all new",
          href: "@shop",
        }),
        limit: clampSectionProductLimit(na.limit, undefined),
      };
    }
    case "sale": {
      const sale = raw as StorefrontSection & {
        type: "sale";
        viewAll?: StorefrontLink | null;
        buttonLabel?: string;
        href?: string;
        limit?: unknown;
      };
      const legacyViewAll: StorefrontLink | null | undefined =
        sale.viewAll !== undefined
          ? sale.viewAll
          : sale.buttonLabel != null || sale.href != null
            ? {
                label: String(sale.buttonLabel ?? "Shop the sale"),
                href: String(sale.href ?? "@shop"),
              }
            : undefined;
      return {
        ...raw,
        id,
        desktopLayout,
        eyebrow: String(raw.eyebrow ?? "Sale"),
        title: String(raw.title ?? "Limited-time offers"),
        description: String(
          raw.description ?? "Save on selected pieces while stocks last.",
        ),
        viewAll: mergeOptionalLink(legacyViewAll, {
          label: "Shop the sale",
          href: "@shop",
        }),
        imageUrl: String(raw.imageUrl ?? ""),
        limit: clampSectionProductLimit(sale.limit, undefined),
      };
    }
  }
}

function mergeSections(
  raw: StorefrontSection[] | undefined,
  fallback: StorefrontSection[],
): StorefrontSection[] {
  // Preserve intentional empty arrays (e.g. a new custom page with no sections).
  if (raw === undefined || raw === null) return fallback.map((section, index) =>
    mergeSection(section, fallback[Math.min(index, fallback.length - 1)], index),
  );
  if (raw.length === 0) return [];
  return raw.map((section, index) =>
    mergeSection(section, fallback[Math.min(index, fallback.length - 1)], index),
  );
}

function slugify(raw: string, fallback: string): string {
  const slug = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function mergePages(
  raw: StorefrontCustomPage[] | undefined,
  fallbackSections: StorefrontSection[],
): StorefrontCustomPage[] {
  if (!raw?.length) return [];
  return raw.map((page, index) => ({
    id: String(page.id || sectionId("page", index)),
    title: typeof page.title === "string" ? page.title : `Page ${index + 1}`,
    slug: slugify(page.slug || page.title, `page-${index + 1}`),
    sections: mergeSections(page.sections, fallbackSections.slice(0, 1)),
  }));
}

export function upgradeStorefrontConfig(raw: StorefrontConfig): StorefrontConfig {
  const seed = getDefaultStorefrontSeed();
  type Legacy = StorefrontConfig & { heroImageUrl?: string };
  const legacy = raw as Legacy;
  const heroBg =
    legacy.heroBackgroundImageUrl?.trim() ||
    legacy.heroImageUrl?.trim() ||
    seed.heroBackgroundImageUrl;

  const navLen = legacy.navLinks?.length ?? 0;
  const navLinks =
    navLen >= 2
      ? legacy.navLinks!.map((l, i) =>
          mergeLink(l, seed.navLinks[Math.min(i, seed.navLinks.length - 1)]),
        )
      : [...seed.navLinks];

  const maxNav = Math.max(0, navLinks.length - 1);
  const activeNavIndex = Math.min(
    Math.max(0, Number(legacy.activeNavIndex ?? seed.activeNavIndex)),
    maxNav,
  );

  const rawThemeId = (legacy as StorefrontConfig & { themeId?: string })
    .themeId;
  const themeId = normalizeStorefrontThemeId(
    rawThemeId ?? seed.themeId,
  ) as StorefrontThemeId;
  const accentColor =
    rawThemeId === "blue" || rawThemeId === "red"
      ? String(legacy.accentColor || seed.accentColor)
      : STOREFRONT_THEME_DEFINITIONS[themeId].defaultAccent;

  const baseConfig = {
    ...seed,
    ...legacy,
    configVersion: 4,
    themeId,
    heroBackgroundImageUrl: heroBg,
    navLinks,
    activeNavIndex,
    heroPrimaryCta: mergeLink(legacy.heroPrimaryCta, seed.heroPrimaryCta),
    heroSecondaryCta: mergeLink(legacy.heroSecondaryCta, seed.heroSecondaryCta),
    featuredViewAll: mergeLink(legacy.featuredViewAll, seed.featuredViewAll),
    products: mergeProducts(legacy.products, seed.products),
    promos: mergePromos(legacy.promos, seed.promos),
    features: mergeFeatures(legacy.features, seed.features),
    footerShopLinks: mergeLinkList(legacy.footerShopLinks, seed.footerShopLinks),
    footerPolicyLinks: mergeLinkList(
      legacy.footerPolicyLinks,
      seed.footerPolicyLinks,
    ),
    footerConnectLinks: mergeLinkList(
      legacy.footerConnectLinks,
      seed.footerConnectLinks,
    ),
    footerBlurb: String(legacy.footerBlurb ?? seed.footerBlurb),
    copyrightLine: String(legacy.copyrightLine ?? seed.copyrightLine),
    cartCountLabel: String(legacy.cartCountLabel ?? seed.cartCountLabel),
    shopName: String(legacy.shopName ?? seed.shopName),
    tagline: String(legacy.tagline ?? seed.tagline),
    featuredTitle: String(legacy.featuredTitle ?? seed.featuredTitle),
    heroHeading: String(legacy.heroHeading ?? seed.heroHeading),
    heroSubheading: String(legacy.heroSubheading ?? seed.heroSubheading),
    whatsappNumber: String(legacy.whatsappNumber ?? seed.whatsappNumber),
    accentColor,
    templateId: (legacy.templateId ||
      seed.templateId) as StorefrontTemplateId,
  };
  const fallbackSections = defaultHomeSections(baseConfig);
  return {
    ...baseConfig,
    sections: mergeSections(legacy.sections, fallbackSections),
    pages: mergePages(legacy.pages, fallbackSections),
  };
}

export function loadStorefront(workspaceId: string): StorefrontConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storefrontStorageKey(workspaceId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StorefrontConfig;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.products)) return null;
    return upgradeStorefrontConfig(parsed);
  } catch {
    return null;
  }
}

export function saveStorefront(
  workspaceId: string,
  config: StorefrontConfig,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      storefrontStorageKey(workspaceId),
      JSON.stringify(config),
    );
  } catch {
    /* quota / private mode */
  }
}

export function getDefaultStorefrontSeed(): StorefrontSeed {
  return { ...(defaultStorefrontJson as unknown as StorefrontSeed) };
}

export function createInitialStorefrontFromSeed(): StorefrontConfig {
  const seed = getDefaultStorefrontSeed();
  return upgradeStorefrontConfig({
    ...seed,
    updatedAt: Date.now(),
  } as StorefrontConfig);
}
