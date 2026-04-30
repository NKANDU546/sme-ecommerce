"use client";

import Link from "next/link";
import { useId } from "react";
import { Modal } from "@modals";

type SignupVerifyModalProps = {
  open: boolean;
  email: string;
  businessId: string;
  message: string;
  onClose: () => void;
};

export function SignupVerifyModal({
  open,
  email,
  businessId,
  message,
  onClose,
}: SignupVerifyModalProps) {
  const titleId = useId();

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-blue/55">
        SME Operations
      </p>
      <h2
        id={titleId}
        className="mt-3 font-serif text-2xl font-light tracking-tight text-primary-blue sm:text-3xl"
      >
        Almost there
      </h2>
      <p className="mt-4 font-sans text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
        We sent a verification link to{" "}
        <span className="font-medium text-foreground">{email}</span>. Open your
        inbox (and spam or promotions) to confirm your email—then you can sign
        in and open your workspace.
      </p>
      {message ? (
        <p className="mt-3 border-l-2 border-primary-blue/25 pl-3 font-sans text-sm text-primary-blue/90">
          {message}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href="/signin"
          className="inline-flex items-center justify-center bg-primary-blue px-5 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-primary-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
        >
          Go to sign in
        </Link>
        <Link
          href={`/dashboard/${businessId}`}
          className="inline-flex items-center justify-center border border-primary-blue/20 bg-white px-5 py-3 font-sans text-sm font-medium text-primary-blue transition-colors hover:bg-blue-gray/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
        >
          Preview workspace
        </Link>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-6 font-sans text-sm font-medium text-muted-foreground underline decoration-primary-blue/25 underline-offset-4 transition-colors hover:text-primary-blue"
      >
        Close and stay on this page
      </button>
    </Modal>
  );
}
