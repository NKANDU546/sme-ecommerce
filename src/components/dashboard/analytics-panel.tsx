"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { motion } from "framer-motion";
import {
  useAnalyticsBreakdowns,
  useAnalyticsSummary,
  useAnalyticsTimeseries,
} from "@/hooks/use-analytics";
import { useProducts } from "@/hooks/use-products";
import { formatMajorAmount } from "@/lib/format-money";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import {
  aggregateTimeseries,
  percentChange,
  previousRange,
  rangeForPreset,
  type AnalyticsGrain,
} from "@/lib/analytics-range";
import {
  orderStatusLabel,
  paymentStatusLabel,
} from "@/lib/order-status";
import type { OrderStatus, PaymentStatus } from "@/types/cart";
import type {
  AnalyticsCountBucket,
  AnalyticsTimeseriesPoint,
} from "@/types/analytics";
import type { ProductApi } from "@/types/product";
import { DatePicker } from "@/components/ui/date-picker";

type AnalyticsPanelProps = {
  workspaceId: string;
  /** Overview = KPIs + revenue chart + stock; full adds breakdowns. */
  variant?: "overview" | "full";
};

type RangePreset = 7 | 30 | 90;

function formatShortDate(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function statusLabel(key: string): string {
  return orderStatusLabel(key as OrderStatus);
}

function paymentLabel(key: string): string {
  return paymentStatusLabel(key as PaymentStatus);
}

function formatDelta(pct: number | null): {
  text: string;
  tone: "up" | "down" | "flat";
} | null {
  if (pct == null) return null;
  if (Math.abs(pct) < 0.05) return { text: "Flat vs prior", tone: "flat" };
  const rounded = Math.abs(pct) >= 10 ? pct.toFixed(0) : pct.toFixed(1);
  if (pct > 0) return { text: `↑ ${rounded}% vs prior`, tone: "up" };
  return { text: `↓ ${rounded}% vs prior`, tone: "down" };
}

const CHART_COLORS = [
  "#1e3a5f",
  "#3d7ea6",
  "#c4a574",
  "#5c8a6e",
  "#b85c38",
  "#6b7280",
];

function RevenueLineChart({
  points,
  currency,
}: {
  points: AnalyticsTimeseriesPoint[];
  currency: string;
}) {
  const gradId = useId();
  const width = 640;
  const height = 220;
  const padX = 12;
  const padTop = 16;
  const padBottom = 28;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;
  const maxRevenue = Math.max(...points.map((p) => p.revenue), 0);
  const yMax = maxRevenue > 0 ? maxRevenue * 1.08 : 1;

  if (points.length === 0) {
    return (
      <p className="py-16 text-center font-sans text-sm text-muted-foreground">
        No paid orders in this range yet.
      </p>
    );
  }

  const coords = points.map((p, i) => {
    const x =
      points.length === 1
        ? padX + innerW / 2
        : padX + (i / (points.length - 1)) * innerW;
    const y = padTop + innerH - (p.revenue / yMax) * innerH;
    return { x, y, ...p };
  });

  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L ${coords[coords.length - 1]!.x.toFixed(1)} ${(padTop + innerH).toFixed(1)} L ${coords[0]!.x.toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`;

  const labelIdx =
    points.length <= 7
      ? points.map((_, i) => i)
      : [0, Math.floor((points.length - 1) / 2), points.length - 1];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full min-w-[280px]"
        role="img"
        aria-label="Paid revenue over time"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#1e3a5f" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((t) => {
          const y = padTop + innerH * (1 - t);
          return (
            <line
              key={t}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="currentColor"
              className="text-primary-blue/10"
              strokeWidth={1}
            />
          );
        })}
        <path d={area} fill={`url(#${gradId})`} />
        <path
          d={line}
          fill="none"
          stroke="#1e3a5f"
          strokeWidth={2.25}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coords.map((c) => (
          <circle
            key={c.date}
            cx={c.x}
            cy={c.y}
            r={points.length > 40 ? 0 : 3}
            fill="#1e3a5f"
          >
            <title>{`${formatShortDate(c.date)}: ${formatMajorAmount(c.revenue, currency)} · ${c.orders} orders`}</title>
          </circle>
        ))}
        {labelIdx.map((i) => {
          const c = coords[i]!;
          return (
            <text
              key={`lbl-${c.date}`}
              x={c.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-muted-foreground font-sans"
              style={{ fontSize: 11 }}
            >
              {formatShortDate(c.date)}
            </text>
          );
        })}
      </svg>
      <p className="mt-1 font-sans text-xs text-muted-foreground">
        Peak{" "}
        {formatMajorAmount(maxRevenue, currency)}
        {maxRevenue === 0 ? " — waiting on paid orders" : null}
      </p>
    </div>
  );
}

function DonutChart({
  buckets,
  labelFor,
  emptyLabel,
}: {
  buckets: AnalyticsCountBucket[];
  labelFor: (key: string) => string;
  emptyLabel: string;
}) {
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  const size = 148;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  if (total === 0) {
    return (
      <p className="py-10 text-center font-sans text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }

  let offset = 0;
  const segments = buckets
    .filter((b) => b.count > 0)
    .map((b, i) => {
      const len = (b.count / total) * c;
      const seg = {
        ...b,
        color: CHART_COLORS[i % CHART_COLORS.length]!,
        dash: `${len} ${c - len}`,
        offset,
      };
      offset += len;
      return seg;
    });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
        role="img"
        aria-label="Distribution chart"
      >
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {segments.map((s) => (
            <circle
              key={s.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={s.dash}
              strokeDashoffset={-s.offset}
            />
          ))}
        </g>
        <text
          x={size / 2}
          y={size / 2 - 6}
          textAnchor="middle"
          className="fill-primary-blue font-serif"
          style={{ fontSize: 22 }}
        >
          {total}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 14}
          textAnchor="middle"
          className="fill-muted-foreground font-sans"
          style={{ fontSize: 11 }}
        >
          orders
        </text>
      </svg>
      <ul className="w-full space-y-2 font-sans text-sm">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: s.color }}
              />
              <span className="truncate text-primary-blue/85">
                {labelFor(s.key)}
              </span>
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {s.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BarList({
  rows,
  currency,
}: {
  rows: Array<{ id: string; label: string; value: number; meta?: string }>;
  currency: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 0);
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center font-sans text-sm text-muted-foreground">
        Nothing to show yet.
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const pct = max > 0 ? (row.value / max) * 100 : 0;
        return (
          <li key={row.id}>
            <div className="mb-1 flex items-baseline justify-between gap-3 font-sans text-sm">
              <span className="min-w-0 truncate text-primary-blue">
                {row.label}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {formatMajorAmount(row.value, currency)}
                {row.meta ? (
                  <span className="ml-2 text-xs opacity-70">{row.meta}</span>
                ) : null}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-primary-blue/8">
              <div
                className="h-full rounded-full bg-primary-blue/70 transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function KpiCard({
  label,
  value,
  hint,
  delta,
  delay = 0,
  tone = "slate",
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: ReturnType<typeof formatDelta> | null;
  delay?: number;
  tone?: "slate" | "mint" | "sky" | "sand" | "rose";
}) {
  const deltaClass =
    delta?.tone === "up"
      ? "text-emerald-800"
      : delta?.tone === "down"
        ? "text-red-800"
        : "text-primary-blue/55";

  const toneClass =
    tone === "mint"
      ? "border-emerald-700/15 bg-emerald-50"
      : tone === "sky"
        ? "border-sky-700/15 bg-sky-50"
        : tone === "sand"
          ? "border-amber-700/15 bg-amber-50"
          : tone === "rose"
            ? "border-rose-700/15 bg-rose-50"
            : "border-primary-blue/10 bg-blue-gray/50";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={`border px-4 py-4 ${toneClass}`}
    >
      <p className="font-sans text-xs font-medium uppercase tracking-wide text-primary-blue/55">
        {label}
      </p>
      <p className="mt-2 font-serif text-2xl font-light tabular-nums text-primary-blue sm:text-[1.7rem]">
        {value}
      </p>
      {delta ? (
        <p className={`mt-1 font-sans text-xs font-medium ${deltaClass}`}>
          {delta.text}
        </p>
      ) : null}
      {hint ? (
        <p className="mt-1 font-sans text-xs text-primary-blue/50">{hint}</p>
      ) : null}
    </motion.div>
  );
}

function stockQty(p: ProductApi): number {
  return Math.max(0, Math.floor(Number(p.quantityAvailable ?? 0)));
}

function StockAlerts({
  workspaceId,
  accessToken,
}: {
  workspaceId: string;
  accessToken: string | null;
}) {
  const productsQuery = useProducts(workspaceId, accessToken, {
    status: "active",
    page: 0,
    limit: 100,
  });
  const items = productsQuery.data?.items ?? [];
  const out = items.filter((p) => stockQty(p) === 0);
  const low = items.filter((q) => {
    const n = stockQty(q);
    return n >= 1 && n <= 5;
  });

  if (productsQuery.isLoading) {
    return <div className="h-28 animate-pulse bg-primary-blue/5" />;
  }

  if (out.length === 0 && low.length === 0) {
    return (
      <p className="py-6 font-sans text-sm text-muted-foreground">
        No low or sold-out products right now.
      </p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <p className="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-red-900/70">
          Sold out ({out.length})
        </p>
        <ul className="space-y-1.5">
          {out.slice(0, 8).map((p) => (
            <li
              key={p.id}
              className="flex justify-between gap-3 border-b border-red-100/80 py-1.5 font-sans text-sm last:border-0"
            >
              <span className="truncate text-primary-blue">{p.title}</span>
              <span className="shrink-0 tabular-nums text-red-800">0</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-2 font-sans text-xs font-medium uppercase tracking-wide text-amber-900/70">
          Low stock 1–5 ({low.length})
        </p>
        <ul className="space-y-1.5">
          {low.slice(0, 8).map((p) => (
            <li
              key={p.id}
              className="flex justify-between gap-3 border-b border-amber-100/80 py-1.5 font-sans text-sm last:border-0"
            >
              <span className="truncate text-primary-blue">{p.title}</span>
              <span className="shrink-0 tabular-nums text-amber-900">
                {stockQty(p)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AnalyticsPanel({
  workspaceId,
  variant = "full",
}: AnalyticsPanelProps) {
  const [signedIn, setSignedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [preset, setPreset] = useState<RangePreset | null>(30);
  const [from, setFrom] = useState(() => rangeForPreset(30).from);
  const [to, setTo] = useState(() => rangeForPreset(30).to);
  const [grain, setGrain] = useState<AnalyticsGrain>("day");

  const range = { from, to };
  const prior = previousRange(from, to);

  useEffect(() => {
    const token = getStoredAuthSession()?.accessToken ?? null;
    setAccessToken(token);
    setSignedIn(Boolean(token));
    setAuthReady(true);
  }, []);

  const enabled = signedIn && Boolean(workspaceId);
  const summaryQuery = useAnalyticsSummary(workspaceId, range, enabled);
  const priorSummaryQuery = useAnalyticsSummary(
    workspaceId,
    prior ?? {},
    enabled && Boolean(prior),
  );
  const seriesQuery = useAnalyticsTimeseries(
    workspaceId,
    { ...range, grain: "day" },
    enabled,
  );
  const breakdownsQuery = useAnalyticsBreakdowns(
    workspaceId,
    range,
    enabled && variant === "full",
  );

  const summary = summaryQuery.data;
  const priorSummary = priorSummaryQuery.data;
  const currency = summary?.currency ?? "ZAR";
  const chartPoints = aggregateTimeseries(
    seriesQuery.data?.points ?? [],
    grain,
  );

  const loading =
    !authReady ||
    (enabled &&
      (summaryQuery.isLoading ||
        seriesQuery.isLoading ||
        (variant === "full" && breakdownsQuery.isLoading)));
  const error =
    summaryQuery.error ??
    seriesQuery.error ??
    (variant === "full" ? breakdownsQuery.error : null);

  function applyPreset(days: RangePreset) {
    const next = rangeForPreset(days);
    setPreset(days);
    setFrom(next.from);
    setTo(next.to);
  }

  function onFromChange(value: string) {
    setPreset(null);
    setFrom(value);
  }

  function onToChange(value: string) {
    setPreset(null);
    setTo(value);
  }

  if (authReady && !signedIn) {
    return (
      <div className="px-5 py-12 sm:px-8">
        <p className="font-sans text-sm text-muted-foreground">
          Sign in to view analytics for this workspace.
        </p>
      </div>
    );
  }

  const revenueDelta = priorSummary
    ? formatDelta(
        percentChange(summary?.revenuePaid ?? 0, priorSummary.revenuePaid),
      )
    : null;
  const ordersDelta = priorSummary
    ? formatDelta(
        percentChange(summary?.ordersCount ?? 0, priorSummary.ordersCount),
      )
    : null;
  const aovDelta = priorSummary
    ? formatDelta(
        percentChange(
          summary?.averageOrderValue ?? 0,
          priorSummary.averageOrderValue,
        ),
      )
    : null;

  const grainHint =
    grain === "day" ? "Daily" : grain === "week" ? "Weekly" : "Monthly";

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,hsl(var(--background))_0%,#fff_42%)]">
      <div className="flex w-full flex-col gap-8 px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-sans text-sm text-muted-foreground">
              {formatShortDate(from)} – {formatShortDate(to)}
              {prior ? (
                <>
                  <span className="mx-2 text-primary-blue/20">·</span>
                  vs {formatShortDate(prior.from)} –{" "}
                  {formatShortDate(prior.to)}
                </>
              ) : null}
            </p>
            <p className="mt-0.5 font-sans text-xs text-muted-foreground">
              Paid revenue uses payment status Paid · stock is a live snapshot
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 font-sans text-xs text-muted-foreground">
              From
              <DatePicker
                value={from}
                max={to}
                onChange={onFromChange}
                placeholder="From date"
              />
            </label>
            <label className="flex flex-col gap-1 font-sans text-xs text-muted-foreground">
              To
              <DatePicker
                value={to}
                min={from}
                onChange={onToChange}
                placeholder="To date"
              />
            </label>
            <div
              className="inline-flex border border-primary-blue/15 bg-white p-0.5"
              role="group"
              aria-label="Date range preset"
            >
              {([7, 30, 90] as const).map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => applyPreset(days)}
                  className={
                    preset === days
                      ? "bg-primary-blue px-3 py-1.5 font-sans text-xs font-semibold text-white"
                      : "px-3 py-1.5 font-sans text-xs font-medium text-primary-blue/70 hover:bg-blue-gray/30"
                  }
                >
                  {days}d
                </button>
              ))}
            </div>
            <div
              className="inline-flex border border-primary-blue/15 bg-white p-0.5"
              role="group"
              aria-label="Chart grain"
            >
              {(["day", "week", "month"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrain(g)}
                  className={
                    grain === g
                      ? "bg-primary-blue px-3 py-1.5 font-sans text-xs font-semibold capitalize text-white"
                      : "px-3 py-1.5 font-sans text-xs font-medium capitalize text-primary-blue/70 hover:bg-blue-gray/30"
                  }
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error ? (
          <div className="border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-800">
            {(error as Error).message || "Analytics could not be loaded."}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse border border-primary-blue/10 bg-blue-gray/40"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Paid revenue"
              value={formatMajorAmount(summary?.revenuePaid ?? 0, currency)}
              hint={`${summary?.ordersPaidCount ?? 0} paid orders`}
              delta={revenueDelta}
              tone="mint"
              delay={0}
            />
            <KpiCard
              label="Orders"
              value={String(summary?.ordersCount ?? 0)}
              hint={`${summary?.ordersPaidCount ?? 0} paid in range`}
              delta={ordersDelta}
              tone="sky"
              delay={0.05}
            />
            <KpiCard
              label="Avg. order value"
              value={formatMajorAmount(
                summary?.averageOrderValue ?? 0,
                currency,
              )}
              hint="Paid orders only"
              delta={aovDelta}
              tone="sand"
              delay={0.1}
            />
            <KpiCard
              label="Catalog health"
              value={`${summary?.productsPublished ?? 0} live`}
              hint={`${summary?.lowStockCount ?? 0} low · ${summary?.outOfStockCount ?? 0} sold out`}
              tone="rose"
              delay={0.15}
            />
          </div>
        )}

        <section className="border border-primary-blue/10 bg-blue-gray/35 px-4 py-5 sm:px-6 sm:py-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-serif text-lg font-light text-primary-blue">
                Revenue
              </h2>
              <p className="mt-0.5 font-sans text-sm text-muted-foreground">
                {grainHint} paid totals
                {grain !== "day" ? " (aggregated from daily API)" : null}
              </p>
            </div>
          </div>
          {seriesQuery.isLoading ? (
            <div className="h-52 animate-pulse bg-primary-blue/5" />
          ) : (
            <RevenueLineChart
              points={chartPoints}
              currency={seriesQuery.data?.currency ?? currency}
            />
          )}
        </section>

        <section className="border border-primary-blue/10 bg-blue-gray/35 px-4 py-5 sm:px-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-serif text-lg font-light text-primary-blue">
                Stock alerts
              </h2>
              <p className="mt-0.5 font-sans text-sm text-muted-foreground">
                Live catalog — low stock is quantity 1–5
              </p>
            </div>
            <Link
              href={`/dashboard/${workspaceId}?section=inventory`}
              className="font-sans text-sm font-medium text-primary-blue underline decoration-primary-blue/30 underline-offset-4 hover:decoration-primary-blue"
            >
              Open inventory
            </Link>
          </div>
          <StockAlerts workspaceId={workspaceId} accessToken={accessToken} />
        </section>

        {variant === "full" ? (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="border border-primary-blue/10 bg-sky-50/80 px-4 py-5 sm:px-5">
                <h2 className="font-serif text-lg font-light text-primary-blue">
                  Order status
                </h2>
                <p className="mb-4 mt-0.5 font-sans text-sm text-muted-foreground">
                  Fulfilment mix in range
                </p>
                {breakdownsQuery.isLoading ? (
                  <div className="h-36 animate-pulse bg-primary-blue/5" />
                ) : (
                  <DonutChart
                    buckets={breakdownsQuery.data?.ordersByStatus ?? []}
                    labelFor={statusLabel}
                    emptyLabel="No orders in this range."
                  />
                )}
              </section>
              <section className="border border-primary-blue/10 bg-emerald-50/80 px-4 py-5 sm:px-5">
                <h2 className="font-serif text-lg font-light text-primary-blue">
                  Payment status
                </h2>
                <p className="mb-4 mt-0.5 font-sans text-sm text-muted-foreground">
                  How payments landed
                </p>
                {breakdownsQuery.isLoading ? (
                  <div className="h-36 animate-pulse bg-primary-blue/5" />
                ) : (
                  <DonutChart
                    buckets={breakdownsQuery.data?.ordersByPaymentStatus ?? []}
                    labelFor={paymentLabel}
                    emptyLabel="No payments in this range."
                  />
                )}
              </section>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="border border-primary-blue/10 bg-amber-50/80 px-4 py-5 sm:px-5">
                <h2 className="font-serif text-lg font-light text-primary-blue">
                  Top products
                </h2>
                <p className="mb-4 mt-0.5 font-sans text-sm text-muted-foreground">
                  Paid units and revenue
                </p>
                <BarList
                  currency={breakdownsQuery.data?.currency ?? currency}
                  rows={(breakdownsQuery.data?.topProducts ?? []).map((p) => ({
                    id: p.productId ?? p.title,
                    label: p.title || "Untitled",
                    value: p.revenue,
                    meta: `${p.unitsSold} sold`,
                  }))}
                />
              </section>
              <section className="border border-primary-blue/10 bg-rose-50/70 px-4 py-5 sm:px-5">
                <h2 className="font-serif text-lg font-light text-primary-blue">
                  Revenue by category
                </h2>
                <p className="mb-4 mt-0.5 font-sans text-sm text-muted-foreground">
                  Paid sales rolled up by category
                </p>
                <BarList
                  currency={breakdownsQuery.data?.currency ?? currency}
                  rows={(breakdownsQuery.data?.revenueByCategory ?? []).map(
                    (c) => ({
                      id: c.categoryId ?? c.name,
                      label: c.name || "Uncategorised",
                      value: c.revenue,
                    }),
                  )}
                />
              </section>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
