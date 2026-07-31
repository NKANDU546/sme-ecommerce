"use client";

import { useEffect, useMemo, useState } from "react";
import { useMerchantOrders } from "@/hooks/use-orders";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import { formatMinorAmount } from "@/lib/format-money";
import type { Order } from "@/types/cart";

type OrdersPanelProps = {
  workspaceId: string;
};

function formatWhen(value: string): string {
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return value || "—";
  return new Date(ms).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function paymentBadgeClass(status: string): string {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-800 ring-emerald-700/15";
    case "initialized":
      return "bg-amber-50 text-amber-900 ring-amber-700/15";
    case "failed":
      return "bg-red-50 text-red-800 ring-red-700/15";
    default:
      return "bg-blue-gray/40 text-primary-blue/70 ring-primary-blue/10";
  }
}

export function OrdersPanel({ workspaceId }: OrdersPanelProps) {
  const [signedIn, setSignedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setSignedIn(Boolean(getStoredAuthSession()?.accessToken));
    setAuthReady(true);
  }, []);

  const ordersQuery = useMerchantOrders(workspaceId, signedIn);

  const orders = useMemo(() => {
    const list = ordersQuery.data ?? [];
    return [...list].sort((a, b) => {
      const am = Date.parse(a.createdAt) || 0;
      const bm = Date.parse(b.createdAt) || 0;
      return bm - am;
    });
  }, [ordersQuery.data]);

  const selected: Order | null =
    orders.find((order) => order.id === selectedId) ?? null;

  if (!authReady || (signedIn && ordersQuery.isLoading)) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16 font-sans text-sm text-muted-foreground">
        Loading orders…
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <h2 className="font-serif text-2xl font-light text-primary-blue">
          Sign in required
        </h2>
      </div>
    );
  }

  if (ordersQuery.isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <h2 className="font-serif text-2xl font-light text-primary-blue">
          Could not load orders
        </h2>
        <p className="max-w-md font-sans text-sm text-muted-foreground">
          {ordersQuery.error instanceof Error
            ? ordersQuery.error.message
            : "The orders API may not be available yet."}
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <h2 className="font-serif text-2xl font-light text-primary-blue">
          No orders yet
        </h2>
        <p className="max-w-md font-sans text-sm text-muted-foreground">
          When customers place and pay for orders on your live store, they will
          appear here with email, phone, and totals.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
      <div className="min-h-0 flex-1 overflow-y-auto border-b border-primary-blue/10 lg:border-b-0 lg:border-r">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="sticky top-0 bg-white/95 backdrop-blur">
              <tr className="border-b border-primary-blue/10 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-blue/55">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const active = order.id === selectedId;
                return (
                  <tr
                    key={order.id}
                    className={`cursor-pointer border-b border-primary-blue/5 font-sans text-sm transition-colors hover:bg-blue-gray/30 ${
                      active ? "bg-blue-gray/40" : "bg-white"
                    }`}
                    onClick={() => setSelectedId(order.id)}
                  >
                    <td className="px-5 py-3">
                      <p className="font-semibold text-primary-blue">
                        {order.orderNumber}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {formatWhen(order.createdAt)}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-primary-blue">
                      {order.customerName}
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {order.customerPhone}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {order.customerEmail || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${paymentBadgeClass(order.paymentStatus)}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-primary-blue">
                      {formatMinorAmount(order.totalAmount, order.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="w-full shrink-0 overflow-y-auto bg-blue-gray/15 lg:w-[22rem]">
        {selected ? (
          <div className="space-y-4 px-5 py-5">
            <div>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-blue/55">
                Order detail
              </p>
              <h2 className="mt-1 font-serif text-2xl font-light text-primary-blue">
                {selected.orderNumber}
              </h2>
              <p className="mt-1 font-sans text-xs text-muted-foreground">
                {formatWhen(selected.createdAt)} · {selected.status}
              </p>
            </div>
            <div className="space-y-1 font-sans text-sm text-primary-blue">
              <p>
                <span className="text-muted-foreground">Customer · </span>
                {selected.customerName}
              </p>
              <p>
                <span className="text-muted-foreground">Email · </span>
                {selected.customerEmail || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Phone · </span>
                {selected.customerPhone || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Ship to · </span>
                {[
                  selected.shippingAddress.line1,
                  selected.shippingAddress.city,
                  selected.shippingAddress.province,
                  selected.shippingAddress.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
            <ul className="divide-y divide-primary-blue/10 border border-primary-blue/10 bg-white">
              {selected.items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between gap-3 px-3 py-2.5 font-sans text-xs"
                >
                  <span>
                    {item.title} × {item.quantity}
                    <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                      {item.sku}
                    </span>
                  </span>
                  <span className="tabular-nums">
                    {formatMinorAmount(item.totalAmount, item.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-right font-sans text-sm font-bold text-primary-blue">
              Total{" "}
              {formatMinorAmount(selected.totalAmount, selected.currency)}
            </p>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center px-6 py-10 text-center font-sans text-sm text-muted-foreground">
            Select an order to see customer email, phone, and line items.
          </div>
        )}
      </aside>
    </div>
  );
}
