import { addMonths, toUTC } from "./dates";
import { round2 } from "./forecast";
import type { Debt, ISODate } from "./types";

/** Interest accrued on `amount` at `apr` over `days` (simple daily accrual). */
export function interestForDays(amount: number, apr: number, days: number): number {
  return round2((amount * apr * days) / 365);
}

/** Effective APR on a given date, honouring a promotional rate until it ends. */
export function effectiveApr(debt: Debt, on: ISODate): number {
  if (debt.promo && toUTC(on) < toUTC(debt.promo.endsOn)) return debt.promo.apr;
  return debt.apr;
}

/** Whole months from `from` until `to` (0 when `to` is not after `from`). */
export function monthsUntil(from: ISODate, to: ISODate): number {
  const a = new Date(toUTC(from));
  const b = new Date(toUTC(to));
  const months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
  return Math.max(0, months);
}

export type PayoffStrategy =
  | { kind: "fixed"; order: string[] }
  | { kind: "avalanche" };

export interface PayoffMonth {
  month: ISODate;
  balances: Record<string, number>;
  interest: number;
  paid: number;
  /** Debt that received the extra payment this month. */
  extraTarget: string | null;
}

export interface PayoffPlan {
  strategy: PayoffStrategy;
  months: PayoffMonth[];
  totalInterest: number;
  /** Month in which each debt reaches zero. */
  payoffDates: Record<string, ISODate | null>;
  /** Month in which the last debt reaches zero. */
  debtFreeOn: ISODate | null;
  /** For a promo debt: the month the avalanche switches to it so it clears before the promo ends. */
  promoSwitchMonths: Record<string, ISODate>;
}

/**
 * Order debts for extra payments on a given month.
 *
 * Avalanche: highest effective APR first. A promotional-rate debt is deferred
 * while its rate is low, but once the months left on the promo are only just
 * enough to clear it with the extra payment, it jumps to the front so the
 * balance never rolls onto the post-promo rate.
 */
export function pickOrder(
  strategy: PayoffStrategy,
  debts: Debt[],
  balances: Record<string, number>,
  month: ISODate,
  extraMonthly: number,
): string[] {
  if (strategy.kind === "fixed") {
    const rest = debts.filter((d) => !strategy.order.includes(d.id)).map((d) => d.id);
    return [...strategy.order, ...rest];
  }
  const urgent: string[] = [];
  const rest: Debt[] = [];
  for (const d of debts) {
    const bal = balances[d.id] ?? 0;
    if (bal <= 0) continue;
    if (d.promo && toUTC(month) < toUTC(d.promo.endsOn)) {
      const monthsLeft = monthsUntil(month, d.promo.endsOn);
      const perMonth = extraMonthly + d.minimumPayment;
      const monthsNeeded = perMonth > 0 ? Math.ceil(bal / perMonth) : Infinity;
      if (monthsLeft <= monthsNeeded) {
        urgent.push(d.id);
        continue;
      }
    }
    rest.push(d);
  }
  rest.sort((a, b) => effectiveApr(b, month) - effectiveApr(a, month) || balances[b.id] - balances[a.id]);
  return [...urgent, ...rest.map((d) => d.id)];
}

/**
 * Month-by-month amortisation of all debts under a payment strategy.
 *
 * Each month every debt accrues one month of interest at its effective rate
 * and receives its minimum payment. The extra amount then goes to the first
 * debt in that month's order that still has a balance, rolling to the next
 * when one is cleared. Minimums of cleared debts are added to the extra pool.
 */
export function simulatePayoff(
  debts: Debt[],
  strategy: PayoffStrategy,
  extraMonthly: number,
  from: ISODate,
  horizonMonths = 120,
): PayoffPlan {
  const balances: Record<string, number> = {};
  for (const d of debts) balances[d.id] = d.balance;
  const payoffDates: Record<string, ISODate | null> = {};
  for (const d of debts) payoffDates[d.id] = d.balance <= 0 ? from : null;
  const months: PayoffMonth[] = [];
  const promoSwitchMonths: Record<string, ISODate> = {};
  let totalInterest = 0;

  for (let m = 0; m < horizonMonths; m++) {
    const month = addMonths(from, m + 1);
    let interestThisMonth = 0;
    let paidThisMonth = 0;
    let extra = extraMonthly;
    for (const d of debts) {
      const bal = balances[d.id];
      if (bal <= 0) {
        extra += d.minimumPayment; // freed minimum rolls over
        continue;
      }
      const interest = round2((bal * effectiveApr(d, month)) / 12);
      interestThisMonth += interest;
      const due = Math.min(bal + interest, d.minimumPayment);
      balances[d.id] = round2(bal + interest - due);
      paidThisMonth += due;
    }
    const order = pickOrder(strategy, debts, balances, month, extraMonthly);
    let extraTarget: string | null = null;
    for (const id of order) {
      if (extra <= 0) break;
      const bal = balances[id];
      if (bal <= 0) continue;
      const debt = debts.find((d) => d.id === id)!;
      if (extraTarget === null) {
        extraTarget = id;
        if (debt.promo && strategy.kind === "avalanche" && !promoSwitchMonths[id]) promoSwitchMonths[id] = month;
      }
      const pay = Math.min(bal, extra);
      balances[id] = round2(bal - pay);
      paidThisMonth += pay;
      extra -= pay;
    }
    for (const d of debts) {
      if (balances[d.id] <= 0 && payoffDates[d.id] === null) payoffDates[d.id] = month;
    }
    totalInterest += interestThisMonth;
    months.push({ month, balances: { ...balances }, interest: round2(interestThisMonth), paid: round2(paidThisMonth), extraTarget });
    if (debts.every((d) => balances[d.id] <= 0)) break;
  }

  let debtFreeOn: ISODate | null = null;
  if (debts.every((d) => payoffDates[d.id] !== null)) {
    for (const d of Object.values(payoffDates)) {
      if (d && (!debtFreeOn || toUTC(d) > toUTC(debtFreeOn))) debtFreeOn = d;
    }
  }

  return { strategy, months, totalInterest: round2(totalInterest), payoffDates, debtFreeOn, promoSwitchMonths };
}

export function totalDebt(debts: Debt[]): number {
  return round2(debts.reduce((s, d) => s + d.balance, 0));
}

/** Credit-card utilisation across cards with a known limit (0–1), or null when no limits are known. */
export function cardUtilisation(debts: Debt[], balances?: Record<string, number>): number | null {
  const cards = debts.filter((d) => (d.kind === "credit_card" || d.kind === "store_card") && d.creditLimit);
  if (cards.length === 0) return null;
  const used = cards.reduce((s, d) => s + (balances ? balances[d.id] ?? d.balance : d.balance), 0);
  const limit = cards.reduce((s, d) => s + (d.creditLimit ?? 0), 0);
  return limit > 0 ? used / limit : null;
}

/** The debt that would receive the next extra payment under a strategy. */
export function nextExtraTarget(debts: Debt[], strategy: PayoffStrategy, extraMonthly: number, month: ISODate): Debt | null {
  const balances: Record<string, number> = {};
  for (const d of debts) balances[d.id] = d.balance;
  const order = pickOrder(strategy, debts, balances, month, extraMonthly);
  for (const id of order) {
    const d = debts.find((x) => x.id === id);
    if (d && d.balance > 0) return d;
  }
  return null;
}
