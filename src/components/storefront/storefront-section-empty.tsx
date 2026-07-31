import Link from "next/link";
import { isPublicStorefrontContext } from "@/lib/storefront-public-context";

type StorefrontSectionEmptyProps = {
  basePath?: string;
  /** Merchant guidance when not on a live `/s/…` store. */
  merchantMessage: string;
  /** Shopper-facing line on live stores. */
  publicMessage?: string;
  className?: string;
  align?: "left" | "center";
};

export function StorefrontSectionEmpty({
  basePath,
  merchantMessage,
  publicMessage = "Nothing here yet.",
  className = "",
  align = "left",
}: StorefrontSectionEmptyProps) {
  const isPublic = isPublicStorefrontContext(basePath);
  const shopHref = basePath ? `${basePath.replace(/\/$/, "")}/shop` : undefined;
  const alignCls = align === "center" ? "text-center" : "";

  if (isPublic) {
    return (
      <div className={`font-sans text-sm text-[color:var(--sf-accent-text-55)] ${alignCls} ${className}`}>
        <p>{publicMessage}</p>
        {shopHref ? (
          <Link
            href={shopHref}
            className="mt-3 inline-block font-semibold text-[color:var(--sf-accent)] underline underline-offset-2"
          >
            Browse the shop
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <p
      className={`font-sans text-sm text-[color:var(--sf-accent-text-55)] ${alignCls} ${className}`}
    >
      {merchantMessage}
    </p>
  );
}
