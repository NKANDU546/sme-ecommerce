/** Base URL for SME Operations API (no trailing slash). Override with NEXT_PUBLIC_SME_API_BASE_URL. */
export function getSmeApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SME_API_BASE_URL?.trim().replace(
    /\/+$/,
    "",
  );
  if (fromEnv) return fromEnv;
  return "https://sme-operations-dza7e5czhdggexfh.canadacentral-01.azurewebsites.net/api/v1";
}
