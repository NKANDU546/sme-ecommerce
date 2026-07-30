"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/landing/site-footer";

/**
 * Landing SiteFooter only — never on dashboard, preview, or merchant storefronts
 * (`/s/...`), where stores render their own ClassicBoutiqueSiteFooter.
 */
export function ConditionalSiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard")) return null;
  if (pathname?.startsWith("/preview")) return null;
  if (pathname?.startsWith("/s/")) return null;
  return <SiteFooter />;
}
