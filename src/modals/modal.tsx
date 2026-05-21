"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";

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
  "absolute inset-0 bg-primary-blue/50 backdrop-blur-sm transition-opacity";

const defaultPanel =
  "relative z-10 w-full max-w-md border border-primary-blue/15 bg-white px-6 py-8 shadow-2xl sm:px-8 sm:py-10";

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

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 ${className}`.trim()}
    >
      {closeOnBackdropClick ? (
        <button
          type="button"
          className={overlayClassName}
          aria-label="Dismiss"
          onClick={onClose}
        />
      ) : (
        <div className={overlayClassName} aria-hidden />
      )}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={`${defaultPanel} ${panelClassName}`.trim()}
      >
        {children}
      </div>
    </div>
  );
}
