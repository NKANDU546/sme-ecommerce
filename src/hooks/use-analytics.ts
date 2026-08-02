"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAnalyticsBreakdowns,
  getAnalyticsSummary,
  getAnalyticsTimeseries,
} from "@/apis/analytics";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import type {
  AnalyticsRangeParams,
  AnalyticsTimeseriesParams,
} from "@/types/analytics";

export const analyticsKeys = {
  all: (workspaceId: string) => ["analytics", workspaceId] as const,
  summary: (workspaceId: string, params: AnalyticsRangeParams) =>
    ["analytics", workspaceId, "summary", params.from ?? "", params.to ?? ""] as const,
  timeseries: (workspaceId: string, params: AnalyticsTimeseriesParams) =>
    [
      "analytics",
      workspaceId,
      "timeseries",
      params.from ?? "",
      params.to ?? "",
      params.grain ?? "day",
    ] as const,
  breakdowns: (workspaceId: string, params: AnalyticsRangeParams) =>
    [
      "analytics",
      workspaceId,
      "breakdowns",
      params.from ?? "",
      params.to ?? "",
    ] as const,
};

function requireAccessToken(): string {
  const session = getStoredAuthSession();
  if (!session?.accessToken) {
    throw new Error("Sign in to view analytics.");
  }
  return session.accessToken;
}

export function useAnalyticsSummary(
  workspaceId: string,
  params: AnalyticsRangeParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: analyticsKeys.summary(workspaceId, params),
    enabled: enabled && Boolean(workspaceId),
    queryFn: async () => {
      const result = await getAnalyticsSummary(
        workspaceId,
        requireAccessToken(),
        params,
      );
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
  });
}

export function useAnalyticsTimeseries(
  workspaceId: string,
  params: AnalyticsTimeseriesParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: analyticsKeys.timeseries(workspaceId, params),
    enabled: enabled && Boolean(workspaceId),
    queryFn: async () => {
      const result = await getAnalyticsTimeseries(
        workspaceId,
        requireAccessToken(),
        params,
      );
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
  });
}

export function useAnalyticsBreakdowns(
  workspaceId: string,
  params: AnalyticsRangeParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: analyticsKeys.breakdowns(workspaceId, params),
    enabled: enabled && Boolean(workspaceId),
    queryFn: async () => {
      const result = await getAnalyticsBreakdowns(
        workspaceId,
        requireAccessToken(),
        params,
      );
      if (!result.ok) throw new Error(result.errorMessage);
      return result.data;
    },
  });
}
