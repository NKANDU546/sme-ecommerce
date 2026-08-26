import type {
  AiStorefrontCopyRequest,
  AiStorefrontCopyResult,
} from "@/types/ai";

export class AiStorefrontCopyError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AiStorefrontCopyError";
    this.code = code;
  }
}

type ApiSuccess = { ok: true; data: AiStorefrontCopyResult };
type ApiFailure = { ok: false; code?: string; message?: string };

/** Calls the Next.js AI route (OpenAI stays server-side). */
export async function requestAiStorefrontCopy(
  body: AiStorefrontCopyRequest,
): Promise<AiStorefrontCopyResult> {
  const res = await fetch("/api/ai/storefront-copy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let json: ApiSuccess | ApiFailure | null = null;
  try {
    json = (await res.json()) as ApiSuccess | ApiFailure;
  } catch {
    throw new AiStorefrontCopyError(
      "AI_PROVIDER_ERROR",
      "Could not read AI response.",
    );
  }

  if (!res.ok || !json || json.ok !== true) {
    const fail = json && json.ok === false ? json : null;
    throw new AiStorefrontCopyError(
      fail?.code ?? "AI_PROVIDER_ERROR",
      fail?.message ?? "AI storefront copy failed.",
    );
  }

  return json.data;
}
