"use client";

import { StorefrontSmartLink } from "@/components/storefront/storefront-smart-link";
import {
  STOREFRONT_DEFAULT_MEDIA,
  defaultPromoImageUrl,
  withDefaultImageUrl,
} from "@/lib/storefront-default-media";
import { resolveStorefrontHref } from "@/lib/preview-shop-href";
import type {
  StorefrontFeature,
  StorefrontFeatureIconId,
  StorefrontHeroSection,
  StorefrontPromoBannerSection,
  StorefrontSection,
} from "@/types/storefront";

function CatalogueFeatureIcon({ id }: { id: StorefrontFeatureIconId }) {
  const common = "h-5 w-5";
  switch (id) {
    case "check":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
    case "truck":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v10H3V7zm11 0h3l3 3v4h-6M9 19a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      );
    case "sparkle":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path strokeLinecap="round" d="M12 3v2m0 14v2M4.2 4.2l1.4 1.4m12.8 12.8l1.4 1.4M3 12h2m14 0h2M4.2 19.8l1.4-1.4M17.4 5.6l1.4-1.4" />
        </svg>
      );
  }
}

/** Split hero: copy on light panel + image pane (not full-bleed overlay). */
export function MinimalCatalogueHero({
  section,
  workspaceId,
  basePath,
}: {
  section: StorefrontHeroSection;
  workspaceId?: string;
  basePath?: string;
}) {
  const heroBg = withDefaultImageUrl(
    section.imageUrl,
    STOREFRONT_DEFAULT_MEDIA.hero,
  );

  return (
    <section
      className="border-b border-[color:var(--sf-accent)]/12 bg-[color:var(--sf-page-bg)]"
      aria-labelledby={`${section.id}-heading`}
    >
      <div className="mx-auto grid max-w-[100%] @lg/storefront:grid-cols-2">
        <div className="flex flex-col justify-center px-4 py-12 @sm/storefront:px-8 @sm/storefront:py-16 @lg/storefront:py-20 @lg/storefront:pl-10 @lg/storefront:pr-12">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--sf-accent-text-45)]">
            Order online
          </p>
          <h1
            id={`${section.id}-heading`}
            className="mt-4 max-w-lg font-sans text-[clamp(2rem,4.5vw,3.15rem)] font-semibold leading-[1.05] tracking-tight text-[color:var(--sf-accent)]"
          >
            {section.heading}
          </h1>
          <p className="mt-5 max-w-md font-sans text-[15px] leading-relaxed text-[color:var(--sf-accent-text-65)]">
            {section.subheading}
          </p>
          {section.primaryCta || section.secondaryCta ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {section.primaryCta ? (
                <StorefrontSmartLink
                  link={section.primaryCta}
                  workspaceId={workspaceId}
                  basePath={basePath}
                  className="inline-flex items-center justify-center bg-[color:var(--sf-accent)] px-6 py-3.5 font-sans text-sm font-semibold text-[color:var(--sf-cart-badge-fg)] transition-opacity hover:opacity-90"
                />
              ) : null}
              {section.secondaryCta ? (
                <StorefrontSmartLink
                  link={section.secondaryCta}
                  workspaceId={workspaceId}
                  basePath={basePath}
                  className="inline-flex items-center justify-center border border-[color:var(--sf-accent)]/25 bg-transparent px-6 py-3.5 font-sans text-sm font-semibold text-[color:var(--sf-accent)] transition-colors hover:bg-[color:var(--sf-nav-hover-wash)]"
                />
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="relative min-h-[16rem] overflow-hidden border-t border-[color:var(--sf-accent)]/10 @lg/storefront:min-h-[28rem] @lg/storefront:border-l @lg/storefront:border-t-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroBg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent @lg/storefront:bg-gradient-to-l"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}

/** Numbered benefit strip — denser than Classic icon cards. */
export function MinimalCatalogueFeatures({
  section,
}: {
  section: Extract<StorefrontSection, { type: "features" }>;
}) {
  const items: StorefrontFeature[] = section.items;
  return (
    <section
      className="border-y border-[color:var(--sf-accent)]/10 bg-[color:var(--sf-values-section-bg)]"
      aria-labelledby={`${section.id}-heading`}
    >
      <div className="mx-auto max-w-[100%] px-4 py-10 @sm/storefront:px-8 @sm/storefront:py-12">
        {section.title.trim() ? (
          <h2
            id={`${section.id}-heading`}
            className="mb-8 font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--sf-accent-text-45)]"
          >
            {section.title}
          </h2>
        ) : (
          <h2 id={`${section.id}-heading`} className="sr-only">
            Why order here
          </h2>
        )}
        <ul className="grid gap-0 divide-y divide-[color:var(--sf-accent)]/10 border border-[color:var(--sf-accent)]/10 bg-[color:var(--sf-page-bg)] @md/storefront:grid-cols-3 @md/storefront:divide-x @md/storefront:divide-y-0">
          {items.map((f, i) => (
            <li
              key={`${f.title}-${i}`}
              className="flex gap-4 px-5 py-6 @sm/storefront:px-6"
            >
              <span className="font-sans text-xs font-semibold tabular-nums text-[color:var(--sf-accent-text-45)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="mb-2 text-[color:var(--sf-accent)]">
                  <CatalogueFeatureIcon id={f.icon} />
                </div>
                <h3 className="font-sans text-sm font-semibold text-[color:var(--sf-accent)]">
                  {f.title}
                </h3>
                <p className="mt-1.5 font-sans text-xs leading-relaxed text-[color:var(--sf-accent-text-60)] @sm/storefront:text-sm">
                  {f.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Compact horizontal promo band. */
export function MinimalCataloguePromo({
  section,
  workspaceId,
  basePath,
}: {
  section: StorefrontPromoBannerSection;
  workspaceId?: string;
  basePath?: string;
}) {
  const promoSrc = withDefaultImageUrl(
    section.imageUrl,
    defaultPromoImageUrl(0),
  );
  const resolvedBase =
    basePath ?? (workspaceId ? `/preview/${workspaceId}` : undefined);
  const href = resolveStorefrontHref(
    { label: section.buttonLabel, href: section.href },
    resolvedBase,
  );

  return (
    <section className="px-4 py-6 @sm/storefront:px-8 @sm/storefront:py-8">
      <a
        href={href}
        className="group mx-auto flex max-w-[100%] flex-col overflow-hidden border border-[color:var(--sf-accent)]/15 bg-[color:var(--sf-promo-section-bg)] transition-colors hover:border-[color:var(--sf-accent)]/35 @sm/storefront:flex-row"
      >
        <div className="relative aspect-[21/9] w-full shrink-0 @sm/storefront:aspect-auto @sm/storefront:h-auto @sm/storefront:w-44 @md/storefront:w-56">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={promoSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover @sm/storefront:static @sm/storefront:h-full"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 px-5 py-5 @sm/storefront:flex-row @sm/storefront:items-center @sm/storefront:justify-between @sm/storefront:gap-6 @sm/storefront:px-7">
          <div className="min-w-0">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--sf-accent-text-45)]">
              Special
            </p>
            <h2 className="mt-1 font-sans text-lg font-semibold tracking-tight text-[color:var(--sf-accent)] @sm/storefront:text-xl">
              {section.title}
            </h2>
            {section.description.trim() ? (
              <p className="mt-1 font-sans text-sm text-[color:var(--sf-accent-text-65)]">
                {section.description}
              </p>
            ) : null}
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--sf-accent)]">
            {section.buttonLabel}
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </div>
      </a>
    </section>
  );
}

/** Light contact band — not a full dark serif hero block. */
export function MinimalCatalogueContactCta({
  section,
  basePath,
}: {
  section: Extract<StorefrontSection, { type: "contactCta" }>;
  basePath?: string;
}) {
  const href = resolveStorefrontHref(
    { label: section.buttonLabel, href: section.href.trim() || "#" },
    basePath,
  );
  const isExternal =
    /^https?:\/\//i.test(href) || href.startsWith("mailto:");

  return (
    <section
      className="border-y border-[color:var(--sf-accent)]/10 bg-[color:var(--sf-page-bg)] px-4 py-12 @sm/storefront:px-8 @sm/storefront:py-14"
      aria-labelledby={`${section.id}-heading`}
    >
      <div className="mx-auto flex max-w-[100%] flex-col gap-6 border border-[color:var(--sf-accent)]/15 bg-white px-6 py-8 @sm/storefront:flex-row @sm/storefront:items-end @sm/storefront:justify-between @sm/storefront:px-8 @sm/storefront:py-10">
        <div className="max-w-xl">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--sf-accent-text-45)]">
            Contact
          </p>
          <h2
            id={`${section.id}-heading`}
            className="mt-3 font-sans text-2xl font-semibold tracking-tight text-[color:var(--sf-accent)] @sm/storefront:text-3xl"
          >
            {section.title}
          </h2>
          <p className="mt-3 font-sans text-sm leading-relaxed text-[color:var(--sf-accent-text-65)]">
            {section.body}
          </p>
        </div>
        <a
          href={href}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="inline-flex shrink-0 items-center justify-center bg-[color:var(--sf-accent)] px-6 py-3.5 font-sans text-sm font-semibold text-[color:var(--sf-cart-badge-fg)] transition-opacity hover:opacity-90"
        >
          {section.buttonLabel}
        </a>
      </div>
    </section>
  );
}

export function MinimalCatalogueFaq({
  section,
}: {
  section: Extract<StorefrontSection, { type: "faq" }>;
}) {
  return (
    <section className="px-4 py-12 @sm/storefront:px-8 @sm/storefront:py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--sf-accent-text-45)]">
          {section.title}
        </h2>
        <div className="mt-6 divide-y divide-[color:var(--sf-accent)]/10 border-y border-[color:var(--sf-accent)]/10">
          {section.items.map((item, i) => (
            <div key={`${item.question}-${i}`} className="py-5">
              <h3 className="font-sans text-sm font-semibold text-[color:var(--sf-accent)]">
                {item.question}
              </h3>
              <p className="mt-2 font-sans text-sm leading-relaxed text-[color:var(--sf-accent-text-60)]">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
