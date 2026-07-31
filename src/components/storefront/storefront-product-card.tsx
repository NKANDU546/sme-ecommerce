import Link from "next/link";
import { StorefrontImagePlaceholder } from "@/components/storefront/storefront-image-placeholder";

export type StorefrontProductBadge = "Sale" | "New";

type StorefrontProductCardProps = {
  title: string;
  priceLabel: string;
  imageUrl: string;
  href?: string;
  category?: string;
  compareAtPriceLabel?: string;
  /** Prefer `badges` when a card can show Sale and/or New. */
  badge?: StorefrontProductBadge | string;
  badges?: StorefrontProductBadge[];
  /** Aspect ratio of the media frame. */
  aspect?: "square" | "portrait";
  showUploadHint?: boolean;
  ctaLabel?: string;
};

function badgeClassName(kind: string): string {
  if (kind.toLowerCase() === "sale") {
    return "bg-[color:var(--sf-accent)] text-white";
  }
  if (kind.toLowerCase() === "new") {
    return "bg-white text-[color:var(--sf-accent)] ring-1 ring-[color:var(--sf-accent)]/25";
  }
  return "bg-[color:var(--sf-accent)] text-white";
}

/**
 * Shared catalogue card — calm retail layout with a hover “View” cue
 * (Darik-inspired, without clutter).
 */
export function StorefrontProductCard({
  title,
  priceLabel,
  imageUrl,
  href,
  category,
  compareAtPriceLabel,
  badge,
  badges,
  aspect = "square",
  showUploadHint,
  ctaLabel = "View",
}: StorefrontProductCardProps) {
  const aspectClass =
    aspect === "portrait" ? "aspect-[3/4]" : "aspect-square";

  const resolvedBadges: string[] = [];
  if (badges?.length) {
    for (const b of badges) {
      if (!resolvedBadges.includes(b)) resolvedBadges.push(b);
    }
  } else if (badge?.trim()) {
    resolvedBadges.push(badge.trim());
  }

  const card = (
    <article className="group flex flex-col">
      <div
        className={`relative ${aspectClass} overflow-hidden bg-[color:var(--sf-card-frame-bg)]`}
      >
        {imageUrl.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <StorefrontImagePlaceholder
            label={title}
            hint={showUploadHint ? "Needs image" : undefined}
          />
        )}
        {resolvedBadges.length > 0 ? (
          <div className="absolute left-3 top-3 z-[1] flex flex-col gap-1.5">
            {resolvedBadges.map((label) => (
              <span
                key={label}
                className={`px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm ${badgeClassName(label)}`}
              >
                {label}
              </span>
            ))}
          </div>
        ) : null}
        {href ? (
          <span
            className="pointer-events-none absolute inset-x-3 bottom-3 z-[1] translate-y-2 bg-[color:var(--sf-accent)] px-3 py-2 text-center font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
            aria-hidden
          >
            {ctaLabel}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex flex-1 flex-col">
        {category ? (
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--sf-accent-text-45)]">
            {category}
          </p>
        ) : null}
        <h3
          className={`line-clamp-2 font-sans text-[15px] font-semibold text-[color:var(--sf-accent)] ${
            category ? "mt-1" : ""
          }`}
        >
          {title}
        </h3>
        <p className="mt-1 flex flex-wrap items-baseline gap-2 font-sans text-sm">
          <span className="font-semibold tabular-nums text-[color:var(--sf-accent)]">
            {priceLabel}
          </span>
          {compareAtPriceLabel?.trim() ? (
            <span className="tabular-nums text-[color:var(--sf-accent-text-45)] line-through">
              {compareAtPriceLabel}
            </span>
          ) : null}
        </p>
      </div>
    </article>
  );

  if (!href) return card;
  return (
    <Link
      href={href}
      className="outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sf-accent)]/30"
    >
      {card}
    </Link>
  );
}

/** Resolve Sale / New badges for shop grids. */
export function shopProductBadges(options: {
  collection: "all" | "sale" | "new";
  onSale?: boolean;
  compareAtPriceLabel?: string | null;
}): StorefrontProductBadge[] {
  const badges: StorefrontProductBadge[] = [];
  const isSale =
    options.onSale === true || Boolean(options.compareAtPriceLabel?.trim());
  if (options.collection === "sale" || isSale) {
    badges.push("Sale");
  }
  if (options.collection === "new") {
    badges.push("New");
  }
  return badges;
}
