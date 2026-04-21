"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/landing/site-footer";

export function ConditionalSiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard")) return null;
  if (pathname?.startsWith("/preview")) return null;
  return <SiteFooter />;
}
