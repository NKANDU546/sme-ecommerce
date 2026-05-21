"use client";

import { useEffect, useState } from "react";
import { usePreviewCartOptional } from "@/contexts/preview-cart-context";
import {
  StorefrontButton,
  StorefrontButtonLink,
} from "@/components/storefront/storefront-button";
import { StorefrontThemeRoot } from "@/components/storefront/storefront-theme-root";
import { loadStorefront } from "@/lib/storefront-storage";
import type { StorefrontConfig } from "@/types/storefront";

type PreviewCartDrawerProps = {
  workspaceId: string;
};

export function PreviewCartDrawer({ workspaceId }: PreviewCartDrawerProps) {
  const cart = usePreviewCartOptional();
  const [config, setConfig] = useState<StorefrontConfig | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setConfig(loadStorefront(workspaceId));
    }, 0);
    return () => window.clearTimeout(id);
  }, [workspaceId]);

  useEffect(() => {
    if (!cart?.isDrawerOpen && !cart?.isAddedModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (cart.isAddedModalOpen) {
        cart.closeAddedModal();
        return;
      }
      cart.closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cart]);

  useEffect(() => {
    if (!cart?.isDrawerOpen && !cart?.isAddedModalOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [cart?.isAddedModalOpen, cart?.isDrawerOpen]);

  if (!cart) return null;

  const {
    lines,
    lastAddedLine,
    isDrawerOpen,
    isAddedModalOpen,
    closeDrawer,
    closeAddedModal,
    incrementLine,
    decrementLine,
    removeLine,
    clearCart,
    itemCount,
  } = cart;
  const displayLine = lastAddedLine
    ? lines.find((line) => line.productId === lastAddedLine.productId)
    : lines[lines.length - 1] ?? null;

  const body = (
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
          <h2 className="font-serif text-lg font-semibold text-[color:var(--sf-accent)]">
            Your cart
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-md p-2 font-sans text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close cart"
          >
            &times;
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="font-sans text-sm leading-relaxed text-muted-foreground">
              Your cart is empty. Browse the shop collection and add products
              with{" "}
              <span className="font-semibold text-foreground">
                Add to cart
              </span>
              .
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
                    <p className="truncate font-sans text-sm font-semibold text-[color:var(--sf-accent)]">
                      {line.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {line.sku}
                    </p>
                    <p className="mt-1 font-sans text-sm font-medium tabular-nums text-[color:var(--sf-accent)]">
                      {line.priceLabel}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center rounded-md border border-border">
                        <button
                          type="button"
                          className="px-2 py-1 font-sans text-sm text-[color:var(--sf-accent)] hover:bg-[color:var(--sf-nav-hover-wash)] disabled:opacity-40"
                          onClick={() => decrementLine(line.productId)}
                          disabled={line.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="min-w-[1.75rem] px-1 text-center font-sans text-xs font-semibold tabular-nums text-[color:var(--sf-accent)]">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="px-2 py-1 font-sans text-sm text-[color:var(--sf-accent)] hover:bg-[color:var(--sf-nav-hover-wash)]"
                          onClick={() => incrementLine(line.productId)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <StorefrontButton
                        type="button"
                        onClick={() => removeLine(line.productId)}
                        variant="text"
                        className="text-xs"
                      >
                        Remove
                      </StorefrontButton>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 border-t border-border bg-muted/40 px-5 py-4">
          <p className="font-sans text-xs text-muted-foreground">
            <span className="font-semibold text-[color:var(--sf-accent)]">{itemCount}</span>{" "}
            {itemCount === 1 ? "item" : "items"} · preview only (saved in this
            browser)
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StorefrontButton
              type="button"
              onClick={clearCart}
              disabled={lines.length === 0}
              variant="outline"
              size="sm"
              className="rounded-lg"
            >
              Clear cart
            </StorefrontButton>
            {lines.length === 0 ? (
              <StorefrontButton
                type="button"
                disabled
                size="sm"
                className="rounded-lg"
              >
                View cart
              </StorefrontButton>
            ) : (
              <StorefrontButtonLink
                href={`/preview/${workspaceId}/cart`}
                onClick={closeDrawer}
                size="sm"
                className="rounded-lg"
              >
                View cart
              </StorefrontButtonLink>
            )}
          </div>
        </div>
      </aside>

      <div
        className={`fixed inset-0 z-[110] bg-black/45 transition-opacity duration-200 ${
          isAddedModalOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isAddedModalOpen}
        onClick={closeAddedModal}
      />
      <div
        className={`fixed inset-0 z-[111] flex items-start justify-center px-4 py-6 transition-opacity duration-200 sm:items-center sm:py-10 ${
          isAddedModalOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isAddedModalOpen}
        onClick={closeAddedModal}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-cart-added-modal-title"
          className={`w-full max-w-3xl bg-white px-5 py-5 shadow-2xl transition-all duration-200 sm:px-7 sm:py-6 ${
            isAddedModalOpen
              ? "translate-y-0 scale-100"
              : "translate-y-3 scale-95"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
            <h2
              id="preview-cart-added-modal-title"
              className="font-sans text-2xl font-bold tracking-tight text-neutral-950"
            >
              Cart
            </h2>
            <button
              type="button"
              onClick={closeAddedModal}
              className="rounded-md p-1 font-sans text-3xl leading-none text-neutral-950 transition-colors hover:bg-neutral-100"
              aria-label="Close cart"
            >
              &times;
            </button>
          </div>

          {displayLine ? (
            <div className="grid gap-6 py-7 sm:grid-cols-[minmax(0,1fr)_minmax(16rem,1fr)] sm:gap-9">
              <div className="flex min-h-44 items-center justify-center bg-neutral-50 p-4 sm:min-h-48">
                {displayLine.imageUrl.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayLine.imageUrl}
                    alt=""
                    className="max-h-40 w-full object-contain sm:max-h-44"
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-neutral-100 font-sans text-sm text-neutral-500">
                    No image
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between gap-8 pt-1">
                <div>
                  <p className="max-w-xs font-sans text-lg font-bold leading-snug text-neutral-950">
                    This item has been added to your shopping cart.
                  </p>
                  <div className="mt-20 space-y-3 sm:mt-20">
                    <div className="flex flex-wrap items-center gap-3 font-sans text-base text-neutral-950">
                      <span>Quantity:</span>
                      <div className="inline-flex items-center border border-neutral-300">
                        <button
                          type="button"
                          className="px-3 py-1.5 text-base transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                          onClick={() => decrementLine(displayLine.productId)}
                          disabled={displayLine.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="min-w-9 px-2 text-center tabular-nums">
                          {displayLine.quantity}
                        </span>
                        <button
                          type="button"
                          className="px-3 py-1.5 text-base transition-colors hover:bg-neutral-50"
                          onClick={() => incrementLine(displayLine.productId)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <StorefrontButton
                      type="button"
                      onClick={() => {
                        removeLine(displayLine.productId);
                        closeAddedModal();
                      }}
                      variant="text"
                      className="text-sm"
                    >
                      Remove item
                    </StorefrontButton>
                  </div>
                </div>

                <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
                  <StorefrontButton
                    type="button"
                    onClick={closeAddedModal}
                    variant="outline"
                    className="rounded-none"
                  >
                    Continue Shopping
                  </StorefrontButton>
                  <StorefrontButtonLink
                    href={`/preview/${workspaceId}/cart`}
                    onClick={closeAddedModal}
                    className="rounded-none"
                  >
                    View The Cart
                  </StorefrontButtonLink>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8">
              <p className="font-sans text-sm text-neutral-600">
                Your cart is empty.
              </p>
              <div className="mt-6 flex justify-end">
                <StorefrontButton
                  type="button"
                  onClick={closeAddedModal}
                  variant="outline"
                  className="rounded-none"
                >
                  Continue Shopping
                </StorefrontButton>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );

  return config ? (
    <StorefrontThemeRoot config={config}>{body}</StorefrontThemeRoot>
  ) : (
    body
  );
}
