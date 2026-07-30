import { getSmeApiBaseUrl } from "@/apis/config";
import { networkFailure, parseApiEnvelope } from "@/apis/api-result";
import type {
  AddCartItemBody,
  Cart,
  CartResult,
  UpdateCartItemBody,
} from "@/types/cart";

function publicHeaders(json = false): HeadersInit {
  return {
    Accept: "application/json",
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

function storeBase(storeSlug: string): string {
  return `${getSmeApiBaseUrl()}/public/storefronts/${encodeURIComponent(storeSlug)}`;
}

/** POST /public/storefronts/{storeSlug}/carts */
export async function createCart(storeSlug: string): Promise<CartResult> {
  const url = `${storeBase(storeSlug)}/carts`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: publicHeaders(),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not create a cart. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<Cart>(res, "Cart could not be created.");
  if (!parsed.ok) return parsed;
  return { ok: true, data: parsed.data };
}

/** GET /public/storefronts/{storeSlug}/carts/{cartId} */
export async function getCart(
  storeSlug: string,
  cartId: string,
): Promise<CartResult> {
  const url = `${storeBase(storeSlug)}/carts/${encodeURIComponent(cartId)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: publicHeaders(),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not load your cart. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<Cart>(res, "Cart could not be loaded.");
  if (!parsed.ok) return parsed;
  return { ok: true, data: parsed.data };
}

/** POST /public/storefronts/{storeSlug}/carts/{cartId}/items */
export async function addCartItem(
  storeSlug: string,
  cartId: string,
  body: AddCartItemBody,
): Promise<CartResult> {
  const url = `${storeBase(storeSlug)}/carts/${encodeURIComponent(cartId)}/items`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: publicHeaders(true),
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not add item to cart. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<Cart>(res, "Item could not be added.");
  if (!parsed.ok) return parsed;
  return { ok: true, data: parsed.data };
}

/** PATCH /public/storefronts/{storeSlug}/carts/{cartId}/items/{itemId} */
export async function updateCartItem(
  storeSlug: string,
  cartId: string,
  itemId: string,
  body: UpdateCartItemBody,
): Promise<CartResult> {
  const url = `${storeBase(storeSlug)}/carts/${encodeURIComponent(cartId)}/items/${encodeURIComponent(itemId)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "PATCH",
      headers: publicHeaders(true),
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not update cart item. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<Cart>(res, "Cart item could not be updated.");
  if (!parsed.ok) return parsed;
  return { ok: true, data: parsed.data };
}

/** DELETE /public/storefronts/{storeSlug}/carts/{cartId}/items/{itemId} */
export async function removeCartItem(
  storeSlug: string,
  cartId: string,
  itemId: string,
): Promise<CartResult> {
  const url = `${storeBase(storeSlug)}/carts/${encodeURIComponent(cartId)}/items/${encodeURIComponent(itemId)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "DELETE",
      headers: publicHeaders(),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not remove item from cart. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<Cart>(res, "Cart item could not be removed.");
  if (!parsed.ok) return parsed;
  return { ok: true, data: parsed.data };
}
