import { getSmeApiBaseUrl } from "@/apis/config";
import { networkFailure, parseApiEnvelope } from "@/apis/api-result";
import type {
  InitializePaymentApiResult,
  InitializePaymentResult,
  PaystackBank,
  PaystackBanksResult,
  PaystackSubaccountStatus,
  UpdatePaymentSettingsBody,
  WorkspacePaymentSettings,
  PaymentSettingsResult,
} from "@/types/payments";

function authHeaders(accessToken: string, json = false): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

function publicHeaders(json = false): HeadersInit {
  return {
    Accept: "application/json",
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

function asStatus(raw: unknown): PaystackSubaccountStatus {
  const value = String(raw ?? "not_connected").toLowerCase();
  if (
    value === "pending" ||
    value === "active" ||
    value === "failed" ||
    value === "not_connected"
  ) {
    return value;
  }
  return "not_connected";
}

function asSettings(raw: WorkspacePaymentSettings): WorkspacePaymentSettings {
  return {
    payoutBusinessName:
      raw.payoutBusinessName == null ? null : String(raw.payoutBusinessName),
    payoutBankCode:
      raw.payoutBankCode == null ? null : String(raw.payoutBankCode),
    payoutAccountNumber:
      raw.payoutAccountNumber == null ? null : String(raw.payoutAccountNumber),
    payoutAccountName:
      raw.payoutAccountName == null ? null : String(raw.payoutAccountName),
    paystackSubaccountCode:
      raw.paystackSubaccountCode == null
        ? null
        : String(raw.paystackSubaccountCode),
    paystackSubaccountStatus: asStatus(raw.paystackSubaccountStatus),
    platformFeePercent:
      raw.platformFeePercent == null ? null : Number(raw.platformFeePercent),
    publicKey: raw.publicKey == null ? null : String(raw.publicKey),
  };
}

function asBank(raw: PaystackBank): PaystackBank {
  return {
    name: String(raw.name ?? ""),
    code: String(raw.code ?? ""),
    country: raw.country == null ? undefined : String(raw.country),
    currency: raw.currency == null ? undefined : String(raw.currency),
  };
}

function asPayInit(raw: InitializePaymentResult): InitializePaymentResult {
  return {
    authorizationUrl: String(raw.authorizationUrl ?? ""),
    accessCode: raw.accessCode == null ? null : String(raw.accessCode),
    reference: String(raw.reference ?? ""),
    publicKey: raw.publicKey == null ? null : String(raw.publicKey),
  };
}

/** GET /workspaces/{workspaceId}/payments/settings */
export async function getPaymentSettings(
  workspaceId: string,
  accessToken: string,
): Promise<PaymentSettingsResult> {
  const url = `${getSmeApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/payments/settings`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: authHeaders(accessToken),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not load payment settings. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<WorkspacePaymentSettings>(
    res,
    "Payment settings could not be loaded.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asSettings(parsed.data) };
}

/** PUT /workspaces/{workspaceId}/payments/settings */
export async function updatePaymentSettings(
  workspaceId: string,
  accessToken: string,
  body: UpdatePaymentSettingsBody,
): Promise<PaymentSettingsResult> {
  const url = `${getSmeApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/payments/settings`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "PUT",
      headers: authHeaders(accessToken, true),
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not save payment settings. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<WorkspacePaymentSettings>(
    res,
    "Payment settings could not be saved.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asSettings(parsed.data) };
}

/** POST /workspaces/{workspaceId}/payments/connect */
export async function connectPaystackSubaccount(
  workspaceId: string,
  accessToken: string,
): Promise<PaymentSettingsResult> {
  const url = `${getSmeApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/payments/connect`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: authHeaders(accessToken),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not connect Paystack. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<WorkspacePaymentSettings>(
    res,
    "Paystack subaccount could not be connected.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asSettings(parsed.data) };
}

/** GET /payments/paystack/banks?country=… */
export async function listPaystackBanks(
  accessToken: string,
  country = "ZA",
): Promise<PaystackBanksResult> {
  const url = `${getSmeApiBaseUrl()}/payments/paystack/banks?country=${encodeURIComponent(country)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: authHeaders(accessToken),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not load banks. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<unknown>(
    res,
    "Banks could not be loaded.",
  );
  if (!parsed.ok) return parsed;

  const raw = parsed.data;
  const list: PaystackBank[] = Array.isArray(raw)
    ? (raw as PaystackBank[])
    : Array.isArray((raw as { banks?: PaystackBank[] })?.banks)
      ? ((raw as { banks: PaystackBank[] }).banks)
      : Array.isArray((raw as { data?: PaystackBank[] })?.data)
        ? ((raw as { data: PaystackBank[] }).data)
        : [];

  return {
    ok: true,
    data: list
      .map(asBank)
      .filter((bank) => bank.code.trim() && bank.name.trim()),
  };
}

/** POST /public/storefronts/{storeSlug}/checkout/{orderId}/pay */
export async function initializeOrderPayment(
  storeSlug: string,
  orderId: string,
  body?: { callbackUrl?: string },
): Promise<InitializePaymentApiResult> {
  const url = `${getSmeApiBaseUrl()}/public/storefronts/${encodeURIComponent(storeSlug)}/checkout/${encodeURIComponent(orderId)}/pay`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: publicHeaders(Boolean(body?.callbackUrl)),
      body: body?.callbackUrl
        ? JSON.stringify({ callbackUrl: body.callbackUrl })
        : undefined,
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not start payment. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<InitializePaymentResult>(
    res,
    "Payment could not be initialized.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asPayInit(parsed.data) };
}
