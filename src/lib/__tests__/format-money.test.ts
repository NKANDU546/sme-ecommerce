import { formatMinorAmount } from "@/lib/format-money";

describe("formatMinorAmount", () => {
  it("formats ZAR minor units with R prefix", () => {
    expect(formatMinorAmount(15000, "ZAR")).toBe("R150.00");
  });

  it("formats NGN with naira prefix", () => {
    expect(formatMinorAmount(250050, "NGN")).toBe("₦2,500.50");
  });
});
