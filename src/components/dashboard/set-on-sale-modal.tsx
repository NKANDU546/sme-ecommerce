"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { Modal } from "@modals";

type SetOnSaleModalProps = {
  open: boolean;
  productTitle: string;
  /** Current selling price label, e.g. "R 249.00". */
  priceLabel: string;
  /** Selling price in minor units. */
  priceAmount: number;
  onClose: () => void;
  onConfirm: (compareAtPriceAmount: number) => void | Promise<void>;
  isSubmitting: boolean;
};

function formatMinorUnits(amount: number): string {
  return (amount / 100).toFixed(2);
}

function parsePriceToMinorUnits(input: string): number | null {
  const cleaned = input.trim().replace(/R\s*/i, "").replace(/,/g, "");
  if (!cleaned) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

export function SetOnSaleModal({
  open,
  productTitle,
  priceLabel,
  priceAmount,
  onClose,
  onConfirm,
  isSubmitting,
}: SetOnSaleModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [compareAt, setCompareAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // Suggest a was-price ~20% above selling price.
    const suggested = Math.round(priceAmount * 1.2);
    setCompareAt(formatMinorUnits(suggested));
    setError(null);
  }, [open, priceAmount]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = parsePriceToMinorUnits(compareAt);
    if (parsed == null) {
      setError("Enter a valid compare-at price.");
      return;
    }
    if (parsed <= priceAmount) {
      setError(`Must be higher than the selling price (${priceLabel}).`);
      return;
    }
    setError(null);
    await onConfirm(parsed);
  }

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => undefined : onClose}
      labelledBy={titleId}
      describedBy={descriptionId}
      closeOnBackdropClick={!isSubmitting}
    >
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-blue/55">
        Catalogue
      </p>
      <h2
        id={titleId}
        className="mt-3 font-serif text-2xl font-light tracking-tight text-primary-blue sm:text-3xl"
      >
        Put on sale
      </h2>
      <p
        id={descriptionId}
        className="mt-4 font-sans text-sm leading-relaxed text-muted-foreground"
      >
        Set a compare-at (was) price for “{productTitle}”. Current price:{" "}
        <span className="font-medium text-primary-blue">{priceLabel}</span>.
      </p>
      <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="set-on-sale-compare-at"
            className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-[0.14em] text-primary-blue/55"
          >
            Compare-at price (ZAR)
          </label>
          <input
            id="set-on-sale-compare-at"
            type="text"
            inputMode="decimal"
            required
            value={compareAt}
            onChange={(e) => setCompareAt(e.target.value)}
            disabled={isSubmitting}
            placeholder="299.00"
            className="w-full rounded-lg border border-primary-blue/15 bg-white px-3 py-2.5 font-sans text-sm text-primary-blue outline-none focus:border-primary-blue/40 focus:ring-2 focus:ring-primary-blue/15 disabled:opacity-60"
          />
          {error ? (
            <p className="mt-1.5 font-sans text-xs text-red-700">{error}</p>
          ) : (
            <p className="mt-1.5 font-sans text-[11px] text-muted-foreground">
              Shown with strikethrough next to the selling price.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="font-sans text-sm font-medium text-primary-blue underline decoration-primary-blue/30 underline-offset-4 hover:decoration-primary-blue disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-blue px-5 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-primary-blue/90 disabled:opacity-60"
          >
            {isSubmitting ? "Saving…" : "Put on sale"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
