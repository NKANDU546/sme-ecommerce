"use server";

/**
 * Example server action. Prefer domain-specific modules:
 * - `src/apis/*` — GET/POST/PUT/PATCH/DELETE to routes or external APIs
 * - `src/actions/*` — thin `"use server"` wrappers pages/components call
 */
export async function pingAction(): Promise<{ ok: true; at: string }> {
  return { ok: true, at: new Date().toISOString() };
}
