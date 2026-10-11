import {
  addDays,
  dayOfMonth,
  daysBetween,
  daysInMonth,
  toUTC,
} from "./dates";
import type {
  Bill,
  HouseholdSnapshot,
  IncomeStream,
  ISODate,
  PlannedPayment,
  Scenario,
  UpcomingBill,
} from "./types";

/** A dated cash movement produced by expanding recurring items. */
export interface CashEvent {
  date: ISODate;
  amount: number; // positive = inflow, negative = outflow
  label: string;
  sourceId: string;
  kind: "income" | "bill" | "planned" | "discretionary";
}

/** Scenario multipliers. Estimated bills and everyday spending are the uncertain parts. */
export function scenarioFactors(scenario: Scenario): { estimatedBill: number; discretionary: number } {
  switch (scenario) {
    case "conservative":
      return { estimatedBill: 1.1, discretionary: 1.15 };
    case "optimistic":
      return { estimatedBill: 1, discretionary: 0.9 };
    default:
      return { estimatedBill: 1, discretionary: 1 };
  }
}

/** Does an income stream pay out on `date`? */
export function incomeLandsOn(income: IncomeStream, date: ISODate): boolean {
  const dom = dayOfMonth(date);
  const last = daysInMonth(date);
  switch (income.cadence) {
    case "biweekly": {
      if (!income.anchorDate) return false;
      const diff = daysBetween(income.anchorDate, date);
      return diff % 14 === 0;
    }
    case "weekly": {
      if (!income.anchorDate) return false;
      const diff = daysBetween(income.anchorDate, date);
      return diff % 7 === 0;
    }
    case "semimonthly": {
      const days = income.daysOfMonth ?? [15, 31];
      return days.some((d) => (d >= last ? dom === last : dom === d));
    }
    case "monthly": {
      const d = income.daysOfMonth?.[0] ?? 1;
      return d >= last ? dom === last : dom === d;
    }
  }
}

export function billLandsOn(bill: Bill, date: ISODate): boolean {
  const dom = dayOfMonth(date);
  const last = daysInMonth(date);
  return bill.dueDay >= last ? dom === last : dom === bill.dueDay;
}

/**
 * Expand every recurring and planned item into dated events for the window
 * (`start`, `start + days`]. Day 0 (today) carries no events: the starting
 * balance already reflects it.
 */
export function expandEvents(
  snapshot: HouseholdSnapshot,
  days: number,
  scenario: Scenario,
  overrides?: { plannedPayments?: PlannedPayment[] },
): CashEvent[] {
  const factors = scenarioFactors(scenario);
  const events: CashEvent[] = [];
  const planned = overrides?.plannedPayments ?? snapshot.plannedPayments;
  const discretionary = Math.round(snapshot.settings.dailyDiscretionary * factors.discretionary);

  for (let i = 1; i <= days; i++) {
    const date = addDays(snapshot.asOf, i);
    for (const inc of snapshot.incomes) {
      if (incomeLandsOn(inc, date)) {
        events.push({ date, amount: inc.amount, label: inc.name, sourceId: inc.id, kind: "income" });
      }
    }
    for (const bill of snapshot.bills) {
      if (billLandsOn(bill, date)) {
        const amount =
          bill.certainty === "estimated" ? Math.round(bill.amount * factors.estimatedBill) : bill.amount;
        events.push({ date, amount: -amount, label: bill.name, sourceId: bill.id, kind: "bill" });
      }
    }
    for (const p of planned) {
      if (p.status === "paid" || p.status === "cancelled") continue;
      if (p.date === date) {
        events.push({ date, amount: -p.amount, label: p.name, sourceId: p.id, kind: "planned" });
      }
    }
    if (discretionary > 0) {
      events.push({ date, amount: -discretionary, label: "Everyday spending", sourceId: "discretionary", kind: "discretionary" });
    }
  }
  return events;
}

/** The next occurrence of each bill and planned payment, in date order. */
export function upcomingBills(snapshot: HouseholdSnapshot, horizonDays = 45): UpcomingBill[] {
  const out: UpcomingBill[] = [];
  const seen = new Set<string>();
  for (let i = 1; i <= horizonDays; i++) {
    const date = addDays(snapshot.asOf, i);
    for (const bill of snapshot.bills) {
      if (seen.has(bill.id)) continue;
      if (billLandsOn(bill, date)) {
        seen.add(bill.id);
        out.push({
          id: bill.id,
          name: bill.name,
          category: bill.category,
          dueDate: date,
          amount: bill.amount,
          certainty: bill.certainty,
          payerId: bill.payerId,
          payMethod: bill.payMethod,
          kind: "bill",
        });
      }
    }
    for (const p of snapshot.plannedPayments) {
      if (p.status === "paid" || p.status === "cancelled" || seen.has(p.id)) continue;
      if (p.date === date) {
        seen.add(p.id);
        out.push({
          id: p.id,
          name: p.name,
          category: p.kind === "extra_debt_payment" ? "Debt plan" : "Savings plan",
          dueDate: date,
          amount: p.amount,
          certainty: "planned",
          payerId: null,
          payMethod: p.status === "awaiting_approval" ? "awaiting_approval" : "together_pay",
          kind: "planned",
        });
      }
    }
  }
  return out.sort((a, b) => toUTC(a.dueDate) - toUTC(b.dueDate) || a.name.localeCompare(b.name));
}

/** Next pay date for a partner on or after `after` (exclusive of `after` itself). */
export function nextPayday(snapshot: HouseholdSnapshot, after: ISODate, partnerId?: string): ISODate | null {
  for (let i = 1; i <= 62; i++) {
    const date = addDays(after, i);
    for (const inc of snapshot.incomes) {
      if (partnerId && inc.partnerId !== partnerId) continue;
      if (incomeLandsOn(inc, date)) return date;
    }
  }
  return null;
}
