export type HealthPayload = { ok: boolean; service: string };

/**
 * Example API module — replace with real endpoints or a shared client helper.
 */
export async function fetchHealth(): Promise<HealthPayload> {
  const res = await fetch("/api/health", {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return res.json() as Promise<HealthPayload>;
}
