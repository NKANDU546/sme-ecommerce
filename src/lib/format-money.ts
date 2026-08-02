function currencyPrefix(currency: string): string {
  return currency === "ZAR" ? "R" : currency === "NGN" ? "₦" : `${currency} `;
}

/** Format backend minor-unit amounts for storefront display. */
export function formatMinorAmount(
  amount: number,
  currency: string,
  locale = "en-US",
): string {
  const major = amount / 100;
  return `${currencyPrefix(currency)}${major.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Format analytics major-unit amounts (do not divide by 100). */
export function formatMajorAmount(
  amount: number,
  currency: string,
  locale = "en-US",
): string {
  return `${currencyPrefix(currency)}${Number(amount).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
