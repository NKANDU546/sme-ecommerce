"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { Modal } from "@modals";

type UnpublishModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
};

const itemTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 28,
};

export function UnpublishModal({
  open,
  onClose,
  onConfirm,
  isSubmitting,
}: UnpublishModalProps) {
  const titleId = useId();
  const descriptionId = useId();

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
          Unpublish storefront
        </motion.p>
        <motion.h2
          id={titleId}
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0, transition: itemTransition },
          }}
          className="mt-3 font-serif text-2xl font-light tracking-tight text-primary-blue sm:text-3xl"
        >
          Take the store offline?
        </motion.h2>
        <motion.p
          id={descriptionId}
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0, transition: itemTransition },
          }}
          className="mt-4 font-sans text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
        >
          Customers will no longer see the live storefront once public routes are
          enabled. Your draft and publish history are kept.
        </motion.p>

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
            className="border border-primary-blue/20 bg-white px-5 py-3 font-sans text-sm font-semibold text-primary-blue transition-colors hover:bg-blue-gray/40 disabled:pointer-events-none disabled:opacity-60"
          >
            {isSubmitting ? "Unpublishing…" : "Unpublish"}
          </button>
        </motion.div>
      </motion.div>
    </Modal>
  );
}
