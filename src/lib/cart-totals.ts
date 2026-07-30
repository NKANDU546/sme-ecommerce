/**
 * Pure cart/order total rules mirrored from Step 06A backend.
 * Frontend must never invent prices — these helpers document the contract.
 */

export function lineTotal(unitPriceAmount: number, quantity: number): number {
  return unitPriceAmount * quantity;
}

export function cartSubtotal(
  items: Array<{ unitPriceAmount: number; quantity: number }>,
): number {
  return items.reduce(
    (sum, item) => sum + lineTotal(item.unitPriceAmount, item.quantity),
    0,
  );
}

export function orderTotal(
  subtotalAmount: number,
  shippingAmount: number,
): number {
  return subtotalAmount + shippingAmount;
}
