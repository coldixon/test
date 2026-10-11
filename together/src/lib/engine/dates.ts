import type { ISODate } from "./types";

/** Parse an ISO calendar date into a UTC timestamp at midnight. */
export function toUTC(date: ISODate): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function fromUTC(ts: number): ISODate {
  const d = new Date(ts);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const DAY_MS = 86_400_000;

export function addDays(date: ISODate, days: number): ISODate {
  return fromUTC(toUTC(date) + days * DAY_MS);
}

export function daysBetween(from: ISODate, to: ISODate): number {
  return Math.round((toUTC(to) - toUTC(from)) / DAY_MS);
}

export function dayOfMonth(date: ISODate): number {
  return new Date(toUTC(date)).getUTCDate();
}

export function daysInMonth(date: ISODate): number {
  const d = new Date(toUTC(date));
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
}

/** `YYYY-MM` for grouping by month. */
export function monthKey(date: ISODate): string {
  return date.slice(0, 7);
}

export function addMonths(date: ISODate, months: number): ISODate {
  const d = new Date(toUTC(date));
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  const dim = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d.getUTCDate(), dim));
  return fromUTC(target.getTime());
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "Nov 5" */
export function shortDate(date: ISODate): string {
  const d = new Date(toUTC(date));
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** "Thu, Nov 5" */
export function weekdayDate(date: ISODate): string {
  const d = new Date(toUTC(date));
  return `${DAYS[d.getUTCDay()]}, ${shortDate(date)}`;
}

/** "August 2027" */
export function monthYear(date: ISODate): string {
  const d = new Date(toUTC(date));
  return `${MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "Aug 2027" */
export function shortMonthYear(date: ISODate): string {
  const d = new Date(toUTC(date));
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function monthName(date: ISODate): string {
  return MONTHS_LONG[new Date(toUTC(date)).getUTCMonth()];
}

export function monthAbbrev(date: ISODate): string {
  return MONTHS[new Date(toUTC(date)).getUTCMonth()];
}
