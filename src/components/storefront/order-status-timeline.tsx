"use client";

import type { Order } from "@/types/cart";
import { buildOrderTimeline } from "@/lib/order-status";

type OrderStatusTimelineProps = {
  order: Order;
};

export function OrderStatusTimeline({ order }: OrderStatusTimelineProps) {
  const steps = buildOrderTimeline(order);

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const dotClass =
          step.state === "complete"
            ? "bg-[color:var(--sf-accent)]"
            : step.state === "current"
              ? "bg-[color:var(--sf-accent)] ring-4 ring-[color:var(--sf-accent)]/15"
              : step.state === "cancelled"
                ? "bg-red-700"
                : "bg-[color:var(--sf-accent-border-25)]";
        const labelClass =
          step.state === "upcoming"
            ? "text-[color:var(--sf-accent-text-45)]"
            : step.state === "cancelled"
              ? "text-red-800"
              : "text-[color:var(--sf-accent)]";

        return (
          <li key={step.id} className="flex gap-4">
            <div className="flex w-5 flex-col items-center">
              <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${dotClass}`} />
              {!isLast ? (
                <span
                  className={`mt-1 w-px flex-1 ${
                    step.state === "complete"
                      ? "bg-[color:var(--sf-accent)]/35"
                      : "bg-[color:var(--sf-accent-border-15)]"
                  }`}
                  aria-hidden
                />
              ) : null}
            </div>
            <div className={`min-w-0 pb-8 ${isLast ? "pb-0" : ""}`}>
              <p
                className={`font-sans text-sm font-semibold ${labelClass}`}
              >
                {step.label}
              </p>
              {step.description ? (
                <p className="mt-1 font-sans text-xs leading-relaxed text-[color:var(--sf-accent-text-55)]">
                  {step.description}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
