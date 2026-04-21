"use server";

/**
 * Server Actions live here — call from Client Components or forms.
 * Keep mutations thin; reuse `apis/` for HTTP to external services when needed.
 */
export async function pingAction(): Promise<{ ok: true; at: string }> {
  return { ok: true, at: new Date().toISOString() };
}
