import { applyAiStorefrontCopy, applyAiStorefrontSectionCopy } from "@/lib/ai-storefront-copy-apply";
import type {
  AiStorefrontSectionCopyResult,
  AiStorefrontTemplateCopyResult,
} from "@/types/ai";
import type { StorefrontConfig, StorefrontSection } from "@/types/storefront";

const draft: AiStorefrontTemplateCopyResult = {
  kind: "template",
  shopName: "Kota Corner",
  tagline: "Fresh rolls, fast.",
  heroHeading: "Hungry? We’ve got you.",
  heroSubheading: "Loaded kotas and cold drinks ready when you are.",
  heroPrimaryCtaLabel: "Order now",
  heroSecondaryCtaLabel: "See menu",
  featuredTitle: "Popular today",
  promos: [
    {
      title: "Lunch special",
      description: "Combo deals until 3pm.",
      buttonLabel: "Grab deal",
    },
    {
      title: "New sauces",
      description: "Try the peri mayo.",
      buttonLabel: "Explore",
    },
  ],
  features: [
    { title: "Card & cash", description: "Pay your way at checkout." },
    { title: "Quick pickup", description: "Ready in minutes." },
    { title: "Friendly help", description: "WhatsApp us anytime." },
  ],
  footerBlurb: "Kotas made fresh in Soweto.",
  contactCtaTitle: "Questions?",
  contactCtaBody: "Message us before you order.",
  contactCtaButtonLabel: "Contact",
  model: "gpt-4o-mini",
  disclaimer: "Review before publishing.",
};

function baseConfig(): StorefrontConfig {
  return {
    templateId: "classic-boutique",
    themeId: "blue",
    configVersion: 5,
    shopName: "SME Operations",
    tagline: "Old tagline",
    navLinks: [{ label: "Shop", href: "@shop" }],
    activeNavIndex: 0,
    heroBackgroundImageUrl: "https://example.com/hero.jpg",
    heroHeading: "Old hero",
    heroSubheading: "Old sub",
    heroPrimaryCta: { label: "Shop", href: "@shop" },
    heroSecondaryCta: { label: "Sale", href: "@shop/sale" },
    featuredTitle: "Featured",
    featuredViewAll: { label: "View all", href: "@shop" },
    products: [],
    promos: [
      {
        title: "P1",
        description: "D1",
        buttonLabel: "B1",
        imageUrl: "https://example.com/p1.jpg",
        href: "@shop",
      },
      {
        title: "P2",
        description: "D2",
        buttonLabel: "B2",
        imageUrl: "https://example.com/p2.jpg",
        href: "@shop",
      },
    ],
    features: [
      { title: "F1", description: "FD1", icon: "truck" },
      { title: "F2", description: "FD2", icon: "check" },
      { title: "F3", description: "FD3", icon: "sparkle" },
    ],
    sections: [
      {
        id: "home-hero",
        type: "hero",
        imageUrl: "https://example.com/hero.jpg",
        heading: "Old",
        subheading: "Old sub",
        primaryCta: { label: "Shop", href: "@shop" },
        secondaryCta: { label: "Sale", href: "@shop/sale" },
      },
      {
        id: "home-featured",
        type: "featuredProducts",
        title: "Featured",
        viewAll: { label: "View all", href: "@shop" },
        limit: 4,
      },
      {
        id: "home-promo-1",
        type: "promoBanner",
        title: "P1",
        description: "D1",
        buttonLabel: "B1",
        imageUrl: "https://example.com/p1.jpg",
        href: "@shop",
      },
      {
        id: "home-features",
        type: "features",
        title: "Why us",
        items: [
          { title: "F1", description: "FD1", icon: "truck" },
          { title: "F2", description: "FD2", icon: "check" },
          { title: "F3", description: "FD3", icon: "sparkle" },
        ],
      },
      {
        id: "home-contact",
        type: "contactCta",
        title: "Help?",
        body: "Ping us",
        buttonLabel: "Contact",
        href: "@page:contact",
      },
    ],
    pages: [],
    collectionPages: {
      shop: {
        eyebrow: "",
        title: "Shop",
        description: "",
        imageUrl: "",
        chrome: {
          showSearch: true,
          showCollectionTabs: true,
          showCategoryFilters: true,
          tabAll: true,
          tabNew: true,
          tabSale: true,
        },
      },
      new: {
        eyebrow: "",
        title: "New",
        description: "",
        imageUrl: "",
        chrome: {
          showSearch: true,
          showCollectionTabs: true,
          showCategoryFilters: true,
          tabAll: true,
          tabNew: true,
          tabSale: true,
        },
      },
      sale: {
        eyebrow: "",
        title: "Sale",
        description: "",
        imageUrl: "",
        chrome: {
          showSearch: true,
          showCollectionTabs: true,
          showCategoryFilters: true,
          tabAll: true,
          tabNew: true,
          tabSale: true,
        },
      },
    },
    footerBlurb: "Old footer",
    footerShopLinks: [],
    footerPolicyLinks: [],
    footerConnectLinks: [],
    copyrightLine: "© Test",
    cartCountLabel: "0",
    whatsappNumber: "",
    accentColor: "#1e3a5f",
    updatedAt: 0,
  };
}

describe("applyAiStorefrontCopy", () => {
  it("rewrites text fields and preserves images/hrefs", () => {
    const next = applyAiStorefrontCopy(baseConfig(), draft);

    expect(next.shopName).toBe("Kota Corner");
    expect(next.tagline).toBe("Fresh rolls, fast.");
    expect(next.heroHeading).toBe("Hungry? We’ve got you.");
    expect(next.heroBackgroundImageUrl).toBe("https://example.com/hero.jpg");
    expect(next.promos[0].imageUrl).toBe("https://example.com/p1.jpg");
    expect(next.promos[0].href).toBe("@shop");
    expect(next.promos[0].title).toBe("Lunch special");
    expect(next.features[0].icon).toBe("truck");
    expect(next.features[0].title).toBe("Card & cash");

    const hero = next.sections.find((s) => s.type === "hero");
    expect(hero?.type === "hero" && hero.heading).toBe(
      "Hungry? We’ve got you.",
    );
    expect(hero?.type === "hero" && hero.imageUrl).toBe(
      "https://example.com/hero.jpg",
    );
    expect(hero?.type === "hero" && hero.primaryCta?.href).toBe("@shop");
    expect(hero?.type === "hero" && hero.primaryCta?.label).toBe("Order now");

    const contact = next.sections.find((s) => s.type === "contactCta");
    expect(contact?.type === "contactCta" && contact.title).toBe("Questions?");
    expect(contact?.type === "contactCta" && contact.href).toBe(
      "@page:contact",
    );
  });
});

describe("applyAiStorefrontSectionCopy", () => {
  it("rewrites one hero section without touching image/href", () => {
    const section: StorefrontSection = {
      id: "home-hero",
      type: "hero",
      imageUrl: "https://example.com/hero.jpg",
      heading: "Old",
      subheading: "Old sub",
      primaryCta: { label: "Shop", href: "@shop" },
      secondaryCta: { label: "Sale", href: "@shop/sale" },
    };
    const draft: AiStorefrontSectionCopyResult = {
      kind: "section",
      sectionType: "hero",
      fields: {
        heading: "Fresh heading",
        subheading: "Fresh sub",
        primaryCtaLabel: "Order",
        secondaryCtaLabel: "Menu",
      },
      model: "gpt-4o-mini",
      disclaimer: "Review",
    };
    const next = applyAiStorefrontSectionCopy(section, draft);
    expect(next.type).toBe("hero");
    if (next.type !== "hero") return;
    expect(next.heading).toBe("Fresh heading");
    expect(next.subheading).toBe("Fresh sub");
    expect(next.imageUrl).toBe("https://example.com/hero.jpg");
    expect(next.primaryCta?.href).toBe("@shop");
    expect(next.primaryCta?.label).toBe("Order");
  });
});
