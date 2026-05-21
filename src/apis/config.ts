/** Base URL for SME Operations API (no trailing slash). Override with NEXT_PUBLIC_SME_API_BASE_URL. */
export function getSmeApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SME_API_BASE_URL?.trim().replace(
    /\/+$/,
    "",
  );
  if (fromEnv) return fromEnv;
  return "https://innovators-d2b3gycthabmdnhj.southafricanorth-01.azurewebsites.net/api/v1";
}
