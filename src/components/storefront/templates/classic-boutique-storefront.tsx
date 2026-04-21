import Link from "next/link";
import type {
  StorefrontConfig,
  StorefrontFeatureIconId,
  StorefrontLink,
} from "@/types/storefront";

type ClassicBoutiqueStorefrontProps = {
  config: StorefrontConfig;
};

function NavLink({
  link,
  active,
}: {
  link: StorefrontLink;
  active: boolean;
}) {
  const cls = `text-sm font-medium transition-colors ${
    active
      ? "border-b-2 border-primary-blue pb-0.5 text-primary-blue"
      : "text-primary-blue/65 hover:text-primary-blue"
  }`;
  return (
    <a href={link.href} className={cls}>
      {link.label}
    </a>
  );
}

function SmartLink({
  link,
  className,
}: {
  link: StorefrontLink;
  className?: string;
}) {
  if (link.href.startsWith("/")) {
    return (
      <Link href={link.href} className={className}>
        {link.label}
      </Link>
    );
  }
  return (
    <a href={link.href} className={className}>
      {link.label}
    </a>
  );
}

function FeatureIcon({ id }: { id: StorefrontFeatureIconId }) {
  const box =
    "flex h-12 w-12 items-center justify-center rounded-md bg-blue-gray/80 text-primary-blue";
  switch (id) {
    case "check":
      return (
        <span className={box} aria-hidden>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      );
    case "truck":
      return (
        <span className={box} aria-hidden>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v10H3V7zm11 0h3l3 3v4h-6M9 19a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        </span>
      );
    case "sparkle":
      return (
        <span className={box} aria-hidden>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" d="M12 3v2m0 14v2M4.2 4.2l1.4 1.4m12.8 12.8l1.4 1.4M3 12h2m14 0h2M4.2 19.8l1.4-1.4M17.4 5.6l1.4-1.4" />
            <path strokeLinecap="round" d="M12 8a4 4 0 104 4 4 4 0 00-4-4z" />
          </svg>
        </span>
      );
    default:
      return null;
  }
}

function ProductCard({
  title,
  priceLabel,
  imageUrl,
}: {
  title: string;
  priceLabel: string;
  imageUrl: string;
}) {
  return (
    <article className="group flex flex-col">
      <div className="aspect-square overflow-hidden rounded-xl border border-primary-blue/10 bg-blue-gray/30">
        {imageUrl.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <h3 className="mt-4 font-sans text-[15px] font-semibold text-primary-blue">
        {title}
      </h3>
      <p className="mt-1 font-sans text-sm text-primary-blue/55">{priceLabel}</p>
    </article>
  );
}

function PromoCard({
  card,
  wide,
}: {
  card: StorefrontConfig["promos"][number];
  wide: boolean;
}) {
  return (
    <a
      href={card.href}
      className={`relative flex min-h-[17rem] flex-col justify-end overflow-hidden rounded-xl border border-primary-blue/10 shadow-sm transition-opacity hover:opacity-[0.98] sm:min-h-[20rem] ${
        wide ? "lg:col-span-3" : "lg:col-span-2"
      }`}
    >
      {card.imageUrl.trim() ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-blue-gray/50" aria-hidden />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
      <div className="relative z-10 p-6 sm:p-8">
        <h3 className="font-serif text-2xl font-light text-white sm:text-3xl">
          {card.title}
        </h3>
        <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-white/85">
          {card.description}
        </p>
        <span
          className="mt-5 inline-flex w-fit border border-white/40 bg-white/10 px-4 py-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          {card.buttonLabel}
        </span>
      </div>
    </a>
  );
}

export function ClassicBoutiqueStorefront({
  config,
}: ClassicBoutiqueStorefrontProps) {
  const heroBg = config.heroBackgroundImageUrl?.trim() ?? "";

  return (
    <div className="min-h-full bg-white font-sans text-[#1a1a1a]">
      {/* ─── Top nav ─── */}
      <header className="sticky top-0 z-20 border-b border-primary-blue/10 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div className="min-w-0 shrink">
            <p className="truncate font-sans text-lg font-bold tracking-tight text-primary-blue sm:text-xl">
              {config.shopName}
            </p>
            <p className="truncate font-sans text-[11px] text-primary-blue/45 sm:text-xs">
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
          <div className="flex shrink-0 items-center gap-4 text-primary-blue">
            <button
              type="button"
              className="rounded-full p-2 ring-1 ring-primary-blue/15 transition-colors hover:bg-blue-gray/40"
              aria-label="Account"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM5 21a7 7 0 0114 0" />
              </svg>
            </button>
            <a
              href="#"
              className="relative rounded-full p-2 ring-1 ring-primary-blue/15 transition-colors hover:bg-blue-gray/40"
              aria-label="Cart"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9h12" />
              </svg>
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary-blue px-1 font-sans text-[10px] font-bold text-white">
                {config.cartCountLabel}
              </span>
            </a>
          </div>
        </div>
        <div className="border-t border-primary-blue/5 px-4 py-2 lg:hidden">
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="Storefront mobile">
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

      {/* ─── Hero ─── */}
      <section
        className="relative min-h-[min(70vh,36rem)] overflow-hidden"
        aria-labelledby="storefront-hero-heading"
      >
        {heroBg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroBg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-blue-gray/60" aria-hidden />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/35 to-transparent" />
        <div className="relative z-10 mx-auto flex max-w-7xl min-h-[min(70vh,36rem)] items-center px-4 py-16 sm:px-8 sm:py-24">
          <div className="max-w-xl">
            <h1
              id="storefront-hero-heading"
              className="font-serif text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.1] tracking-tight text-white"
            >
              {config.heroHeading}
            </h1>
            <p className="mt-5 font-sans text-base leading-relaxed text-white/90 sm:text-lg">
              {config.heroSubheading}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <SmartLink
                link={config.heroPrimaryCta}
                className="inline-flex items-center justify-center bg-white px-6 py-3 font-sans text-sm font-semibold text-primary-blue shadow-sm transition-colors hover:bg-white/90"
              />
              <SmartLink
                link={config.heroSecondaryCta}
                className="inline-flex items-center justify-center border border-white/40 bg-white/10 px-6 py-3 font-sans text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured arrivals ─── */}
      <section
        className="mx-auto max-w-7xl px-4 py-14 sm:px-8 sm:py-20"
        aria-labelledby="featured-heading"
      >
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2
            id="featured-heading"
            className="font-serif text-2xl font-light text-primary-blue sm:text-3xl"
          >
            {config.featuredTitle}
          </h2>
          <SmartLink
            link={config.featuredViewAll}
            className="font-sans text-sm font-medium text-primary-blue underline decoration-primary-blue/25 underline-offset-4 transition-colors hover:decoration-primary-blue"
          />
        </div>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
          {config.products.map((p, i) => (
            <ProductCard
              key={`${p.title}-${i}`}
              title={p.title}
              priceLabel={p.priceLabel}
              imageUrl={p.imageUrl}
            />
          ))}
        </div>
      </section>

      {/* ─── Promo split ─── */}
      <section className="border-y border-primary-blue/10 bg-[#f6f7f9] py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-8 lg:grid-cols-5 lg:gap-5">
          <PromoCard card={config.promos[0]} wide />
          <PromoCard card={config.promos[1]} wide={false} />
        </div>
      </section>

      {/* ─── Value props ─── */}
      <section className="bg-[#eef1f5] py-14 sm:py-20" aria-labelledby="values-heading">
        <h2 id="values-heading" className="sr-only">
          Why shop with us
        </h2>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:grid-cols-3 sm:gap-12 sm:px-8">
          {config.features.map((f, i) => (
            <div key={`${f.title}-${i}`} className="text-center sm:text-left">
              <div className="mx-auto flex justify-center sm:mx-0 sm:justify-start">
                <FeatureIcon id={f.icon} />
              </div>
              <h3 className="mt-5 font-sans text-base font-semibold text-primary-blue">
                {f.title}
              </h3>
              <p className="mt-2 font-sans text-sm leading-relaxed text-primary-blue/60">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-primary-blue/10 bg-[#e8ecf2] py-14 text-primary-blue">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:gap-12">
          <div>
            <p className="font-sans text-lg font-bold">{config.shopName}</p>
            <p className="mt-3 font-sans text-sm leading-relaxed text-primary-blue/65">
              {config.footerBlurb}
            </p>
          </div>
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary-blue/45">
              Shop
            </p>
            <ul className="mt-4 space-y-2 font-sans text-sm">
              {config.footerShopLinks.map((l) => (
                <li key={l.label}>
                  <SmartLink
                    link={l}
                    className="text-primary-blue/70 underline-offset-2 transition-colors hover:text-primary-blue"
                  />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary-blue/45">
              Policies
            </p>
            <ul className="mt-4 space-y-2 font-sans text-sm">
              {config.footerPolicyLinks.map((l) => (
                <li key={l.label}>
                  <SmartLink
                    link={l}
                    className="text-primary-blue/70 underline-offset-2 transition-colors hover:text-primary-blue"
                  />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary-blue/45">
              Connect
            </p>
            <ul className="mt-4 space-y-2 font-sans text-sm">
              {config.footerConnectLinks.map((l) => (
                <li key={l.label}>
                  <SmartLink
                    link={l}
                    className="text-primary-blue/70 underline-offset-2 transition-colors hover:text-primary-blue"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-12 max-w-7xl border-t border-primary-blue/10 px-4 pt-8 text-center font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-primary-blue/45 sm:px-8">
          {config.copyrightLine}
        </p>
      </footer>
    </div>
  );
}
