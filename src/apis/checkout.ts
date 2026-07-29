import { getSmeApiBaseUrl } from "@/apis/config";
import { networkFailure, parseApiEnvelope } from "@/apis/api-result";
import type { CheckoutBody, Order, OrderResult } from "@/types/cart";

function publicHeaders(json = false): HeadersInit {
  return {
    Accept: "application/json",
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

function storeBase(storeSlug: string): string {
  return `${getSmeApiBaseUrl()}/public/storefronts/${encodeURIComponent(storeSlug)}`;
}

/** POST /public/storefronts/{storeSlug}/checkout */
export async function postCheckout(
  storeSlug: string,
  body: CheckoutBody,
): Promise<OrderResult> {
  const url = `${storeBase(storeSlug)}/checkout`;
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
      "Could not complete checkout. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<Order>(
    res,
    "Checkout could not be completed.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: parsed.data };
}

/** GET /public/storefronts/{storeSlug}/orders/{orderId} */
export async function getOrderConfirmation(
  storeSlug: string,
  orderId: string,
): Promise<OrderResult> {
  const url = `${storeBase(storeSlug)}/orders/${encodeURIComponent(orderId)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: publicHeaders(),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not load order confirmation. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<Order>(
    res,
    "Order confirmation could not be loaded.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: parsed.data };
}
