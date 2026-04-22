import defaultStorefrontJson from "@/data/default-storefront.json";
import { normalizeStorefrontThemeId } from "@/lib/storefront-themes";
import type {
  StorefrontConfig,
  StorefrontFeature,
  StorefrontLink,
  StorefrontProductPlaceholder,
  StorefrontPromoCard,
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
  if (!raw?.length) return [...seed];
  const mapped = raw.map((p, i) => {
    const s = seed[Math.min(i, seed.length - 1)];
    return {
      title: String(p.title || s.title),
      priceLabel: String(p.priceLabel || s.priceLabel),
      imageUrl: String(p.imageUrl || s.imageUrl),
    };
  });
  while (mapped.length < seed.length) {
    mapped.push({ ...seed[mapped.length] });
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
      title: String(card.title || s.title),
      description: String(card.description || s.description),
      buttonLabel: String(card.buttonLabel || s.buttonLabel),
      imageUrl: String(card.imageUrl || s.imageUrl),
      href: String(card.href || s.href),
    };
  }) as [StorefrontPromoCard, StorefrontPromoCard];
}

const VALID_ICONS = new Set(["check", "truck", "sparkle"]);

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
      title: String(f.title || s.title),
      description: String(f.description || s.description),
      icon,
    };
  }) as [StorefrontFeature, StorefrontFeature, StorefrontFeature];
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

  const themeId = normalizeStorefrontThemeId(
    (legacy as StorefrontConfig & { themeId?: string }).themeId ??
      seed.themeId,
  ) as StorefrontThemeId;

  return {
    ...seed,
    ...legacy,
    configVersion: 3,
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
    shopName: String(legacy.shopName || seed.shopName),
    tagline: String(legacy.tagline || seed.tagline),
    featuredTitle: String(legacy.featuredTitle || seed.featuredTitle),
    heroHeading: String(legacy.heroHeading || seed.heroHeading),
    heroSubheading: String(legacy.heroSubheading || seed.heroSubheading),
    whatsappNumber: String(legacy.whatsappNumber || seed.whatsappNumber),
    accentColor: String(legacy.accentColor || seed.accentColor),
    templateId: (legacy.templateId ||
      seed.templateId) as StorefrontTemplateId,
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
  return {
    ...seed,
    updatedAt: Date.now(),
  };
}
