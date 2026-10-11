import { addDays } from "./dates";
import { expandEvents } from "./schedule";
import type {
  Forecast,
  ForecastPoint,
  HouseholdSnapshot,
  PlannedPayment,
  Scenario,
} from "./types";

/** Cash the household can draw on today: shared checking and savings that are not earmarked. */
export function availableCash(snapshot: HouseholdSnapshot): number {
  return snapshot.accounts
    .filter((a) => a.visibility === "shared" && a.kind === "checking")
    .reduce((sum, a) => sum + a.balance, 0);
}

export interface ForecastOptions {
  days?: number;
  scenario?: Scenario;
  /** Replace the snapshot's planned payments (used by what-if simulations). */
  plannedPayments?: PlannedPayment[];
}

/**
 * Project the household's shared cash day by day.
 *
 * The projection is deterministic: the same snapshot and options always give
 * the same series, so a number shown anywhere in the app can be traced back to
 * the events on each day.
 */
export function forecast(snapshot: HouseholdSnapshot, options: ForecastOptions = {}): Forecast {
  const days = options.days ?? 30;
  const scenario = options.scenario ?? "base";
  const reserve = snapshot.settings.protectedReserve;
  const events = expandEvents(snapshot, days, scenario, { plannedPayments: options.plannedPayments });

  const byDate = new Map<string, typeof events>();
  for (const e of events) {
    const list = byDate.get(e.date) ?? [];
    list.push(e);
    byDate.set(e.date, list);
  }

  const startingBalance = availableCash(snapshot);
  let balance = startingBalance;
  let totalInflows = 0;
  let totalOutflows = 0;
  const points: ForecastPoint[] = [
    { dayIndex: 0, date: snapshot.asOf, balance, inflow: 0, outflow: 0, events: [] },
  ];
  let lowest = points[0];

  for (let i = 1; i <= days; i++) {
    const date = addDays(snapshot.asOf, i);
    const todays = byDate.get(date) ?? [];
    let inflow = 0;
    let outflow = 0;
    const labels: string[] = [];
    for (const e of todays) {
      if (e.amount >= 0) inflow += e.amount;
      else outflow += -e.amount;
      if (e.kind !== "discretionary") labels.push(e.label);
    }
    balance = round2(balance + inflow - outflow);
    totalInflows += inflow;
    totalOutflows += outflow;
    const point: ForecastPoint = { dayIndex: i, date, balance, inflow, outflow, events: labels };
    points.push(point);
    if (point.balance < lowest.balance) lowest = point;
  }

  const safeRaw = round2(lowest.balance - reserve);
  return {
    scenario,
    days,
    start: snapshot.asOf,
    end: points[points.length - 1].date,
    points,
    startingBalance,
    endingBalance: balance,
    totalInflows: round2(totalInflows),
    totalOutflows: round2(totalOutflows),
    lowest,
    reserve,
    safeToSpend: Math.max(0, safeRaw),
    safeToSpendRaw: safeRaw,
    breachesReserve: lowest.balance < reserve,
    breachBy: lowest.balance < reserve ? round2(reserve - lowest.balance) : 0,
  };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
