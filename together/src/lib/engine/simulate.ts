import { daysBetween } from "./dates";
import { effectiveApr, interestForDays } from "./debts";
import { forecast, round2 } from "./forecast";
import type { Forecast, HouseholdSnapshot, PlannedPayment, Scenario } from "./types";

export interface ShiftPaymentInput {
  paymentId: string;
  /** How much of the payment to move (may be all of it). */
  amount: number;
  toDate: string;
  days?: number;
  scenario?: Scenario;
}

export interface ShiftPaymentResult {
  before: Forecast;
  after: Forecast;
  payment: PlannedPayment;
  amount: number;
  fromDate: string;
  toDate: string;
  daysDeferred: number;
  /** Annual rate used for the cost estimate, as a fraction. */
  apr: number;
  /** Extra interest from carrying `amount` on the debt for `daysDeferred` more days. */
  interestCost: number;
  lowBefore: number;
  lowAfter: number;
  lowDelta: number;
  /** The planned payments after the move, ready to be saved if accepted. */
  plannedPayments: PlannedPayment[];
}

/**
 * What-if: move part of a planned payment to a later date.
 *
 * Returns both forecasts so every number a recommendation quotes (the new
 * low point, the delta, the interest cost) is read straight off this result.
 */
export function simulateShiftPayment(snapshot: HouseholdSnapshot, input: ShiftPaymentInput): ShiftPaymentResult {
  const payment = snapshot.plannedPayments.find((p) => p.id === input.paymentId);
  if (!payment) throw new Error(`Unknown planned payment ${input.paymentId}`);
  const amount = Math.min(input.amount, payment.amount);
  const days = input.days ?? 30;
  const scenario = input.scenario ?? "base";

  const remaining = round2(payment.amount - amount);
  const moved: PlannedPayment = {
    ...payment,
    id: `${payment.id}:moved`,
    name: `${payment.name} (moved)`,
    amount,
    date: input.toDate,
    status: "scheduled",
  };
  const plannedPayments: PlannedPayment[] = [];
  for (const p of snapshot.plannedPayments) {
    if (p.id !== payment.id) {
      plannedPayments.push(p);
    } else if (remaining > 0) {
      plannedPayments.push({ ...p, amount: remaining });
    }
  }
  plannedPayments.push(moved);

  const before = forecast(snapshot, { days, scenario });
  const after = forecast(snapshot, { days, scenario, plannedPayments });

  const daysDeferred = Math.max(0, daysBetween(payment.date, input.toDate));
  const debt = snapshot.debts.find((d) => d.id === payment.targetId);
  const apr = debt ? effectiveApr(debt, payment.date) : 0;
  const interestCost = interestForDays(amount, apr, daysDeferred);

  return {
    before,
    after,
    payment,
    amount,
    fromDate: payment.date,
    toDate: input.toDate,
    daysDeferred,
    apr,
    interestCost,
    lowBefore: before.lowest.balance,
    lowAfter: after.lowest.balance,
    lowDelta: round2(after.lowest.balance - before.lowest.balance),
    plannedPayments,
  };
}

/** Apply a shift to a snapshot (what "Accept" does in the demo). */
export function applyShift(snapshot: HouseholdSnapshot, result: ShiftPaymentResult): HouseholdSnapshot {
  return { ...snapshot, plannedPayments: result.plannedPayments.map((p) => (p.id === result.payment.id ? { ...p, status: "scheduled" } : p)) };
}
