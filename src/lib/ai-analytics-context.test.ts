import { buildAnalyticsExplainContext } from "@/lib/ai-analytics-context";
import type { AnalyticsSummary } from "@/types/analytics";

function summary(partial: Partial<AnalyticsSummary>): AnalyticsSummary {
  return {
    revenuePaid: 0,
    ordersCount: 0,
    ordersPaidCount: 0,
    averageOrderValue: 0,
    productsPublished: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    currency: "ZAR",
    from: "2026-07-01",
    to: "2026-07-31",
    ...partial,
  };
}

describe("buildAnalyticsExplainContext", () => {
  it("computes prior deltas and top-product concentration", () => {
    const ctx = buildAnalyticsExplainContext({
      from: "2026-07-01",
      to: "2026-07-31",
      priorRange: { from: "2026-06-01", to: "2026-06-30" },
      summary: summary({
        revenuePaid: 20000,
        ordersPaidCount: 20,
        averageOrderValue: 1000,
        outOfStockCount: 2,
        lowStockCount: 1,
      }),
      priorSummary: summary({
        revenuePaid: 10000,
        ordersPaidCount: 10,
        averageOrderValue: 1000,
        from: "2026-06-01",
        to: "2026-06-30",
      }),
      breakdowns: {
        from: "2026-07-01",
        to: "2026-07-31",
        currency: "ZAR",
        ordersByStatus: [],
        ordersByPaymentStatus: [
          { key: "paid", count: 20 },
          { key: "unpaid", count: 5 },
          { key: "initialized", count: 5 },
        ],
        topProducts: [
          {
            productId: "1",
            title: "Kota Special",
            unitsSold: 40,
            revenue: 12000,
          },
          {
            productId: "2",
            title: "Cold drink",
            unitsSold: 30,
            revenue: 4000,
          },
        ],
        revenueByCategory: [
          { categoryId: "c1", name: "Food", revenue: 16000 },
        ],
      },
      timeseriesPoints: [
        { date: "2026-07-01", revenue: 100, orders: 1 },
        { date: "2026-07-02", revenue: 200, orders: 2 },
        { date: "2026-07-03", revenue: 800, orders: 4 },
        { date: "2026-07-04", revenue: 900, orders: 5 },
      ],
    });

    expect(ctx.derived.vsPrior.revenueDeltaPct).toBe(100);
    expect(ctx.derived.concentration.top1ShareOfPaidRevenuePct).toBe(60);
    expect(ctx.derived.checkout.leakPct).toBe(33.3);
    expect(ctx.derived.stock.outOfStock).toBe(2);
    expect(ctx.derived.trend.peakDay?.date).toBe("2026-07-04");
  });
});
