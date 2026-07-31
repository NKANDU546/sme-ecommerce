const STORAGE_PREFIX = "sme_paystack_return_v1_";

export function savePaystackReturnPath(reference: string, path: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}${reference}`, path);
  } catch {
    /* ignore */
  }
}

export function loadPaystackReturnPath(reference: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(`${STORAGE_PREFIX}${reference}`);
  } catch {
    return null;
  }
}

export function clearPaystackReturnPath(reference: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(`${STORAGE_PREFIX}${reference}`);
  } catch {
    /* ignore */
  }
}

/** Fixed Paystack dashboard callback — redirects customer to their order confirm. */
export function paystackCallbackPath(): string {
  return "/pay/callback";
}
