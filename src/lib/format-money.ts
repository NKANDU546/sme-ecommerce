/** Format backend minor-unit amounts for storefront display. */
export function formatMinorAmount(
  amount: number,
  currency: string,
  locale = "en-US",
): string {
  const prefix =
    currency === "ZAR" ? "R" : currency === "NGN" ? "₦" : `${currency} `;
  const major = amount / 100;
  return `${prefix}${major.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
