"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/landing/site-footer";
import { ViewportSiteFooterBar } from "@/components/landing/viewport-site-footer-bar";

export function ConditionalSiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard")) return null;
  if (pathname?.startsWith("/preview")) return null;
  return (
    <>
      <SiteFooter />
      <ViewportSiteFooterBar />
    </>
  );
}
