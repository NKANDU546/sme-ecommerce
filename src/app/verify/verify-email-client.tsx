"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Modal } from "@modals";
import { verifyEmailAction } from "@/actions/auth";

type VerifyState =
  | { status: "verifying"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const titleId = useId();
  const token = searchParams.get("token")?.trim() ?? "";
  const [state, setState] = useState<VerifyState>({
    status: "verifying",
    message: "Verifying your email address...",
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      if (!token) {
        setState({
          status: "error",
          message: "Verification token is missing from this link.",
        });
        return;
      }

      const result = await verifyEmailAction(token).catch(() => null);
      if (!result) {
        setState({
          status: "error",
          message:
            "Email verification could not be completed. Please try the link again.",
        });
        return;
      }

      if (!result.ok) {
        setState({ status: "error", message: result.errorMessage });
        return;
      }

      setState({
        status: "success",
        message: result.message || "Successfully verified.",
      });

      window.setTimeout(() => {
        router.push("/signin");
      }, 2200);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [router, token]);

  const isSuccess = state.status === "success";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center px-5 py-12 text-center sm:px-6">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-primary-blue/55">
        SME Operations
      </p>
      <h1 className="mt-3 font-serif text-[clamp(1.85rem,4vw,2.5rem)] font-light leading-[1.12] tracking-tight text-primary-blue">
        Email verification
      </h1>
      <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-muted-foreground sm:text-base">
        {state.message}
      </p>
      {state.status === "error" ? (
        <Link
          href="/signin"
          className="mt-7 inline-flex items-center justify-center bg-primary-blue px-5 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-primary-blue/90"
        >
          Go to sign in
        </Link>
      ) : null}

      <Modal
        open={isSuccess}
        onClose={() => router.push("/signin")}
        labelledBy={titleId}
        closeOnBackdropClick={false}
      >
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-blue/55">
          SME Operations
        </p>
        <h2
          id={titleId}
          className="mt-3 font-serif text-2xl font-light tracking-tight text-primary-blue sm:text-3xl"
        >
          Successfully verified
        </h2>
        <p className="mt-4 font-sans text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          Your email has been verified. Redirecting to sign in...
        </p>
        <Link
          href="/signin"
          className="mt-8 inline-flex items-center justify-center bg-primary-blue px-5 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-primary-blue/90"
        >
          Go to sign in now
        </Link>
      </Modal>
    </div>
  );
}
