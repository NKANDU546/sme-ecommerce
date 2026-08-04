import type { AnalyticsTimeseriesPoint } from "@/types/analytics";
import { parseIsoDate, toIsoDate } from "@/lib/iso-date";

export type AnalyticsGrain = "day" | "week" | "month";

export { parseIsoDate, toIsoDate };

export function rangeForPreset(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);
  from.setDate(to.getDate() - (days - 1));
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

/** Inclusive previous window of the same length as [from, to]. */
export function previousRange(
  from: string,
  to: string,
): { from: string; to: string } | null {
  const start = parseIsoDate(from);
  const end = parseIsoDate(to);
  if (!start || !end || end < start) return null;
  const days =
    Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevEnd.getDate() - (days - 1));
  return { from: toIsoDate(prevStart), to: toIsoDate(prevEnd) };
}

/** Percent change; null if previous is 0 and current is also 0. */
export function percentChange(
  current: number,
  previous: number,
): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  if (previous === 0) {
    if (current === 0) return 0;
    return null; // new / infinite — UI shows "new"
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

function startOfIsoWeek(d: Date): Date {
  const copy = new Date(d);
  const day = (copy.getDay() + 6) % 7; // Mon=0
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function bucketKey(iso: string, grain: AnalyticsGrain): string {
  const d = parseIsoDate(iso);
  if (!d) return iso;
  if (grain === "day") return toIsoDate(d);
  if (grain === "week") return toIsoDate(startOfIsoWeek(d));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

/** Aggregate daily paid points into week/month buckets (FE-side). */
export function aggregateTimeseries(
  points: AnalyticsTimeseriesPoint[],
  grain: AnalyticsGrain,
): AnalyticsTimeseriesPoint[] {
  if (grain === "day") return points;
  const map = new Map<string, AnalyticsTimeseriesPoint>();
  for (const p of points) {
    const key = bucketKey(p.date, grain);
    const existing = map.get(key);
    if (existing) {
      existing.revenue += p.revenue;
      existing.orders += p.orders;
    } else {
      map.set(key, { date: key, revenue: p.revenue, orders: p.orders });
    }
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}
