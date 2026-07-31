import { getSmeApiBaseUrl } from "@/apis/config";
import { networkFailure, parseApiEnvelope } from "@/apis/api-result";
import { normalizeOrder } from "@/apis/orders";
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
  return { ok: true, data: normalizeOrder(parsed.data) };
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
  return { ok: true, data: normalizeOrder(parsed.data) };
}

export type LookupPublicOrderBody = {
  orderNumber: string;
  email: string;
};

/** POST /public/storefronts/{storeSlug}/orders/lookup */
export async function lookupPublicOrder(
  storeSlug: string,
  body: LookupPublicOrderBody,
): Promise<OrderResult> {
  const url = `${storeBase(storeSlug)}/orders/lookup`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: publicHeaders(true),
      body: JSON.stringify({
        orderNumber: body.orderNumber.trim(),
        email: body.email.trim(),
      }),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not look up this order. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<Order>(
    res,
    "We couldn’t find an order with those details.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: normalizeOrder(parsed.data) };
}

/**
 * GET /public/storefronts/{storeSlug}/orders/{orderId}/payment/verify
 * Asks backend to confirm Paystack transaction (backup when webhook is slow/missed).
 */
export async function verifyOrderPayment(
  storeSlug: string,
  orderId: string,
  _reference?: string,
): Promise<OrderResult> {
  const url = `${storeBase(storeSlug)}/orders/${encodeURIComponent(orderId)}/payment/verify`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: publicHeaders(),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not verify payment. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<Order>(
    res,
    "Payment could not be verified.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: normalizeOrder(parsed.data) };
}
