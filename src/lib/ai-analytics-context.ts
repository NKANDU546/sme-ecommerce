import { percentChange } from "@/lib/analytics-range";
import type {
  AnalyticsBreakdowns,
  AnalyticsSummary,
  AnalyticsTimeseriesPoint,
} from "@/types/analytics";

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function bucketCount(
  buckets: { key: string; count: number }[] | undefined,
  key: string,
): number {
  if (!buckets?.length) return 0;
  const match = buckets.find(
    (b) => b.key.toLowerCase() === key.toLowerCase(),
  );
  return match?.count ?? 0;
}

function sharePct(part: number, whole: number): number | null {
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole <= 0) {
    return null;
  }
  return round1((part / whole) * 100);
}

/** Pre-compute comparisons so the model reasons, not restates raw KPIs. */
export function buildAnalyticsExplainContext(input: {
  from: string;
  to: string;
  priorRange: { from: string; to: string } | null;
  summary: AnalyticsSummary;
  priorSummary: AnalyticsSummary | null;
  breakdowns: AnalyticsBreakdowns | null;
  timeseriesPoints: AnalyticsTimeseriesPoint[] | null;
}) {
  const { summary, priorSummary, breakdowns } = input;
  const currency = summary.currency || "ZAR";

  const revenueDeltaPct = priorSummary
    ? percentChange(summary.revenuePaid, priorSummary.revenuePaid)
    : null;
  const ordersPaidDeltaPct = priorSummary
    ? percentChange(summary.ordersPaidCount, priorSummary.ordersPaidCount)
    : null;
  const aovDeltaPct = priorSummary
    ? percentChange(summary.averageOrderValue, priorSummary.averageOrderValue)
    : null;

  const paid = bucketCount(breakdowns?.ordersByPaymentStatus, "paid");
  const unpaid = bucketCount(breakdowns?.ordersByPaymentStatus, "unpaid");
  const initialized = bucketCount(
    breakdowns?.ordersByPaymentStatus,
    "initialized",
  );
  const failed = bucketCount(breakdowns?.ordersByPaymentStatus, "failed");
  const paymentDenom = paid + unpaid + initialized + failed;
  const unpaidOrStuck = unpaid + initialized + failed;
  const checkoutLeakPct = sharePct(unpaidOrStuck, paymentDenom);

  const topProducts = (breakdowns?.topProducts ?? []).slice(0, 5);
  const top1 = topProducts[0] ?? null;
  const top1ShareOfPaidRevenue = top1
    ? sharePct(top1.revenue, summary.revenuePaid)
    : null;
  const top3Revenue = topProducts
    .slice(0, 3)
    .reduce((sum, p) => sum + p.revenue, 0);
  const top3ShareOfPaidRevenue = sharePct(top3Revenue, summary.revenuePaid);

  const categories = (breakdowns?.revenueByCategory ?? []).slice(0, 5);
  const topCategory = categories[0] ?? null;
  const topCategoryShare = topCategory
    ? sharePct(topCategory.revenue, summary.revenuePaid)
    : null;

  const points = input.timeseriesPoints ?? [];
  const activeDays = points.filter((p) => p.revenue > 0 || p.orders > 0);
  let peakDay: { date: string; revenue: number; orders: number } | null = null;
  for (const p of points) {
    if (!peakDay || p.revenue > peakDay.revenue) {
      peakDay = { date: p.date, revenue: p.revenue, orders: p.orders };
    }
  }

  // Simple half-vs-half trend inside the window
  let recentHalfVsEarlyHalfPct: number | null = null;
  if (points.length >= 4) {
    const mid = Math.floor(points.length / 2);
    const early = points.slice(0, mid).reduce((s, p) => s + p.revenue, 0);
    const late = points.slice(mid).reduce((s, p) => s + p.revenue, 0);
    recentHalfVsEarlyHalfPct = percentChange(late, early);
  }

  const stockPressure =
    summary.outOfStockCount > 0 || summary.lowStockCount > 0
      ? {
          outOfStock: summary.outOfStockCount,
          lowStock: summary.lowStockCount,
          published: summary.productsPublished,
        }
      : { outOfStock: 0, lowStock: 0, published: summary.productsPublished };

  return {
    range: { from: input.from, to: input.to },
    priorRange: input.priorRange,
    currency,
    /** Prefer these derived fields over re-reading raw summary. */
    derived: {
      revenuePaid: summary.revenuePaid,
      ordersPaidCount: summary.ordersPaidCount,
      ordersCount: summary.ordersCount,
      averageOrderValue: summary.averageOrderValue,
      vsPrior: {
        revenueDeltaPct:
          revenueDeltaPct == null ? null : round1(revenueDeltaPct),
        ordersPaidDeltaPct:
          ordersPaidDeltaPct == null ? null : round1(ordersPaidDeltaPct),
        aovDeltaPct: aovDeltaPct == null ? null : round1(aovDeltaPct),
        priorRevenuePaid: priorSummary?.revenuePaid ?? null,
        priorOrdersPaidCount: priorSummary?.ordersPaidCount ?? null,
        priorAov: priorSummary?.averageOrderValue ?? null,
      },
      checkout: {
        paid,
        unpaid,
        initialized,
        failed,
        leakPct: checkoutLeakPct,
      },
      concentration: {
        topProductTitle: top1?.title ?? null,
        topProductRevenue: top1?.revenue ?? null,
        topProductUnits: top1?.unitsSold ?? null,
        top1ShareOfPaidRevenuePct: top1ShareOfPaidRevenue,
        top3ShareOfPaidRevenuePct: top3ShareOfPaidRevenue,
        topCategoryName: topCategory?.name ?? null,
        topCategorySharePct: topCategoryShare,
      },
      stock: stockPressure,
      trend: {
        daysWithSales: activeDays.length,
        daysInRange: points.length || null,
        peakDay,
        recentHalfVsEarlyHalfRevenuePct:
          recentHalfVsEarlyHalfPct == null
            ? null
            : round1(recentHalfVsEarlyHalfPct),
      },
      topProducts,
      topCategories: categories,
    },
  };
}

export type AnalyticsExplainContext = ReturnType<
  typeof buildAnalyticsExplainContext
>;
