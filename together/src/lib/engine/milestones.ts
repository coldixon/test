import { addMonths } from "./dates";
import { cardUtilisation, effectiveApr, type PayoffPlan } from "./debts";
import type { Forecast, HouseholdSnapshot, ISODate } from "./types";

export type MilestoneStatus = "done" | "in_progress" | "pending";

export interface Milestone {
  id: string;
  label: string;
  status: MilestoneStatus;
  /** Progress toward a numeric target, when the milestone has one. */
  progress?: { current: number; target: number };
  /** When the engine expects the milestone to complete, if not yet done. */
  estimatedOn?: ISODate | null;
}

export interface MilestoneSummary {
  milestones: Milestone[];
  done: number;
  total: number;
}

/** The revolving debt with the highest rate today: the one "Right the Ship" aims to clear. */
export function priorityCard(snapshot: HouseholdSnapshot) {
  return [...snapshot.debts]
    .filter((d) => d.kind === "credit_card" || d.kind === "store_card")
    .sort((a, b) => effectiveApr(b, snapshot.asOf) - effectiveApr(a, snapshot.asOf) || b.balance - a.balance)[0] ?? null;
}

/**
 * The six recovery milestones of "Right the Ship" mode, evaluated from the
 * snapshot, the base 30-day forecast and the current payoff plan.
 */
export function evaluateMilestones(snapshot: HouseholdSnapshot, base30: Forecast, plan: PayoffPlan): MilestoneSummary {
  const history = [...snapshot.history].sort((a, b) => a.month.localeCompare(b.month));
  const completed = history.filter((h) => h.month < snapshot.asOf.slice(0, 7));
  const last = completed[completed.length - 1];
  const lastThree = completed.slice(-3);

  const overdueNow = (last?.overdueBills ?? 0) === 0;
  const positiveMonths = countTrailing(completed, (h) => h.netCashFlow > 0);
  const reserveHeld = base30.lowest.balance >= snapshot.settings.protectedReserve && (last?.reserveHeld ?? false);

  const starter = snapshot.goals[0];
  const starterDone = starter ? starter.balance >= starter.target : false;
  const starterMonths = starter && !starterDone && starter.monthlyContribution > 0
    ? Math.ceil((starter.target - starter.balance) / starter.monthlyContribution)
    : 0;

  const utilNow = cardUtilisation(snapshot.debts);
  const utilDone = utilNow !== null && utilNow < 0.5;
  let utilOn: ISODate | null = null;
  if (!utilDone) {
    for (const m of plan.months) {
      const u = cardUtilisation(snapshot.debts, m.balances);
      if (u !== null && u < 0.5) {
        utilOn = m.month;
        break;
      }
    }
  }

  const card = priorityCard(snapshot);
  const cardDone = card ? card.balance <= 0 : true;

  const milestones: Milestone[] = [
    { id: "no_overdue", label: "No overdue bills", status: overdueNow ? "done" : "pending", estimatedOn: overdueNow ? null : addMonths(snapshot.asOf, 1) },
    {
      id: "positive_cash_flow",
      label: "3 months positive cash flow",
      status: positiveMonths >= 3 ? "done" : positiveMonths > 0 ? "in_progress" : "pending",
      progress: { current: Math.min(3, positiveMonths), target: 3 },
      estimatedOn: positiveMonths >= 3 ? null : addMonths(snapshot.asOf, 3 - positiveMonths),
    },
    { id: "reserve_held", label: "Checking reserve held", status: reserveHeld ? "done" : "pending", estimatedOn: reserveHeld ? null : addMonths(snapshot.asOf, 1) },
    {
      id: "starter_fund",
      label: starter ? `Starter fund ${fmt(starter.balance)} / ${fmt(starter.target)}` : "Starter fund",
      status: starterDone ? "done" : starter && starter.balance > 0 ? "in_progress" : "pending",
      progress: starter ? { current: starter.balance, target: starter.target } : undefined,
      estimatedOn: starterDone ? null : addMonths(snapshot.asOf, starterMonths),
    },
    {
      id: "utilisation",
      label: "Card utilization under 50%",
      status: utilDone ? "done" : "pending",
      progress: utilNow !== null ? { current: Math.round(utilNow * 100), target: 50 } : undefined,
      estimatedOn: utilDone ? null : utilOn,
    },
    {
      id: "priority_card",
      label: card ? `${card.name} paid off` : "Highest-rate card paid off",
      status: cardDone ? "done" : "pending",
      progress: card ? { current: card.balance, target: 0 } : undefined,
      estimatedOn: cardDone ? null : card ? plan.payoffDates[card.id] ?? null : null,
    },
  ];
  // Only three trailing months count toward the cash-flow milestone.
  void lastThree;

  return { milestones, done: milestones.filter((m) => m.status === "done").length, total: milestones.length };
}

function countTrailing<T>(items: T[], pred: (t: T) => boolean): number {
  let n = 0;
  for (let i = items.length - 1; i >= 0; i--) {
    if (pred(items[i])) n++;
    else break;
  }
  return n;
}

function fmt(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}
