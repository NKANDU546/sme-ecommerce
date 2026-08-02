import Link from "next/link";
import { resolveStorefrontHref } from "@/lib/preview-shop-href";
import type { StorefrontLink } from "@/types/storefront";

/** Template-agnostic storefront link (magic `@shop` / `@page:` hrefs). */
export function StorefrontSmartLink({
  link,
  className,
  workspaceId,
  basePath,
}: {
  link: StorefrontLink;
  className?: string;
  workspaceId?: string;
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
