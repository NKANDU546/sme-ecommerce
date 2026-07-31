import { Suspense } from "react";
import { PaystackCallbackClient } from "@/app/pay/callback/paystack-callback-client";

export default function PaystackCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background font-sans text-sm text-muted-foreground">
          Returning to your order…
        </div>
      }
    >
      <PaystackCallbackClient />
    </Suspense>
  );
}
