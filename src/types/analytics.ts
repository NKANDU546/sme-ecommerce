/** Merchant analytics DTOs — money is major units (e.g. 125.00), not cents. */

export type AnalyticsRangeParams = {
  from?: string;
  to?: string;
};

export type AnalyticsTimeseriesParams = AnalyticsRangeParams & {
  /** Backend v1 accepts day; FE may aggregate week/month client-side. */
  grain?: "day" | "week" | "month";
};

export type AnalyticsSummary = {
  revenuePaid: number;
  ordersCount: number;
  ordersPaidCount: number;
  averageOrderValue: number;
  productsPublished: number;
  lowStockCount: number;
  outOfStockCount: number;
  currency: string;
  from: string;
  to: string;
};

export type AnalyticsTimeseriesPoint = {
  date: string;
  revenue: number;
  orders: number;
};

export type AnalyticsTimeseries = {
  grain: string;
  from: string;
  to: string;
  currency: string;
  points: AnalyticsTimeseriesPoint[];
};

export type AnalyticsCountBucket = {
  key: string;
  count: number;
};

export type AnalyticsTopProduct = {
  productId: string | null;
  title: string;
  unitsSold: number;
  revenue: number;
};

export type AnalyticsCategoryRevenue = {
  categoryId: string | null;
  name: string;
  revenue: number;
};

export type AnalyticsBreakdowns = {
  from: string;
  to: string;
  currency: string;
  ordersByStatus: AnalyticsCountBucket[];
  ordersByPaymentStatus: AnalyticsCountBucket[];
  topProducts: AnalyticsTopProduct[];
  revenueByCategory: AnalyticsCategoryRevenue[];
};
