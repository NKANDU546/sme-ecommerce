"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import {
  StorefrontButton,
  StorefrontButtonLink,
} from "@/components/storefront/storefront-button";
import { StorefrontThemeRoot } from "@/components/storefront/storefront-theme-root";
import { ClassicBoutiqueSiteFooter } from "@/components/storefront/templates/classic-boutique-site-footer";
import { ClassicBoutiqueSiteHeader } from "@/components/storefront/templates/classic-boutique-site-header";
import { usePreviewCartOptional } from "@/contexts/preview-cart-context";
import { useCheckout } from "@/hooks/use-checkout";
import { usePublicStorefront } from "@/hooks/use-public-storefront";
import { publicStorefrontBasePath } from "@/lib/preview-shop-href";

type PublicCartCheckoutClientProps = {
  storeSlug: string;
};

type Step = "cart" | "checkout";

const fieldClass =
  "mt-2 w-full border-0 bg-[color:var(--sf-nav-hover-wash)] px-4 py-3 font-sans text-sm text-[color:var(--sf-accent)] outline-none placeholder:text-[color:var(--sf-accent-text-45)] focus:ring-2 focus:ring-[color:var(--sf-accent)]/15";

const labelClass =
  "font-sans text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--sf-accent)]";

export function PublicCartCheckoutClient({
  storeSlug,
}: PublicCartCheckoutClientProps) {
  const router = useRouter();
  const basePath = publicStorefrontBasePath(storeSlug);
  const cart = usePreviewCartOptional();
  const storefrontQuery = usePublicStorefront(storeSlug);
  const checkoutMutation = useCheckout(storeSlug);
  const [step, setStep] = useState<Step>("cart");

  if (storefrontQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-sans text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (storefrontQuery.isError || !storefrontQuery.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <h1 className="font-serif text-2xl text-primary-blue">
          Store not available
        </h1>
        <p className="max-w-md font-sans text-sm text-muted-foreground">
          {storefrontQuery.error instanceof Error
            ? storefrontQuery.error.message
            : "This storefront is unpublished or does not exist."}
        </p>
      </div>
    );
  }

  const config = storefrontQuery.data.config;
  const lines = cart?.lines ?? [];
  const busy = Boolean(cart?.isBusy || checkoutMutation.isPending);

  async function onCheckoutSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart?.cartId) {
      toast.error("Your cart is empty or not ready yet.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const name = String(form.get("fullName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const line1 = String(form.get("address") ?? "").trim();
    const line2 = String(form.get("address2") ?? "").trim();
    const city = String(form.get("city") ?? "").trim();
    const province = String(form.get("region") ?? "").trim();
    const postalCode = String(form.get("postalCode") ?? "").trim();
    const country = String(form.get("country") ?? "ZA").trim() || "ZA";

    try {
      const order = await checkoutMutation.mutateAsync({
        cartId: cart.cartId,
        customer: {
          name,
          phone,
          ...(email ? { email } : {}),
        },
        shippingAddress: {
          line1,
          ...(line2 ? { line2 } : {}),
          city,
          province,
          postalCode,
          country,
        },
      });
      cart.discardCartSession?.();
      toast.success("Order placed", {
        description: `Reference ${order.orderNumber}. Continue to Paystack on the next screen.`,
      });
      router.push(`${basePath}/order/${order.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Checkout failed.",
      );
    }
  }

  return (
    <StorefrontThemeRoot config={config}>
      <div className="min-h-screen bg-[color:var(--sf-page-bg)]">
        <ClassicBoutiqueSiteHeader config={config} basePath={basePath} />
        <main className="w-full px-4 py-8 sm:px-8 sm:py-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--sf-accent-text-45)]">
                Checkout
              </p>
              <h1 className="mt-2 font-serif text-3xl font-light text-[color:var(--sf-accent)]">
                {step === "cart" ? "Your cart" : "Delivery details"}
              </h1>
            </div>
            <StorefrontButtonLink
              href={`${basePath}/shop`}
              variant="text"
              className="text-sm"
            >
              Continue shopping
            </StorefrontButtonLink>
          </div>

          {cart?.cartError ? (
            <p className="mb-4 font-sans text-sm text-red-700" role="alert">
              {cart.cartError}
            </p>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div>
              {step === "cart" ? (
                <section className="overflow-hidden bg-white shadow-sm">
                  {lines.length === 0 ? (
                    <div className="p-8 text-center">
                      <h2 className="font-sans text-lg font-bold text-[color:var(--sf-accent)]">
                        Your shopping cart is empty
                      </h2>
                      <p className="mt-2 font-sans text-sm text-[color:var(--sf-accent-text-60)]">
                        Add products from the shop, then come back to check out.
                      </p>
                      <Link
                        href={`${basePath}/shop`}
                        className="mt-4 inline-block font-sans text-sm font-semibold text-[color:var(--sf-accent)] underline"
                      >
                        Browse shop
                      </Link>
                    </div>
                  ) : (
                    <ul className="divide-y divide-[color:var(--sf-accent-border-10)]">
                      {lines.map((line) => (
                        <li
                          key={line.productId}
                          className="flex flex-wrap items-center gap-4 p-5"
                        >
                          <div className="h-16 w-16 shrink-0 overflow-hidden bg-[color:var(--sf-nav-hover-wash)]">
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
                            <p className="font-sans text-sm font-bold text-[color:var(--sf-accent)]">
                              {line.title}
                            </p>
                            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                              {line.sku}
                            </p>
                            <p className="mt-1 font-sans text-sm tabular-nums">
                              {line.priceLabel}
                            </p>
                          </div>
                          <div className="inline-flex border border-[color:var(--sf-accent)]">
                            <button
                              type="button"
                              disabled={busy || line.quantity <= 1}
                              onClick={() =>
                                cart?.decrementLine(line.productId)
                              }
                              className="h-9 w-9 disabled:opacity-40"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="flex h-9 w-10 items-center justify-center border-x border-[color:var(--sf-accent)] text-sm">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                cart?.incrementLine(line.productId)
                              }
                              className="h-9 w-9 disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <StorefrontButton
                            type="button"
                            variant="text"
                            disabled={busy}
                            onClick={() => cart?.removeLine(line.productId)}
                            className="text-xs"
                          >
                            Remove
                          </StorefrontButton>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ) : (
                <form
                  id="public-checkout-form"
                  onSubmit={(e) => void onCheckoutSubmit(e)}
                  className="bg-white p-6 shadow-sm sm:p-8"
                >
                  <h2 className="font-sans text-base font-bold text-[color:var(--sf-accent)]">
                    Customer & delivery
                  </h2>
                  <p className="mt-2 font-sans text-sm text-[color:var(--sf-accent-text-60)]">
                    Online card payment comes in Step 06B. This places an order
                    as unpaid / pending payment.
                  </p>
                  <div className="mt-7 grid gap-5 sm:grid-cols-2">
                    <label className={`${labelClass} sm:col-span-2`}>
                      Full name
                      <input
                        required
                        name="fullName"
                        autoComplete="name"
                        className={fieldClass}
                      />
                    </label>
                    <label className={labelClass}>
                      Email (optional)
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        className={fieldClass}
                      />
                    </label>
                    <label className={labelClass}>
                      Phone
                      <input
                        required
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        className={fieldClass}
                        placeholder="+27"
                      />
                    </label>
                    <label className={`${labelClass} sm:col-span-2`}>
                      Street address
                      <input
                        required
                        name="address"
                        autoComplete="street-address"
                        className={fieldClass}
                      />
                    </label>
                    <label className={`${labelClass} sm:col-span-2`}>
                      Apartment, suite (optional)
                      <input name="address2" className={fieldClass} />
                    </label>
                    <label className={labelClass}>
                      City
                      <input
                        required
                        name="city"
                        autoComplete="address-level2"
                        className={fieldClass}
                      />
                    </label>
                    <label className={labelClass}>
                      Province
                      <input
                        required
                        name="region"
                        autoComplete="address-level1"
                        className={fieldClass}
                      />
                    </label>
                    <label className={labelClass}>
                      Postal code
                      <input
                        required
                        name="postalCode"
                        autoComplete="postal-code"
                        className={fieldClass}
                      />
                    </label>
                    <label className={labelClass}>
                      Country
                      <input
                        name="country"
                        defaultValue="ZA"
                        autoComplete="country"
                        className={fieldClass}
                      />
                    </label>
                  </div>
                </form>
              )}
            </div>

            <aside className="h-fit bg-white p-6 shadow-sm">
              <h2 className="font-sans text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--sf-accent)]">
                Order summary
              </h2>
              <div className="mt-4 space-y-2 font-sans text-sm text-[color:var(--sf-accent)]">
                <div className="flex justify-between gap-3">
                  <span>Items</span>
                  <span>{cart?.itemCount ?? 0}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Subtotal</span>
                  <span>{cart?.subtotalLabel ?? "—"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Shipping</span>
                  <span>R0.00</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-[color:var(--sf-accent-border-10)] pt-3 text-base font-bold">
                  <span>Total</span>
                  <span>{cart?.totalLabel ?? "—"}</span>
                </div>
              </div>

              {step === "cart" ? (
                <StorefrontButton
                  type="button"
                  className="mt-6 w-full rounded-none font-bold"
                  disabled={lines.length === 0 || busy || !cart?.cartId}
                  onClick={() => setStep("checkout")}
                >
                  Proceed to checkout
                </StorefrontButton>
              ) : (
                <div className="mt-6 space-y-2">
                  <StorefrontButton
                    type="submit"
                    form="public-checkout-form"
                    className="w-full rounded-none font-bold"
                    disabled={busy || !cart?.cartId}
                  >
                    {checkoutMutation.isPending
                      ? "Placing order…"
                      : "Place order"}
                  </StorefrontButton>
                  <StorefrontButton
                    type="button"
                    variant="outline"
                    className="w-full rounded-none"
                    disabled={busy}
                    onClick={() => setStep("cart")}
                  >
                    Back to cart
                  </StorefrontButton>
                </div>
              )}
            </aside>
          </div>
        </main>
        <ClassicBoutiqueSiteFooter config={config} basePath={basePath} />
      </div>
    </StorefrontThemeRoot>
  );
}
