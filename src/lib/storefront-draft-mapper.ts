import {
  getDefaultStorefrontSeed,
  upgradeStorefrontConfig,
} from "@/lib/storefront-storage";
import type { StorefrontConfig, StorefrontTemplateId } from "@/types/storefront";
import type { StorefrontDraft, UpdateStorefrontDraftBody } from "@/types/workspace";

function parseUpdatedAt(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const ms = Date.parse(value);
    if (!Number.isNaN(ms)) return ms;
  }
  // Jackson sometimes serializes LocalDateTime as [y,m,d,h,min,s,nano]
  if (Array.isArray(value) && value.length >= 3) {
    const [y, m, d, h = 0, min = 0, s = 0] = value.map(Number);
    const ms = Date.UTC(y, (m || 1) - 1, d || 1, h, min, s);
    if (!Number.isNaN(ms)) return ms;
  }
  return Date.now();
}

/**
 * Maps a backend draft payload into the frontend `StorefrontConfig` shape.
 * Runs `upgradeStorefrontConfig` so older/simpler backend seeds still render.
 */
export function storefrontDraftToConfig(draft: StorefrontDraft): StorefrontConfig {
  const seed = getDefaultStorefrontSeed();
  const raw = draft.config ?? {};
  const merged = {
    ...seed,
    ...raw,
    templateId: (String(raw.templateId || draft.templateId || seed.templateId) ||
      "classic-boutique") as StorefrontTemplateId,
    configVersion: Number(
      raw.configVersion ?? draft.configVersion ?? seed.configVersion,
    ),
    products: Array.isArray(raw.products) ? raw.products : seed.products,
    sections: Array.isArray(raw.sections) ? raw.sections : seed.sections,
    pages: Array.isArray(raw.pages) ? raw.pages : seed.pages,
    collectionPages:
      raw.collectionPages && typeof raw.collectionPages === "object"
        ? (raw.collectionPages as StorefrontConfig["collectionPages"])
        : seed.collectionPages,
    updatedAt: parseUpdatedAt(raw.updatedAt ?? draft.updatedAt),
  } as StorefrontConfig;

  return upgradeStorefrontConfig(merged);
}

/** Builds the PUT body expected by Step 01 `UpdateStorefrontDraftRequest`. */
export function configToUpdateDraftBody(
  config: StorefrontConfig,
  templateVersion: number,
): UpdateStorefrontDraftBody {
  const { updatedAt: _updatedAt, ...rest } = config;
  return {
    templateId: config.templateId,
    templateVersion,
    configVersion: config.configVersion,
    config: {
      ...rest,
      templateId: config.templateId,
      configVersion: config.configVersion,
      updatedAt: Date.now(),
    },
  };
}
