"use client";

import type { ReactNode } from "react";
import {
  resolveStorefrontTheme,
  storefrontThemeCssVars,
} from "@/lib/storefront-themes";
import type { StorefrontConfig } from "@/types/storefront";

type StorefrontThemeRootProps = {
  config: StorefrontConfig;
  children: ReactNode;
};

/** Injects storefront CSS variables derived from `themeId` + `accentColor`. */
export function StorefrontThemeRoot({
  config,
  children,
}: StorefrontThemeRootProps) {
  const theme = resolveStorefrontTheme(config);
  return (
    <div
      className="min-h-full bg-[color:var(--sf-page-bg)] font-sans text-[color:var(--sf-body-text)]"
      style={storefrontThemeCssVars(theme)}
    >
      {children}
    </div>
  );
}
