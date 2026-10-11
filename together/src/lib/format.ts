/** Display formatting. Pure functions; no engine logic lives here. */

export function money(n: number, opts: { cents?: boolean; sign?: boolean } = {}): string {
  const abs = Math.abs(n);
  const cents = opts.cents ?? (!Number.isInteger(abs) && abs < 1000);
  const body = cents
    ? abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(abs).toLocaleString("en-US");
  const sign = n < 0 ? "−" : opts.sign && n > 0 ? "+" : "";
  return `${sign}$${body}`;
}

export function percent(fraction: number, digits = 0): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}

export { shortDate, weekdayDate, monthYear, shortMonthYear, monthName, monthAbbrev, dayOfMonth } from "@/lib/engine/dates";
