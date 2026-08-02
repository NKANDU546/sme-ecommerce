import { getSmeApiBaseUrl } from "@/apis/config";
import { networkFailure, parseApiEnvelope } from "@/apis/api-result";
import type { ParsedApiFailure } from "@/apis/api-result";
import type {
  AnalyticsBreakdowns,
  AnalyticsCountBucket,
  AnalyticsCategoryRevenue,
  AnalyticsRangeParams,
  AnalyticsSummary,
  AnalyticsTimeseries,
  AnalyticsTimeseriesParams,
  AnalyticsTimeseriesPoint,
  AnalyticsTopProduct,
} from "@/types/analytics";

export type AnalyticsSummaryResult =
  | { ok: true; data: AnalyticsSummary }
  | ParsedApiFailure;

export type AnalyticsTimeseriesResult =
  | { ok: true; data: AnalyticsTimeseries }
  | ParsedApiFailure;

export type AnalyticsBreakdownsResult =
  | { ok: true; data: AnalyticsBreakdowns }
  | ParsedApiFailure;

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  };
}

function appendRange(qs: URLSearchParams, params: AnalyticsRangeParams) {
  if (params.from?.trim()) qs.set("from", params.from.trim());
  if (params.to?.trim()) qs.set("to", params.to.trim());
}

function asNumber(raw: unknown, fallback = 0): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function asString(raw: unknown, fallback = ""): string {
  return raw == null ? fallback : String(raw);
}

function asNullableString(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  return String(raw);
}

function asSummary(raw: AnalyticsSummary): AnalyticsSummary {
  return {
    revenuePaid: asNumber(raw.revenuePaid),
    ordersCount: asNumber(raw.ordersCount),
    ordersPaidCount: asNumber(raw.ordersPaidCount),
    averageOrderValue: asNumber(raw.averageOrderValue),
    productsPublished: asNumber(raw.productsPublished),
    lowStockCount: asNumber(raw.lowStockCount),
    outOfStockCount: asNumber(raw.outOfStockCount),
    currency: asString(raw.currency, "ZAR"),
    from: asString(raw.from),
    to: asString(raw.to),
  };
}

function asPoint(raw: AnalyticsTimeseriesPoint): AnalyticsTimeseriesPoint {
  return {
    date: asString(raw.date),
    revenue: asNumber(raw.revenue),
    orders: asNumber(raw.orders),
  };
}

function asTimeseries(raw: AnalyticsTimeseries): AnalyticsTimeseries {
  return {
    grain: asString(raw.grain, "day"),
    from: asString(raw.from),
    to: asString(raw.to),
    currency: asString(raw.currency, "ZAR"),
    points: Array.isArray(raw.points) ? raw.points.map(asPoint) : [],
  };
}

function asBucket(raw: AnalyticsCountBucket): AnalyticsCountBucket {
  return {
    key: asString(raw.key),
    count: asNumber(raw.count),
  };
}

function asTopProduct(raw: AnalyticsTopProduct): AnalyticsTopProduct {
  return {
    productId: asNullableString(raw.productId),
    title: asString(raw.title),
    unitsSold: asNumber(raw.unitsSold),
    revenue: asNumber(raw.revenue),
  };
}

function asCategoryRevenue(
  raw: AnalyticsCategoryRevenue,
): AnalyticsCategoryRevenue {
  return {
    categoryId: asNullableString(raw.categoryId),
    name: asString(raw.name),
    revenue: asNumber(raw.revenue),
  };
}

function asBreakdowns(raw: AnalyticsBreakdowns): AnalyticsBreakdowns {
  return {
    from: asString(raw.from),
    to: asString(raw.to),
    currency: asString(raw.currency, "ZAR"),
    ordersByStatus: Array.isArray(raw.ordersByStatus)
      ? raw.ordersByStatus.map(asBucket)
      : [],
    ordersByPaymentStatus: Array.isArray(raw.ordersByPaymentStatus)
      ? raw.ordersByPaymentStatus.map(asBucket)
      : [],
    topProducts: Array.isArray(raw.topProducts)
      ? raw.topProducts.map(asTopProduct)
      : [],
    revenueByCategory: Array.isArray(raw.revenueByCategory)
      ? raw.revenueByCategory.map(asCategoryRevenue)
      : [],
  };
}

/** GET /workspaces/{workspaceId}/analytics/summary */
export async function getAnalyticsSummary(
  workspaceId: string,
  accessToken: string,
  params: AnalyticsRangeParams = {},
): Promise<AnalyticsSummaryResult> {
  const qs = new URLSearchParams();
  appendRange(qs, params);
  const query = qs.toString();
  const url = `${getSmeApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/analytics/summary${query ? `?${query}` : ""}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: authHeaders(accessToken),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not load analytics summary. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<AnalyticsSummary>(
    res,
    "Analytics summary could not be loaded.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asSummary(parsed.data) };
}

/** GET /workspaces/{workspaceId}/analytics/timeseries */
export async function getAnalyticsTimeseries(
  workspaceId: string,
  accessToken: string,
  params: AnalyticsTimeseriesParams = {},
): Promise<AnalyticsTimeseriesResult> {
  const qs = new URLSearchParams();
  appendRange(qs, params);
  qs.set("grain", "day");
  // Backend v1 fills daily zeros; week/month are aggregated on the client.
  const url = `${getSmeApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/analytics/timeseries?${qs}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: authHeaders(accessToken),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not load analytics timeseries. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<AnalyticsTimeseries>(
    res,
    "Analytics timeseries could not be loaded.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asTimeseries(parsed.data) };
}

/** GET /workspaces/{workspaceId}/analytics/breakdowns */
export async function getAnalyticsBreakdowns(
  workspaceId: string,
  accessToken: string,
  params: AnalyticsRangeParams = {},
): Promise<AnalyticsBreakdownsResult> {
  const qs = new URLSearchParams();
  appendRange(qs, params);
  const query = qs.toString();
  const url = `${getSmeApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/analytics/breakdowns${query ? `?${query}` : ""}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: authHeaders(accessToken),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not load analytics breakdowns. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<AnalyticsBreakdowns>(
    res,
    "Analytics breakdowns could not be loaded.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asBreakdowns(parsed.data) };
}
