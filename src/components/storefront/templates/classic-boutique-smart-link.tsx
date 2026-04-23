import Link from "next/link";
import { resolvePreviewShopCollectionHref } from "@/lib/preview-shop-href";
import type { StorefrontLink } from "@/types/storefront";

export function ClassicBoutiqueSmartLink({
  link,
  className,
  workspaceId,
}: {
  link: StorefrontLink;
  className?: string;
  workspaceId?: string;
}) {
  const href = resolvePreviewShopCollectionHref(link, workspaceId);
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
