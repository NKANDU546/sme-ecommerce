type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  error: {
    code?: string;
    message?: string;
    availableQuantity?: number;
  } | null;
};

export type ParsedApiFailure = {
  ok: false;
  errorMessage: string;
  errorCode?: string;
  /** Present on some INSUFFICIENT_STOCK responses. */
  availableQuantity?: number;
  status: number;
};

export async function parseApiEnvelope<T>(
  res: Response,
  fallbackMessage: string,
  options?: { allowNullData?: boolean },
): Promise<{ ok: true; data: T } | ParsedApiFailure> {
  let json: ApiEnvelope<T>;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    return {
      ok: false,
      errorMessage: `Unexpected response (${res.status}). Please try again.`,
      status: res.status,
    };
  }

  if (json.success && (json.data != null || options?.allowNullData)) {
    return { ok: true, data: json.data as T };
  }

  const availableRaw = json.error?.availableQuantity;
  const availableQuantity =
    availableRaw == null || availableRaw === ("" as unknown)
      ? undefined
      : Number(availableRaw);

  return {
    ok: false,
    errorMessage:
      json.error?.message ??
      (res.ok ? fallbackMessage : `Request failed (${res.status}).`),
    errorCode: json.error?.code,
    availableQuantity:
      availableQuantity != null && Number.isFinite(availableQuantity)
        ? availableQuantity
        : undefined,
    status: res.status,
  };
}

export function networkFailure(
  message: string,
): ParsedApiFailure {
  return {
    ok: false,
    errorMessage: message,
    status: 0,
  };
}
