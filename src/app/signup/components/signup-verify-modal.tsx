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

    </Modal>
  );
}
