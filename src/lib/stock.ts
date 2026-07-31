/** Friendly copy for hard-stock cart / checkout failures. */
export function stockFailureMessage(
  errorCode: string | undefined,
  errorMessage: string,
  availableQuantity?: number,
): string {
  if (errorCode === "INSUFFICIENT_STOCK") {
    if (availableQuantity != null && Number.isFinite(availableQuantity)) {
      if (availableQuantity <= 0) return "This item is sold out.";
      return `Only ${availableQuantity} left in stock. Update your cart and try again.`;
    }
    return errorMessage.trim() || "Not enough stock for this product.";
  }
  return errorMessage;
}
