"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** `id` of the visible dialog title (e.g. from `useId()`). */
  labelledBy: string;
  describedBy?: string;
  /** Appended to the dialog panel. */
  panelClassName?: string;
  /** Replaces default overlay classes. */
  overlayClassName?: string;
  /** Appended to the fixed root wrapper (e.g. z-index). */
  className?: string;
  closeOnBackdropClick?: boolean;
};

const defaultOverlay =
  "absolute inset-0 bg-primary-blue/50 backdrop-blur-sm";

const defaultPanel =
  "relative z-10 w-full max-w-md border border-primary-blue/15 bg-white px-6 py-8 shadow-2xl sm:px-8 sm:py-10";

const overlayTransition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };
const panelTransition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.85,
};

export function Modal({
  open,
  onClose,
  children,
  labelledBy,
  describedBy,
  panelClassName = "",
  overlayClassName = defaultOverlay,
  className = "",
  closeOnBackdropClick = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const node = panelRef.current;
    queueMicrotask(() => {
      node?.focus({ preventScroll: true });
    });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="modal-root"
          className={`fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 ${className}`.trim()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
        >
          {closeOnBackdropClick ? (
            <motion.button
              type="button"
              className={overlayClassName}
              aria-label="Dismiss"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={overlayTransition}
              onClick={onClose}
            />
          ) : (
            <motion.div
              className={overlayClassName}
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={overlayTransition}
            />
          )}

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            tabIndex={-1}
            className={`${defaultPanel} ${panelClassName}`.trim()}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={panelTransition}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
