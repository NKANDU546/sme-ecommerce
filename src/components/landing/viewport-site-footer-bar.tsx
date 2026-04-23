"use client";

import Link from "next/link";

const BAR_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function ViewportSiteFooterBar() {
  return (
    <footer
      className="fixed inset-x-0 bottom-0 z-50 border-t border-primary-blue/10 bg-background/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md supports-[backdrop-filter]:bg-background/85"
      role="contentinfo"
      aria-label="Site"
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-x-5 gap-y-1.5 px-4 font-sans text-[11px] font-medium text-muted-foreground sm:justify-between sm:px-8">
        <p className="order-2 shrink-0 sm:order-1">
          © {new Date().getFullYear()} SME Operations
        </p>
        <nav
          className="order-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 sm:order-2"
          aria-label="Quick links"
        >
          {BAR_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-primary-blue/80 underline decoration-primary-blue/25 underline-offset-2 transition-colors hover:text-primary-blue hover:decoration-primary-blue/50"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
