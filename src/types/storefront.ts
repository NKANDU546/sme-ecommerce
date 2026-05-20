export type StorefrontTemplateId = "classic-boutique";

/** Visual preset (surfaces + default accent). See `src/lib/storefront-themes.ts`. */
export type StorefrontThemeId = "blue" | "red";

export type StorefrontLink = {
  label: string;
  href: string;
};

export type StorefrontProductPlaceholder = {
  title: string;
  priceLabel: string;
  imageUrl: string;
};

export type StorefrontPromoCard = {
  title: string;
  description: string;
  buttonLabel: string;
  imageUrl: string;
  href: string;
};

export type StorefrontFeatureIconId = "check" | "truck" | "sparkle";

export type StorefrontFeature = {
  title: string;
  description: string;
  icon: StorefrontFeatureIconId;
};

export type StorefrontFaqItem = {
  question: string;
  answer: string;
};

export type StorefrontSectionBase = {
  id: string;
};

export type StorefrontHeroSection = StorefrontSectionBase & {
  type: "hero";
  imageUrl: string;
  heading: string;
  subheading: string;
  primaryCta: StorefrontLink;
  secondaryCta: StorefrontLink;
};

export type StorefrontFeaturedProductsSection = StorefrontSectionBase & {
  type: "featuredProducts";
  title: string;
  viewAll: StorefrontLink;
  products: StorefrontProductPlaceholder[];
};

export type StorefrontPromoBannerSection = StorefrontSectionBase & {
  type: "promoBanner";
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
  imageUrl: string;
};

export type StorefrontTextImageSection = StorefrontSectionBase & {
  type: "textImage";
  eyebrow: string;
  title: string;
  body: string;
  imageUrl: string;
  imagePosition: "left" | "right";
  cta: StorefrontLink;
};

export type StorefrontFeaturesSection = StorefrontSectionBase & {
  type: "features";
  title: string;
  items: StorefrontFeature[];
};

export type StorefrontFaqSection = StorefrontSectionBase & {
  type: "faq";
  title: string;
  items: StorefrontFaqItem[];
};

export type StorefrontContactCtaSection = StorefrontSectionBase & {
  type: "contactCta";
  title: string;
  body: string;
  buttonLabel: string;
  href: string;
};

export type StorefrontSection =
  | StorefrontHeroSection
  | StorefrontFeaturedProductsSection
  | StorefrontPromoBannerSection
  | StorefrontTextImageSection
  | StorefrontFeaturesSection
  | StorefrontFaqSection
  | StorefrontContactCtaSection;

export type StorefrontCustomPage = {
  id: string;
  title: string;
  slug: string;
  sections: StorefrontSection[];
};

export type StorefrontConfig = {
  templateId: StorefrontTemplateId;
  themeId: StorefrontThemeId;
  /** Bump when schema changes (migration in `upgradeStorefrontConfig`). */
  configVersion: number;

  shopName: string;
  tagline: string;

  /** Top nav (e.g. Shop, Collections, …) */
  navLinks: StorefrontLink[];
  /** Which `navLinks` index shows the active underline (0-based). */
  activeNavIndex: number;

  /** Full-bleed hero background image */
  heroBackgroundImageUrl: string;
  heroHeading: string;
  heroSubheading: string;
  heroPrimaryCta: StorefrontLink;
  heroSecondaryCta: StorefrontLink;

  featuredTitle: string;
  featuredViewAll: StorefrontLink;

  /** Featured grid (four columns on large screens). */
  products: StorefrontProductPlaceholder[];

  /** Two promo tiles (wide / narrow split on desktop). */
  promos: [StorefrontPromoCard, StorefrontPromoCard];
  features: [StorefrontFeature, StorefrontFeature, StorefrontFeature];
  sections: StorefrontSection[];
  pages: StorefrontCustomPage[];

  footerBlurb: string;
  footerShopLinks: StorefrontLink[];
  footerPolicyLinks: StorefrontLink[];
  footerConnectLinks: StorefrontLink[];
  copyrightLine: string;

  /** Shown on cart badge in nav */
  cartCountLabel: string;

  whatsappNumber: string;
  accentColor: string;

  updatedAt: number;
};

export type StorefrontSeed = Omit<StorefrontConfig, "updatedAt">;
