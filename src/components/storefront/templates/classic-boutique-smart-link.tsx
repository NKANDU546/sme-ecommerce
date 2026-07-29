import Link from "next/link";
import { resolveStorefrontHref } from "@/lib/preview-shop-href";
import type { StorefrontLink } from "@/types/storefront";

export function ClassicBoutiqueSmartLink({
  link,
  className,
  workspaceId,
  basePath,
}: {
  link: StorefrontLink;
  className?: string;
  /** Preview workspace id — used when `basePath` is omitted. */
  workspaceId?: string;
  /** Explicit storefront root, e.g. `/s/my-store` or `/preview/{id}`. */
  basePath?: string;
}) {
  const resolvedBase =
    basePath ?? (workspaceId ? `/preview/${workspaceId}` : undefined);
  const href = resolveStorefrontHref(link, resolvedBase);
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {link.label}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {link.label}
    </a>
  );
}
