import {
  cartSubtotal,
  lineTotal,
  orderTotal,
} from "@/lib/cart-totals";

describe("cart totals (Step 06A contract)", () => {
  it("computes line total as unitPriceAmount * quantity", () => {
    expect(lineTotal(15000, 2)).toBe(30000);
    expect(lineTotal(999, 1)).toBe(999);
  });

  it("sums line totals into a cart subtotal", () => {
    const items = [
      { unitPriceAmount: 15000, quantity: 2 },
      { unitPriceAmount: 5000, quantity: 1 },
    ];
    expect(cartSubtotal(items)).toBe(35000);
  });

  it("keeps unit price independent of quantity (price snapshot)", () => {
    const unitPriceAmount = 15000;
    expect(lineTotal(unitPriceAmount, 1)).toBe(15000);
    expect(lineTotal(unitPriceAmount, 5)).toBe(75000);
    expect(unitPriceAmount).toBe(15000);
  });

  it("uses zero shipping in Step 06A", () => {
    expect(orderTotal(30000, 0)).toBe(30000);
  });

  it("computes order total as subtotal + shipping", () => {
    expect(orderTotal(30000, 2500)).toBe(32500);
  });

  it("returns zero for an empty cart", () => {
    expect(cartSubtotal([])).toBe(0);
    expect(orderTotal(0, 0)).toBe(0);
  });
});
