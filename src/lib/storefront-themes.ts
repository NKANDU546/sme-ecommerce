import type { CSSProperties } from "react";
import type { StorefrontConfig, StorefrontThemeId } from "@/types/storefront";

export const DEFAULT_STOREFRONT_THEME_ID: StorefrontThemeId = "boutique-navy";

export type StorefrontThemeDefinition = {
  id: StorefrontThemeId;
  label: string;
  /** Used when `config.accentColor` is empty or invalid. */
  defaultAccent: string;
  pageBg: string;
  bodyText: string;
  headerSurface: string;
  promoSectionBg: string;
  valuesSectionBg: string;
  footerBg: string;
  neutralWash: string;
  neutralWashSoft: string;
  neutralWashMedium: string;
  neutralWashStrong: string;
  cartBadgeText: string;
};

export const STOREFRONT_THEME_DEFINITIONS: Record<
  StorefrontThemeId,
  StorefrontThemeDefinition
> = {
  "boutique-navy": {
    id: "boutique-navy",
    label: "Boutique navy",
    defaultAccent: "#0a2540",
    pageBg: "#ffffff",
    bodyText: "#1a1a1a",
    headerSurface: "rgba(255, 255, 255, 0.95)",
    promoSectionBg: "#f6f7f9",
    valuesSectionBg: "#eef1f5",
    footerBg: "#e8ecf2",
    neutralWash: "rgba(220, 220, 237, 0.8)",
    neutralWashSoft: "rgba(220, 220, 237, 0.3)",
    neutralWashMedium: "rgba(220, 220, 237, 0.5)",
    neutralWashStrong: "rgba(220, 220, 237, 0.6)",
    cartBadgeText: "#ffffff",
  },
  "warm-sand": {
    id: "warm-sand",
    label: "Warm sand",
    defaultAccent: "#6b4423",
    pageBg: "#fffdf8",
    bodyText: "#2a2118",
    headerSurface: "rgba(255, 253, 248, 0.95)",
    promoSectionBg: "#f3ebe1",
    valuesSectionBg: "#ebe2d6",
    footerBg: "#e4d8c8",
    neutralWash: "rgba(212, 196, 176, 0.75)",
    neutralWashSoft: "rgba(212, 196, 176, 0.35)",
    neutralWashMedium: "rgba(212, 196, 176, 0.5)",
    neutralWashStrong: "rgba(212, 196, 176, 0.62)",
    cartBadgeText: "#ffffff",
  },
};

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbaAccent(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

export type StorefrontResolvedTheme = StorefrontThemeDefinition & {
  accent: string;
  accentBorder10: string;
  accentBorder5: string;
  accentBorder15: string;
  accentBorder25: string;
  accentBorder30: string;
  accentBorder35: string;
  accentText45: string;
  accentText55: string;
  accentText60: string;
  accentText65: string;
  accentText70: string;
  accentText80: string;
  accentText90: string;
  navHoverWash: string;
  iconTileText: string;
};

export function resolveAccentShades(accent: string): Omit<
  StorefrontResolvedTheme,
  keyof StorefrontThemeDefinition
> {
  return {
    accent,
    accentBorder10: rgbaAccent(accent, 0.1),
    accentBorder5: rgbaAccent(accent, 0.05),
    accentBorder15: rgbaAccent(accent, 0.15),
    accentBorder25: rgbaAccent(accent, 0.25),
    accentBorder30: rgbaAccent(accent, 0.3),
    accentBorder35: rgbaAccent(accent, 0.35),
    accentText45: rgbaAccent(accent, 0.45),
    accentText55: rgbaAccent(accent, 0.55),
    accentText60: rgbaAccent(accent, 0.6),
    accentText65: rgbaAccent(accent, 0.65),
    accentText70: rgbaAccent(accent, 0.7),
    accentText80: rgbaAccent(accent, 0.8),
    accentText90: rgbaAccent(accent, 0.9),
    navHoverWash: rgbaAccent(accent, 0.12),
    iconTileText: accent,
  };
}

const THEME_IDS = new Set<string>(Object.keys(STOREFRONT_THEME_DEFINITIONS));

export function normalizeStorefrontThemeId(
  raw: string | undefined,
): StorefrontThemeId {
  if (raw && THEME_IDS.has(raw)) return raw as StorefrontThemeId;
  return DEFAULT_STOREFRONT_THEME_ID;
}

export function resolveStorefrontTheme(
  config: StorefrontConfig,
): StorefrontResolvedTheme {
  const def =
    STOREFRONT_THEME_DEFINITIONS[normalizeStorefrontThemeId(config.themeId)];
  const trimmed = config.accentColor?.trim() ?? "";
  const accent = hexToRgb(trimmed) ? trimmed : def.defaultAccent;
  return { ...def, ...resolveAccentShades(accent) };
}

export function storefrontThemeCssVars(
  theme: StorefrontResolvedTheme,
): CSSProperties {
  return {
    "--sf-page-bg": theme.pageBg,
    "--sf-body-text": theme.bodyText,
    "--sf-header-surface": theme.headerSurface,
    "--sf-accent": theme.accent,
    "--sf-accent-border-10": theme.accentBorder10,
    "--sf-accent-border-5": theme.accentBorder5,
    "--sf-accent-border-15": theme.accentBorder15,
    "--sf-accent-border-25": theme.accentBorder25,
    "--sf-accent-border-30": theme.accentBorder30,
    "--sf-accent-border-35": theme.accentBorder35,
    "--sf-accent-text-45": theme.accentText45,
    "--sf-accent-text-55": theme.accentText55,
    "--sf-accent-text-60": theme.accentText60,
    "--sf-accent-text-65": theme.accentText65,
    "--sf-accent-text-70": theme.accentText70,
    "--sf-accent-text-80": theme.accentText80,
    "--sf-accent-text-90": theme.accentText90,
    "--sf-nav-hover-wash": theme.navHoverWash,
    "--sf-icon-tile-bg": theme.neutralWash,
    "--sf-icon-tile-text": theme.iconTileText,
    "--sf-card-frame-bg": theme.neutralWashSoft,
    "--sf-promo-placeholder": theme.neutralWashMedium,
    "--sf-hero-placeholder": theme.neutralWashStrong,
    "--sf-promo-section-bg": theme.promoSectionBg,
    "--sf-values-section-bg": theme.valuesSectionBg,
    "--sf-footer-bg": theme.footerBg,
    "--sf-cart-badge-fg": theme.cartBadgeText,
  } as CSSProperties;
}
