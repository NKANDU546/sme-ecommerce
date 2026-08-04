/** Base URL for SME Operations API (no trailing slash). Override with NEXT_PUBLIC_SME_API_BASE_URL. */
export function getSmeApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SME_API_BASE_URL?.trim().replace(
    /\/+$/,
    "",
  );
  if (fromEnv) return fromEnv;
  return "https://sme-operations-gpgudcaud8bddgdu.canadacentral-01.azurewebsites.net/api/v1";
}

/**
 * Public app / hosting origin (no trailing slash) for storefront links,
 * Paystack callbacks, and copy-to-clipboard URLs.
 *
 * Until custom domains (Step 12), always prefer this hosting URL over
 * ephemeral preview hosts. Override with `NEXT_PUBLIC_APP_ORIGIN`.
 */
export function getAppOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_ORIGIN?.trim().replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "https://sme-operations.netlify.app";
}

/** Absolute public storefront URL: `{origin}/s/{storeSlug}`. */
export function buildPublicStoreUrl(storeSlug: string): string {
  const slug = storeSlug.trim().replace(/^\/+|\/+$/g, "");
  return `${getAppOrigin()}/s/${slug}`;
}
