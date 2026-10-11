/**
 * The calculation engine's public surface.
 *
 * `computeDashboard` runs everything the home screen needs from one snapshot
 * so the UI never does arithmetic of its own.
 */

import { cardUtilisation, simulatePayoff, totalDebt, type PayoffPlan } from "./debts";
import { availableCash, forecast } from "./forecast";
import { healthScore, type HealthScore } from "./health";
import { evaluateMilestones, type MilestoneSummary } from "./milestones";
import { assessMode, type ModeAssessment } from "./mode";
import { upcomingBills } from "./schedule";
import type { Forecast, HouseholdSnapshot, UpcomingBill } from "./types";

export interface Dashboard {
  snapshot: HouseholdSnapshot;
  base30: Forecast;
  availableCash: number;
  totalDebt: number;
  cardUtilisation: number | null;
  totalSavings: number;
  savingsThisMonth: number;
  debtChangeSincePlanStart: number;
  planStartMonthLabel: string;
  upcoming: UpcomingBill[];
  milestones: MilestoneSummary;
  mode: ModeAssessment;
  health: HealthScore;
  currentPlan: PayoffPlan;
  avalanchePlan: PayoffPlan;
  commitmentsTotal: { done: number; goal: number };
}

export function computeDashboard(snapshot: HouseholdSnapshot): Dashboard {
  const base30 = forecast(snapshot, { days: 30, scenario: "base" });
  const currentPlan = simulatePayoff(snapshot.debts, { kind: "fixed", order: snapshot.debtPlanOrder }, snapshot.monthlyExtraDebtPayment, snapshot.asOf);
  const avalanchePlan = simulatePayoff(snapshot.debts, { kind: "avalanche" }, snapshot.monthlyExtraDebtPayment, snapshot.asOf);
  const milestones = evaluateMilestones(snapshot, base30, currentPlan);
  const mode = assessMode(snapshot, milestones);
  const health = healthScore(snapshot, base30);

  const history = [...snapshot.history].sort((a, b) => a.month.localeCompare(b.month));
  const first = history[0];
  const thisMonth = snapshot.asOf.slice(0, 7);
  const current = history.find((h) => h.month === thisMonth);
  const previous = history.filter((h) => h.month < thisMonth).pop();
  const totalSavings = snapshot.goals.reduce((s, g) => s + g.balance, 0);

  const commitments = snapshot.commitments.filter((c) => c.month === thisMonth);

  return {
    snapshot,
    base30,
    availableCash: availableCash(snapshot),
    totalDebt: totalDebt(snapshot.debts),
    cardUtilisation: cardUtilisation(snapshot.debts),
    totalSavings,
    savingsThisMonth: current && previous ? current.totalSavings - previous.totalSavings : 0,
    debtChangeSincePlanStart: first ? totalDebt(snapshot.debts) - first.totalDebt : 0,
    planStartMonthLabel: first ? monthLabel(first.month) : "",
    upcoming: upcomingBills(snapshot),
    milestones,
    mode,
    health,
    currentPlan,
    avalanchePlan,
    commitmentsTotal: {
      done: commitments.reduce((s, c) => s + c.done, 0),
      goal: commitments.reduce((s, c) => s + c.goal, 0),
    },
  };
}

function monthLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split("-").map(Number);
  return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m - 1] + (y ? "" : "");
}

export { forecast, availableCash } from "./forecast";
export { simulateShiftPayment, applyShift } from "./simulate";
export { simulatePayoff, totalDebt, cardUtilisation, interestForDays, effectiveApr } from "./debts";
export { evaluateMilestones } from "./milestones";
export { assessMode, determineMode } from "./mode";
export { healthScore } from "./health";
export { upcomingBills, nextPayday } from "./schedule";
export * from "./types";
