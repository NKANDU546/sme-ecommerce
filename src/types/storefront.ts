export type StorefrontTemplateId = "classic-boutique";

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

export type StorefrontConfig = {
  templateId: StorefrontTemplateId;
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
