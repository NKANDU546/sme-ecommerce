import type { PreviewCartLine } from "@/types/preview-cart";

const CART_ID_PREFIX = "sme_public_cart_id_v1_";
const DISPLAY_PREFIX = "sme_public_cart_display_v1_";

export type CartLineDisplay = Pick<
  PreviewCartLine,
  "productId" | "title" | "sku" | "imageUrl"
>;

function cartIdKey(storeSlug: string): string {
  return `${CART_ID_PREFIX}${storeSlug}`;
}

function displayKey(storeSlug: string): string {
  return `${DISPLAY_PREFIX}${storeSlug}`;
}

export function loadStoredCartId(storeSlug: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(cartIdKey(storeSlug));
    return value?.trim() || null;
  } catch {
    return null;
  }
}

export function saveStoredCartId(storeSlug: string, cartId: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (!cartId) {
      window.localStorage.removeItem(cartIdKey(storeSlug));
      return;
    }
    window.localStorage.setItem(cartIdKey(storeSlug), cartId);
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadCartDisplayMap(
  storeSlug: string,
): Record<string, CartLineDisplay> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(displayKey(storeSlug));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CartLineDisplay>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveCartDisplayMap(
  storeSlug: string,
  map: Record<string, CartLineDisplay>,
) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(displayKey(storeSlug), JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function upsertCartDisplay(
  storeSlug: string,
  line: CartLineDisplay,
): Record<string, CartLineDisplay> {
  const next = { ...loadCartDisplayMap(storeSlug), [line.productId]: line };
  saveCartDisplayMap(storeSlug, next);
  return next;
}
