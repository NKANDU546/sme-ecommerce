import { getSmeApiBaseUrl } from "@/apis/config";
import type {
  LoginApiEnvelope,
  LoginCredentials,
  LoginSuccessData,
  PostLoginResult,
  RegisterApiEnvelope,
  RegisterBusinessInput,
  PostRegisterResult,
} from "@/types/auth";

export type {
  LoginCredentials,
  LoginSuccessData,
  PostLoginResult,
  RegisterBusinessInput,
  RegisterSuccessData,
  PostRegisterResult,
} from "@/types/auth";

function normalizeLoginData(raw: unknown): LoginSuccessData {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const num = (v: unknown) => (typeof v === "number" ? v : undefined);
  return {
    userId: str(o.userId) ?? str(o.user_id),
    businessId: str(o.businessId) ?? str(o.business_id),
    accessToken: str(o.accessToken) ?? str(o.access_token) ?? str(o.token),
    refreshToken: str(o.refreshToken) ?? str(o.refresh_token),
    expiresIn: num(o.expiresIn) ?? num(o.expires_in),
  };
}

/** POST /auth/register — call from server actions or trusted server code. */
export async function postRegister(
  business: RegisterBusinessInput,
): Promise<PostRegisterResult> {
  const url = `${getSmeApiBaseUrl()}/auth/register`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business }),
    });
  } catch {
    return {
      ok: false,
      errorMessage:
        "Could not reach the server. Check your connection and try again.",
    };
  }

  let json: RegisterApiEnvelope;
  try {
    json = (await res.json()) as RegisterApiEnvelope;
  } catch {
    return {
      ok: false,
      errorMessage: `Unexpected response (${res.status}). Please try again.`,
    };
  }

  if (json.success && json.data) {
    return { ok: true, data: json.data };
  }

  const errorMessage =
    json.error?.message ??
    (res.ok ? "Registration could not be completed." : `Request failed (${res.status}).`);

  return {
    ok: false,
    errorMessage,
    errorCode: json.error?.code,
  };
}

/** POST /auth/login */
export async function postLogin(
  credentials: LoginCredentials,
): Promise<PostLoginResult> {
  const url = `${getSmeApiBaseUrl()}/auth/login`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });
  } catch {
    return {
      ok: false,
      errorMessage:
        "Could not reach the server. Check your connection and try again.",
    };
  }

  let json: LoginApiEnvelope;
  try {
    json = (await res.json()) as LoginApiEnvelope;
  } catch {
    return {
      ok: false,
      errorMessage: `Unexpected response (${res.status}). Please try again.`,
    };
  }

  if (json.success && json.data != null) {
    return { ok: true, data: normalizeLoginData(json.data) };
  }

  const errorMessage =
    json.error?.message ??
    (res.ok ? "Sign in could not be completed." : `Request failed (${res.status}).`);

  return {
    ok: false,
    errorMessage,
    errorCode: json.error?.code,
  };
}
