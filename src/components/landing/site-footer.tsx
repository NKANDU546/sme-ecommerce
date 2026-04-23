"use client";

import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms" },
  { href: "/#philosophy", label: "Philosophy" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-primary-blue   px-5 py-14 text-foreground sm:px-10 sm:py-16 lg:px-20 lg:py-20">
      <div className="mx-auto flex max-w-[1600px] flex-col">
        <div className="min-w-0">
          <p className="text-xl font-bold tracking-tight text-blue-gray sm:text-2xl">
            SME Operations
          </p>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/60 sm:text-base">
            Architecting calmer retail operations through WhatsApp-native order
            capture—clear queues, fewer missed chats, and space to grow.
          </p>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-white/10 pt-10 sm:mt-20 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:pt-12">
          <p className="text-[11px] font-medium uppercase leading-normal tracking-[0.18em] text-white/35">
            © {new Date().getFullYear()} SME Operations. All rights reserved.
          </p>
          <nav
            className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/65"
            aria-label="Footer"
          >
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="transition-colors hover:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
