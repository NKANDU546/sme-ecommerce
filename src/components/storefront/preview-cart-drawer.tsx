"use client";

import { useEffect } from "react";
import { usePreviewCartOptional } from "@/contexts/preview-cart-context";

export function PreviewCartDrawer() {
  const cart = usePreviewCartOptional();

  useEffect(() => {
    if (!cart?.isDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cart.closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cart]);

  if (!cart) return null;

  const {
    lines,
    isDrawerOpen,
    closeDrawer,
    incrementLine,
    decrementLine,
    removeLine,
    clearCart,
    itemCount,
  } = cart;

  return (
    <>
      <div
        className={`fixed inset-0 z-[100] bg-black/40 transition-opacity duration-200 ${
          isDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isDrawerOpen}
        onClick={closeDrawer}
      />
      <aside
        className={`fixed right-0 top-0 z-[101] flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl transition-transform duration-200 ease-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isDrawerOpen}
        aria-label="Shopping cart"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-serif text-lg font-semibold text-primary-blue">
            Your cart
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-md p-2 font-sans text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="font-sans text-sm leading-relaxed text-muted-foreground">
              Your cart is empty. Browse the shop collection and add products
              with <span className="font-semibold text-foreground">Add to cart</span>.
            </p>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => (
                <li
                  key={line.productId}
                  className="flex gap-3 rounded-lg border border-border bg-card p-3 shadow-sm"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                    {line.imageUrl.trim() ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-sm font-semibold text-primary-blue">
                      {line.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {line.sku}
                    </p>
                    <p className="mt-1 font-sans text-sm font-medium tabular-nums text-primary-blue">
                      {line.priceLabel}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center rounded-md border border-border">
                        <button
                          type="button"
                          className="px-2 py-1 font-sans text-sm text-primary-blue hover:bg-muted disabled:opacity-40"
                          onClick={() => decrementLine(line.productId)}
                          disabled={line.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="min-w-[1.75rem] px-1 text-center font-sans text-xs font-semibold tabular-nums text-primary-blue">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="px-2 py-1 font-sans text-sm text-primary-blue hover:bg-muted"
                          onClick={() => incrementLine(line.productId)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.productId)}
                        className="font-sans text-xs font-medium text-red-700/90 underline decoration-red-700/25 underline-offset-2 hover:decoration-red-700/60"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 border-t border-border bg-muted/40 px-5 py-4">
          <p className="font-sans text-xs text-muted-foreground">
            <span className="font-semibold text-primary-blue">{itemCount}</span>{" "}
            {itemCount === 1 ? "item" : "items"} · preview only (saved in this
            browser)
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={clearCart}
              disabled={lines.length === 0}
              className="rounded-lg border border-border bg-background px-4 py-2 font-sans text-xs font-semibold text-primary-blue transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear cart
            </button>
            <button
              type="button"
              disabled={lines.length === 0}
              className="rounded-lg bg-primary-blue px-4 py-2 font-sans text-xs font-semibold text-white opacity-90 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Checkout (soon)
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
