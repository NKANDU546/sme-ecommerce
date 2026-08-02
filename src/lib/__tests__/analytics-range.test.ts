import {
  aggregateTimeseries,
  percentChange,
  previousRange,
  rangeForPreset,
  toIsoDate,
} from "@/lib/analytics-range";

describe("analytics-range", () => {
  it("builds inclusive preset ranges", () => {
    const fixed = new Date(2026, 6, 31); // Jul 31 2026
    jest.useFakeTimers();
    jest.setSystemTime(fixed);
    expect(rangeForPreset(7)).toEqual({ from: "2026-07-25", to: "2026-07-31" });
    jest.useRealTimers();
  });

  it("computes previous window of same length", () => {
    expect(previousRange("2026-07-02", "2026-07-31")).toEqual({
      from: "2026-06-02",
      to: "2026-07-01",
    });
  });

  it("computes percent change", () => {
    expect(percentChange(112, 100)).toBeCloseTo(12);
    expect(percentChange(0, 0)).toBe(0);
    expect(percentChange(50, 0)).toBeNull();
  });

  it("aggregates daily points to weeks", () => {
    const points = [
      { date: "2026-07-06", revenue: 100, orders: 1 }, // Mon
      { date: "2026-07-07", revenue: 50, orders: 1 },
      { date: "2026-07-13", revenue: 20, orders: 1 }, // next Mon
    ];
    expect(aggregateTimeseries(points, "week")).toEqual([
      { date: "2026-07-06", revenue: 150, orders: 2 },
      { date: "2026-07-13", revenue: 20, orders: 1 },
    ]);
  });

  it("exports toIsoDate", () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
