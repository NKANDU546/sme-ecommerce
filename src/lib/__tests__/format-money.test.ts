import { formatMajorAmount, formatMinorAmount } from "@/lib/format-money";

describe("formatMinorAmount", () => {
  it("formats ZAR minor units with R prefix", () => {
    expect(formatMinorAmount(15000, "ZAR")).toBe("R150.00");
  });

  it("formats NGN with naira prefix", () => {
    expect(formatMinorAmount(250050, "NGN")).toBe("₦2,500.50");
  });
});

describe("formatMajorAmount", () => {
  it("formats ZAR major units without dividing", () => {
    expect(formatMajorAmount(12500, "ZAR")).toBe("R12,500.00");
  });
});
