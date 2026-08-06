import type {
  AiAnalyticsExplainRequest,
  AiAnalyticsExplainResult,
} from "@/types/ai";

export class AiAnalyticsExplainError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AiAnalyticsExplainError";
    this.code = code;
  }
}

type ApiSuccess = { ok: true; data: AiAnalyticsExplainResult };
type ApiFailure = { ok: false; code?: string; message?: string };

/** Calls Next.js AI route; OpenAI + KPI fetch stay server-side. */
export async function requestAiAnalyticsExplain(
  body: AiAnalyticsExplainRequest,
  accessToken: string,
): Promise<AiAnalyticsExplainResult> {
  const res = await fetch("/api/ai/analytics-explain", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  let json: ApiSuccess | ApiFailure | null = null;
  try {
    json = (await res.json()) as ApiSuccess | ApiFailure;
  } catch {
    throw new AiAnalyticsExplainError(
      "AI_PROVIDER_ERROR",
      "Could not read AI response.",
    );
  }

  if (!res.ok || !json || json.ok !== true) {
    const fail = json && json.ok === false ? json : null;
    throw new AiAnalyticsExplainError(
      fail?.code ?? "AI_PROVIDER_ERROR",
      fail?.message ?? "AI explain failed.",
    );
  }

  return json.data;
}
