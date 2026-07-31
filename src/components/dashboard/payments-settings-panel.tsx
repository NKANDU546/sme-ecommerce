"use client";

import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useConnectPaystackSubaccount,
  usePaymentSettings,
  useUpdatePaymentSettings,
} from "@/hooks/use-payments";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import {
  PAYSTACK_PAYOUT_COUNTRY,
  PAYSTACK_ZA_BANKS,
} from "@/lib/paystack-za-banks";
import type { PaystackSubaccountStatus } from "@/types/payments";

type PaymentsSettingsPanelProps = {
  workspaceId: string;
};

const fieldClass =
  "mt-1.5 w-full border border-primary-blue/15 bg-white px-3 py-2.5 font-sans text-sm text-primary-blue outline-none focus-visible:border-primary-blue/35 focus-visible:ring-2 focus-visible:ring-primary-blue/15";

const labelClass =
  "block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-blue/60";

function statusLabel(status: PaystackSubaccountStatus): string {
  switch (status) {
    case "active":
      return "Connected";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    default:
      return "Not connected";
  }
}

function statusClass(status: PaystackSubaccountStatus): string {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-800 ring-emerald-700/15";
    case "pending":
      return "bg-amber-50 text-amber-900 ring-amber-700/15";
    case "failed":
      return "bg-red-50 text-red-800 ring-red-700/15";
    default:
      return "bg-blue-gray/40 text-primary-blue/70 ring-primary-blue/10";
  }
}

export function PaymentsSettingsPanel({
  workspaceId,
}: PaymentsSettingsPanelProps) {
  const [signedIn, setSignedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  useEffect(() => {
    setSignedIn(Boolean(getStoredAuthSession()?.accessToken));
    setAuthReady(true);
  }, []);

  const settingsQuery = usePaymentSettings(workspaceId, signedIn);
  const saveMutation = useUpdatePaymentSettings(workspaceId);
  const connectMutation = useConnectPaystackSubaccount(workspaceId);

  useEffect(() => {
    const data = settingsQuery.data;
    if (!data) return;
    setBusinessName(data.payoutBusinessName ?? "");
    setBankCode(data.payoutBankCode ?? "");
    setAccountNumber(data.payoutAccountNumber ?? "");
  }, [settingsQuery.data]);

  const selectedBank =
    PAYSTACK_ZA_BANKS.find((bank) => bank.code === bankCode) ?? null;
  const status = settingsQuery.data?.paystackSubaccountStatus ?? "not_connected";
  const busy = saveMutation.isPending || connectMutation.isPending;

  async function onSave(event: FormEvent) {
    event.preventDefault();
    try {
      await saveMutation.mutateAsync({
        payoutBusinessName: businessName.trim(),
        payoutBankCode: bankCode.trim(),
        payoutAccountNumber: accountNumber.trim(),
      });
      toast.success("Payment details saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save settings.",
      );
    }
  }

  async function onConnect() {
    try {
      if (
        businessName.trim() !== (settingsQuery.data?.payoutBusinessName ?? "") ||
        bankCode.trim() !== (settingsQuery.data?.payoutBankCode ?? "") ||
        accountNumber.trim() !== (settingsQuery.data?.payoutAccountNumber ?? "")
      ) {
        await saveMutation.mutateAsync({
          payoutBusinessName: businessName.trim(),
          payoutBankCode: bankCode.trim(),
          payoutAccountNumber: accountNumber.trim(),
        });
      }
      const next = await connectMutation.mutateAsync();
      if (next.paystackSubaccountStatus === "active") {
        toast.success("Paystack connected", {
          description: next.paystackSubaccountCode
            ? `Subaccount ${next.paystackSubaccountCode}`
            : "Customers can pay on your live store.",
        });
      } else {
        toast.message("Connect finished", {
          description: `Status: ${statusLabel(next.paystackSubaccountStatus)}`,
        });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not connect Paystack.",
      );
    }
  }

  if (!authReady || (signedIn && settingsQuery.isLoading)) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16 font-sans text-sm text-muted-foreground">
        Loading payment settings…
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <h2 className="font-serif text-2xl font-light text-primary-blue">
          Sign in required
        </h2>
        <p className="max-w-md font-sans text-sm text-muted-foreground">
          Sign in to connect payout banking for Paystack.
        </p>
      </div>
    );
  }

  if (settingsQuery.isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <h2 className="font-serif text-2xl font-light text-primary-blue">
          Could not load payments
        </h2>
        <p className="max-w-md font-sans text-sm text-muted-foreground">
          {settingsQuery.error instanceof Error
            ? settingsQuery.error.message
            : "Try again in a moment."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6 sm:px-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl font-light text-primary-blue">
              Payments
            </h2>
            <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">
              Connect your bank account so customer Paystack payments settle to
              you. You never paste Paystack API keys — SME Operations handles
              that.
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wide ring-1 ${statusClass(status)}`}
          >
            {statusLabel(status)}
          </span>
        </div>

        {settingsQuery.data?.paystackSubaccountCode ? (
          <p className="font-sans text-xs text-muted-foreground">
            Subaccount{" "}
            <span className="font-mono text-primary-blue">
              {settingsQuery.data.paystackSubaccountCode}
            </span>
            {settingsQuery.data.payoutAccountName
              ? ` · ${settingsQuery.data.payoutAccountName}`
              : null}
          </p>
        ) : null}

        <form
          onSubmit={(e) => void onSave(e)}
          className="space-y-4 border border-primary-blue/10 bg-white p-5 shadow-sm"
        >
          <label className={labelClass}>
            Business / shop name
            <input
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className={fieldClass}
              placeholder="Your shop name"
            />
          </label>

          <p className="font-sans text-xs text-muted-foreground">
            Payouts are limited to{" "}
            <span className="font-semibold text-primary-blue">
              South Africa ({PAYSTACK_PAYOUT_COUNTRY})
            </span>{" "}
            for now. Pick a bank — the Paystack bank code is filled in for you.
          </p>

          <label className={labelClass}>
            Bank
            <select
              required
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className={fieldClass}
            >
              <option value="" disabled>
                Select a bank
              </option>
              {PAYSTACK_ZA_BANKS.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
              {bankCode && !selectedBank ? (
                <option value={bankCode}>Saved bank ({bankCode})</option>
              ) : null}
            </select>
            {selectedBank ? (
              <span className="mt-1 block font-sans text-[11px] normal-case tracking-normal text-muted-foreground">
                Bank code:{" "}
                <span className="font-mono font-semibold text-primary-blue">
                  {selectedBank.code}
                </span>
              </span>
            ) : null}
          </label>

          <label className={labelClass}>
            Account number
            <input
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className={fieldClass}
              inputMode="numeric"
              autoComplete="off"
              placeholder="South African account number"
            />
            <span className="mt-1 block font-sans text-[11px] normal-case tracking-normal text-muted-foreground">
              Test mode: use a valid-looking account for that bank (random digits
              may be rejected). Live: merchant’s real SA account only.
            </span>
          </label>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={busy}
              className="border border-primary-blue/20 bg-white px-4 py-2.5 font-sans text-sm font-semibold text-primary-blue transition-colors hover:bg-blue-gray/40 disabled:opacity-50"
            >
              {saveMutation.isPending ? "Saving…" : "Save details"}
            </button>
            <button
              type="button"
              disabled={
                busy ||
                !businessName.trim() ||
                !bankCode.trim() ||
                !accountNumber.trim()
              }
              onClick={() => void onConnect()}
              className="bg-primary-blue px-4 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-primary-blue/90 disabled:opacity-50"
            >
              {connectMutation.isPending
                ? "Connecting…"
                : status === "active"
                  ? "Update Paystack connection"
                  : "Connect with Paystack"}
            </button>
          </div>
        </form>

        <p className="font-sans text-xs leading-relaxed text-muted-foreground">
          After connect is active, customers can pay orders on your live store
          with Paystack. Test mode uses Paystack test cards.
        </p>
      </div>
    </div>
  );
}
