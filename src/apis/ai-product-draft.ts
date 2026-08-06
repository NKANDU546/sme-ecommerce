import type {
  AiProductDraftRequest,
  AiProductDraftResult,
} from "@/types/ai";

export class AiProductDraftError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AiProductDraftError";
    this.code = code;
  }
}

type ApiSuccess = { ok: true; data: AiProductDraftResult };
type ApiFailure = { ok: false; code?: string; message?: string };

/** Calls the Next.js AI route (OpenAI stays server-side). */
export async function requestAiProductDraft(
  body: AiProductDraftRequest,
): Promise<AiProductDraftResult> {
  const res = await fetch("/api/ai/product-draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let json: ApiSuccess | ApiFailure | null = null;
  try {
    json = (await res.json()) as ApiSuccess | ApiFailure;
  } catch {
    throw new AiProductDraftError(
      "AI_PROVIDER_ERROR",
      "Could not read AI response.",
    );
  }

  if (!res.ok || !json || json.ok !== true) {
    const fail = json && json.ok === false ? json : null;
    throw new AiProductDraftError(
      fail?.code ?? "AI_PROVIDER_ERROR",
      fail?.message ?? "AI draft failed.",
    );
  }

  return json.data;
}
