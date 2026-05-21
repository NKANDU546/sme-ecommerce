import type { Metadata } from "next";
import { Suspense } from "react";
import StickyNavbar from "@/components/landing/sticky-navbar";
import { VerifyEmailClient } from "@/app/verify/verify-email-client";

export const metadata: Metadata = {
  title: "Verify email | SME Operations",
  description: "Verify your SME Operations account email address.",
};

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <StickyNavbar variant="surface" />
      <Suspense
        fallback={
          <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 font-sans text-sm text-muted-foreground">
            Loading verification...
          </div>
        }
      >
        <VerifyEmailClient />
      </Suspense>
    </main>
  );
}
