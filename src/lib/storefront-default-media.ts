/**
 * Curated default imagery for image-led sections that do not pull from the
 * product catalogue (hero, promo, story, Instagram). Used when creating
 * sections and when normalizing drafts that shipped with empty `imageUrl`.
 */
export const STOREFRONT_DEFAULT_MEDIA = {
  hero: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=2000&q=80",
  promo: [
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80",
  ],
  textImage:
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
  saleBanner:
    "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1400&q=80",
  instagram: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
  ],
  testimonial:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
} as const;

export function withDefaultImageUrl(
  imageUrl: string | undefined | null,
  fallback: string,
): string {
  const trimmed = String(imageUrl ?? "").trim();
  return trimmed || fallback;
}

export function defaultPromoImageUrl(index = 0): string {
  const list = STOREFRONT_DEFAULT_MEDIA.promo;
  return list[index % list.length];
}

export function defaultInstagramImageUrl(index: number): string {
  const list = STOREFRONT_DEFAULT_MEDIA.instagram;
  return list[index % list.length];
}
