import {
  getDefaultStorefrontSeed,
  upgradeStorefrontConfig,
} from "@/lib/storefront-storage";
import type { PublicStorefront } from "@/types/public-storefront";
import type { StorefrontSection } from "@/types/storefront";
import type { StorefrontConfig, StorefrontTemplateId } from "@/types/storefront";

function parseUpdatedAt(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const ms = Date.parse(value);
    if (!Number.isNaN(ms)) return ms;
  }
  if (Array.isArray(value) && value.length >= 3) {
    const [y, m, d, h = 0, min = 0, s = 0] = value.map(Number);
    const ms = Date.UTC(y, (m || 1) - 1, d || 1, h, min, s);
    if (!Number.isNaN(ms)) return ms;
  }
  return Date.now();
}

function normalizePublicHomeSections(
  rawSections: unknown,
): StorefrontSection[] | undefined {
  if (!Array.isArray(rawSections)) return undefined;
  const sections = rawSections as StorefrontSection[];
  const heroIndex = sections.findIndex(
    (section) =>
      section &&
      typeof section === "object" &&
      "type" in section &&
      section.type === "hero",
  );
  if (heroIndex <= 0) return sections;

  const hero = sections[heroIndex];
  return [
    hero,
    ...sections.slice(0, heroIndex),
    ...sections.slice(heroIndex + 1),
  ];
}

/** Maps a published public storefront payload into `StorefrontConfig`. */
export function publicStorefrontToConfig(
  storefront: PublicStorefront,
): StorefrontConfig {
  const seed = getDefaultStorefrontSeed();
  const raw = storefront.config ?? {};
  const rawSections = normalizePublicHomeSections(raw.sections);
  const hasHeroSection = rawSections?.some(
    (section) =>
      section &&
      typeof section === "object" &&
      "type" in section &&
      section.type === "hero",
  );
  const merged = {
    ...raw,
    templateId: (String(
      raw.templateId || storefront.templateId || seed.templateId,
    ) || "classic-boutique") as StorefrontTemplateId,
    configVersion: Number(
      raw.configVersion ?? storefront.configVersion ?? seed.configVersion,
    ),
    shopName: String(raw.shopName || storefront.storeName || seed.shopName),
    products: Array.isArray(raw.products) ? raw.products : undefined,
    sections: hasHeroSection ? rawSections : undefined,
    pages: Array.isArray(raw.pages) ? raw.pages : undefined,
    updatedAt: parseUpdatedAt(raw.updatedAt ?? storefront.publishedAt),
  } as StorefrontConfig;

  return upgradeStorefrontConfig(merged);
}
