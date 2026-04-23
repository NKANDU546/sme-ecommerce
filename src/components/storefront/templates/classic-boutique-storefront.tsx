import { ClassicBoutiqueSiteFooter } from "@/components/storefront/templates/classic-boutique-site-footer";
import { ClassicBoutiqueSiteHeader } from "@/components/storefront/templates/classic-boutique-site-header";
import { ClassicBoutiqueSmartLink as SmartLink } from "@/components/storefront/templates/classic-boutique-smart-link";
import type {
  StorefrontConfig,
  StorefrontFeatureIconId,
} from "@/types/storefront";

type ClassicBoutiqueStorefrontProps = {
  config: StorefrontConfig;
  /** When set (dashboard live preview or customer preview), `@shop` CTAs resolve to the collection page. */
  workspaceId?: string;
};

function FeatureIcon({ id }: { id: StorefrontFeatureIconId }) {
  const box =
    "flex h-12 w-12 items-center justify-center rounded-md bg-[color:var(--sf-icon-tile-bg)] text-[color:var(--sf-icon-tile-text)]";
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
      <div className="aspect-square overflow-hidden rounded-xl border border-[color:var(--sf-accent-border-10)] bg-[color:var(--sf-card-frame-bg)]">
        {imageUrl.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <h3 className="mt-4 font-sans text-[15px] font-semibold text-[color:var(--sf-accent)]">
        {title}
      </h3>
      <p className="mt-1 font-sans text-sm text-[color:var(--sf-accent-text-55)]">
        {priceLabel}
      </p>
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
      className={`relative flex min-h-[17rem] flex-col justify-end overflow-hidden rounded-xl border border-[color:var(--sf-accent-border-10)] shadow-sm transition-opacity hover:opacity-[0.98] sm:min-h-[20rem] ${
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
        <div
          className="absolute inset-0 bg-[color:var(--sf-promo-placeholder)]"
          aria-hidden
        />
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
  workspaceId,
}: ClassicBoutiqueStorefrontProps) {
  const heroBg = config.heroBackgroundImageUrl?.trim() ?? "";

  return (
    <div className="min-h-full">
      <ClassicBoutiqueSiteHeader config={config} />

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
          <div
            className="absolute inset-0 bg-[color:var(--sf-hero-placeholder)]"
            aria-hidden
          />
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
                workspaceId={workspaceId}
                className="inline-flex items-center justify-center bg-white px-6 py-3 font-sans text-sm font-semibold text-[color:var(--sf-accent)] shadow-sm transition-colors hover:bg-white/90"
              />
              <SmartLink
                link={config.heroSecondaryCta}
                workspaceId={workspaceId}
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
            className="font-serif text-2xl font-light text-[color:var(--sf-accent)] sm:text-3xl"
          >
            {config.featuredTitle}
          </h2>
          <SmartLink
            link={config.featuredViewAll}
            workspaceId={workspaceId}
            className="font-sans text-sm font-medium text-[color:var(--sf-accent)] underline decoration-[color:var(--sf-accent-border-25)] underline-offset-4 transition-colors hover:decoration-[color:var(--sf-accent)]"
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
      <section className="border-y border-[color:var(--sf-accent-border-10)] bg-[color:var(--sf-promo-section-bg)] py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-8 lg:grid-cols-5 lg:gap-5">
          <PromoCard card={config.promos[0]} wide />
          <PromoCard card={config.promos[1]} wide={false} />
        </div>
      </section>

      {/* ─── Value props ─── */}
      <section
        className="bg-[color:var(--sf-values-section-bg)] py-14 sm:py-20"
        aria-labelledby="values-heading"
      >
        <h2 id="values-heading" className="sr-only">
          Why shop with us
        </h2>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:grid-cols-3 sm:gap-12 sm:px-8">
          {config.features.map((f, i) => (
            <div key={`${f.title}-${i}`} className="text-center sm:text-left">
              <div className="mx-auto flex justify-center sm:mx-0 sm:justify-start">
                <FeatureIcon id={f.icon} />
              </div>
              <h3 className="mt-5 font-sans text-base font-semibold text-[color:var(--sf-accent)]">
                {f.title}
              </h3>
              <p className="mt-2 font-sans text-sm leading-relaxed text-[color:var(--sf-accent-text-60)]">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <ClassicBoutiqueSiteFooter config={config} workspaceId={workspaceId} />
    </div>
  );
}
