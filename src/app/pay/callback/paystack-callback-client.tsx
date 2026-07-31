"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearPaystackReturnPath,
  loadPaystackReturnPath,
} from "@/lib/paystack-return";

/**
 * Paystack redirects here after payment (fixed dashboard callback URL).
 * We then send the customer to their store order confirmation page.
 */
export function PaystackCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Confirming your payment…");

  useEffect(() => {
    const reference =
      searchParams.get("reference")?.trim() ||
      searchParams.get("trxref")?.trim() ||
      "";

    if (!reference) {
      setMessage(
        "Payment finished, but we could not find your order reference. Return to the store and open your order confirmation link.",
      );
      return;
    }

    const stored = loadPaystackReturnPath(reference);
    if (stored) {
      clearPaystackReturnPath(reference);
      const sep = stored.includes("?") ? "&" : "?";
      router.replace(`${stored}${sep}reference=${encodeURIComponent(reference)}`);
      return;
    }

    setMessage(
      "Payment finished. Open the order confirmation page from your store if you are not redirected automatically.",
    );
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-blue/55">
        SME Operations
      </p>
      <h1 className="font-serif text-2xl font-light text-primary-blue">
        Returning to your order
      </h1>
      <p className="max-w-md font-sans text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
