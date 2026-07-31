type StorefrontImagePlaceholderProps = {
  /** Product title, shop name, or short label — used for initial + aria. */
  label?: string;
  /** Editor-only cue (e.g. “Upload image”). Omit on public surfaces. */
  hint?: string;
  className?: string;
};

/** Quiet branded wash when media is missing — never merchant/editor jargon on live stores. */
export function StorefrontImagePlaceholder({
  label,
  hint,
  className = "",
}: StorefrontImagePlaceholderProps) {
  const initial = label?.trim().charAt(0).toUpperCase() || "·";
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-1 bg-[color:var(--sf-hero-placeholder)] ${className}`}
      aria-hidden={!hint}
      role={hint ? "img" : undefined}
      aria-label={hint}
    >
      <span className="font-serif text-2xl font-light text-[color:var(--sf-accent-text-45)]">
        {initial}
      </span>
      {hint ? (
        <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-[color:var(--sf-accent-text-45)]">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
