"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { Modal } from "@modals";

type GoLiveModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLive: boolean;
  hasUnsavedDraft: boolean;
  publicSlug: string | null;
  isSubmitting: boolean;
};

const itemTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 28,
};

export function GoLiveModal({
  open,
  onClose,
  onConfirm,
  isLive,
  hasUnsavedDraft,
  publicSlug,
  isSubmitting,
}: GoLiveModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  const points = [
    "Draft config is validated before publishing.",
    publicSlug
      ? `Public slug stays “${publicSlug}”.`
      : "A public slug is generated automatically if you don’t have one yet.",
    hasUnsavedDraft
      ? "Unsaved edits will be saved before publish."
      : "Your latest saved draft will be used.",
  ];

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => undefined : onClose}
      labelledBy={titleId}
      describedBy={descriptionId}
      closeOnBackdropClick={!isSubmitting}
    >
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: 0.06, delayChildren: 0.08 },
          },
        }}
      >
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0, transition: itemTransition },
          }}
          className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-blue/55"
        >
          Publish storefront
        </motion.p>
        <motion.h2
          id={titleId}
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0, transition: itemTransition },
          }}
          className="mt-3 font-serif text-2xl font-light tracking-tight text-primary-blue sm:text-3xl"
        >
          {isLive ? "Publish an update?" : "Go live?"}
        </motion.h2>
        <motion.p
          id={descriptionId}
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0, transition: itemTransition },
          }}
          className="mt-4 font-sans text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
        >
          {isLive
            ? "This creates a new immutable snapshot from your current draft. Your live status stays active."
            : "This saves your draft, creates a published snapshot, and marks the workspace as live."}
        </motion.p>

        <ul className="mt-5 space-y-2 border-l-2 border-primary-blue/20 pl-3 font-sans text-sm text-primary-blue/80">
          {points.map((point, index) => (
            <motion.li
              key={point}
              variants={{
                hidden: { opacity: 0, x: -8 },
                show: { opacity: 1, x: 0, transition: itemTransition },
              }}
              className={
                hasUnsavedDraft && index === points.length - 1
                  ? "text-amber-800"
                  : undefined
              }
            >
              {point}
            </motion.li>
          ))}
        </ul>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0, transition: itemTransition },
          }}
          className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-3 font-sans text-sm font-semibold text-primary-blue transition-colors hover:bg-blue-gray/40 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-primary-blue px-5 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-primary-blue/90 disabled:pointer-events-none disabled:opacity-60"
          >
            {isSubmitting
              ? "Publishing…"
              : isLive
                ? "Publish update"
                : "Go Live"}
          </button>
        </motion.div>
      </motion.div>
    </Modal>
  );
}
