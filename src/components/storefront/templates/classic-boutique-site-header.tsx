"use client";

import { usePreviewCartOptional } from "@/contexts/preview-cart-context";
import type { StorefrontConfig, StorefrontLink } from "@/types/storefront";

function NavLink({
  link,
  active,
}: {
  link: StorefrontLink;
  active: boolean;
}) {
  const cls = `text-sm font-medium transition-colors ${
    active
      ? "border-b-2 border-[color:var(--sf-accent)] pb-0.5 text-[color:var(--sf-accent)]"
      : "text-[color:var(--sf-accent-text-65)] hover:text-[color:var(--sf-accent)]"
  }`;
  return (
    <a href={link.href} className={cls}>
      {link.label}
    </a>
  );
}

type ClassicBoutiqueSiteHeaderProps = {
  config: StorefrontConfig;
};

function cartBadgeLabel(
  cart: ReturnType<typeof usePreviewCartOptional>,
  fallbackLabel: string,
): string | null {
  if (cart) {
    if (cart.itemCount <= 0) return null;
    return cart.itemCount > 99 ? "99+" : String(cart.itemCount);
  }
  const t = fallbackLabel.trim();
  return t || null;
}

/** Same top bar as the classic boutique home preview (logo row, desktop nav, mobile nav strip). */
export function ClassicBoutiqueSiteHeader({ config }: ClassicBoutiqueSiteHeaderProps) {
  const cart = usePreviewCartOptional();

  const badge = cartBadgeLabel(cart, config.cartCountLabel);

  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--sf-accent-border-10)] bg-[color:var(--sf-header-surface)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <div className="min-w-0 shrink">
          <p className="truncate font-sans text-lg font-bold tracking-tight text-[color:var(--sf-accent)] sm:text-xl">
            {config.shopName}
          </p>
          <p className="truncate font-sans text-[11px] text-[color:var(--sf-accent-text-45)] sm:text-xs">
            {config.tagline}
          </p>
        </div>
        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-8 lg:flex"
          aria-label="Storefront"
        >
          {config.navLinks.map((link, i) => (
            <NavLink
              key={`${link.label}-${i}`}
              link={link}
              active={i === config.activeNavIndex}
            />
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-4 text-[color:var(--sf-accent)]">
          <button
            type="button"
            className="rounded-full p-2 ring-1 ring-[color:var(--sf-accent-border-15)] transition-colors hover:bg-[color:var(--sf-nav-hover-wash)]"
            aria-label="Account"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM5 21a7 7 0 0114 0"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => cart?.toggleDrawer()}
            className="relative rounded-full p-2 ring-1 ring-[color:var(--sf-accent-border-15)] transition-colors hover:bg-[color:var(--sf-nav-hover-wash)]"
            aria-label={cart ? "Open shopping cart" : "Cart"}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9h12"
              />
            </svg>
            {badge ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[color:var(--sf-accent)] px-1 font-sans text-[10px] font-bold text-[color:var(--sf-cart-badge-fg)]">
                {badge}
              </span>
            ) : null}
          </button>
        </div>
      </div>
      <div className="border-t border-[color:var(--sf-accent-border-5)] px-4 py-2 lg:hidden">
        <nav
          className="flex flex-wrap justify-center gap-x-5 gap-y-2"
          aria-label="Storefront mobile"
        >
          {config.navLinks.map((link, i) => (
            <NavLink
              key={`m-${link.label}-${i}`}
              link={link}
              active={i === config.activeNavIndex}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}
