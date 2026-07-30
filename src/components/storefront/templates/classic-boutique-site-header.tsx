"use client";

import { usePathname } from "next/navigation";
import { usePreviewCartOptional } from "@/contexts/preview-cart-context";
import { resolveStorefrontHref } from "@/lib/preview-shop-href";
import type { StorefrontConfig, StorefrontLink } from "@/types/storefront";

/**
 * Determine whether a nav link is "active" based on the current pathname.
 * - Exact match on resolved href wins.
 * - For non-root hrefs, also activates when pathname starts with that href
 *   (so /s/store/shop/product marks Shop as active).
 */
function isNavLinkActive(
  link: StorefrontLink,
  resolvedHref: string,
  pathname: string,
): boolean {
  if (!pathname) return false;
  const href = resolvedHref.split("?")[0].replace(/\/$/, "") || "/";
  const current = pathname.replace(/\/$/, "") || "/";
  if (current === href) return true;
  // Prefix match only for non-root paths
  if (href !== "/" && current.startsWith(href + "/")) return true;
  return false;
}

function NavLink({
  link,
  resolvedHref,
  pathname,
}: {
  link: StorefrontLink;
  resolvedHref: string;
  pathname: string;
}) {
  const active = isNavLinkActive(link, resolvedHref, pathname);
  const cls = `text-sm font-medium transition-colors ${
    active
      ? "border-b-2 border-[color:var(--sf-accent)] pb-0.5 text-[color:var(--sf-accent)]"
      : "text-[color:var(--sf-accent-text-65)] hover:text-[color:var(--sf-accent)]"
  }`;
  return (
    <a href={resolvedHref} className={cls}>
      {link.label}
    </a>
  );
}

type ClassicBoutiqueSiteHeaderProps = {
  config: StorefrontConfig;
  /** Storefront root, e.g. `/s/my-store` or `/preview/{id}`. Used to resolve magic hrefs. */
  basePath?: string;
  workspaceId?: string;
  /**
   * Force header layout for template previews in a fixed-width frame
   * (media queries still follow the real browser width otherwise).
   */
  forceViewport?: "mobile" | "desktop";
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
export function ClassicBoutiqueSiteHeader({
  config,
  basePath,
  workspaceId,
  forceViewport,
}: ClassicBoutiqueSiteHeaderProps) {
  const cart = usePreviewCartOptional();
  const pathname = usePathname() ?? "";

  const resolvedBase =
    basePath ?? (workspaceId ? `/preview/${workspaceId}` : undefined);

  const badge = cartBadgeLabel(cart, config.cartCountLabel);

  const resolvedLinks = config.navLinks.map((link) => ({
    link,
    href: resolveStorefrontHref(link, resolvedBase),
  }));

  const showDesktopNav =
    forceViewport === "desktop" || forceViewport == null;
  const showMobileNav =
    forceViewport === "mobile" || forceViewport == null;

  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--sf-accent-border-10)] bg-[color:var(--sf-header-surface)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[100%] items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <div className="min-w-0 shrink">
          <p className="truncate font-sans text-lg font-bold tracking-tight text-[color:var(--sf-accent)] sm:text-xl">
            {config.shopName}
          </p>
          <p className="truncate font-sans text-[11px] text-[color:var(--sf-accent-text-45)] sm:text-xs">
            {config.tagline}
          </p>
        </div>
        {showDesktopNav ? (
          <nav
            className={
              forceViewport === "desktop"
                ? "flex min-w-0 flex-1 items-center justify-center gap-8"
                : "hidden min-w-0 flex-1 items-center justify-center gap-8 lg:flex"
            }
            aria-label="Storefront"
          >
            {resolvedLinks.map(({ link, href }, i) => (
              <NavLink
                key={`${link.label}-${i}`}
                link={link}
                resolvedHref={href}
                pathname={pathname}
              />
            ))}
          </nav>
        ) : null}
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
      {showMobileNav ? (
        <div
          className={
            forceViewport === "mobile"
              ? "border-t border-[color:var(--sf-accent-border-5)] px-4 py-2"
              : "border-t border-[color:var(--sf-accent-border-5)] px-4 py-2 lg:hidden"
          }
        >
          <nav
            className="flex flex-wrap justify-center gap-x-5 gap-y-2"
            aria-label="Storefront mobile"
          >
            {resolvedLinks.map(({ link, href }, i) => (
              <NavLink
                key={`m-${link.label}-${i}`}
                link={link}
                resolvedHref={href}
                pathname={pathname}
              />
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
