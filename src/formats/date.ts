export function formatDate(
  input: Date | string | number,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  const d = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat(locale, options).format(d);
}
