import type { ParsedApiFailure } from "@/apis/api-result";

export type PaystackSubaccountStatus =
  | "not_connected"
  | "pending"
  | "active"
  | "failed";

export type WorkspacePaymentSettings = {
  payoutBusinessName: string | null;
  payoutBankCode: string | null;
  payoutAccountNumber: string | null;
  payoutAccountName: string | null;
  paystackSubaccountCode: string | null;
  paystackSubaccountStatus: PaystackSubaccountStatus;
  platformFeePercent: number | null;
  /** Safe to expose — platform public key for Popup if needed. */
  publicKey: string | null;
};

export type UpdatePaymentSettingsBody = {
  payoutBusinessName: string;
  payoutBankCode: string;
  payoutAccountNumber: string;
  platformFeePercent?: number | null;
};

export type PaystackBank = {
  name: string;
  code: string;
  country?: string;
  currency?: string;
};

export type InitializePaymentResult = {
  authorizationUrl: string;
  accessCode: string | null;
  reference: string;
  publicKey: string | null;
};

export type PaymentSettingsResult =
  | { ok: true; data: WorkspacePaymentSettings }
  | ParsedApiFailure;

export type PaystackBanksResult =
  | { ok: true; data: PaystackBank[] }
  | ParsedApiFailure;

export type InitializePaymentApiResult =
  | { ok: true; data: InitializePaymentResult }
  | ParsedApiFailure;
