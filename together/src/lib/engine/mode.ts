import { daysBetween, monthsUntil, toUTC } from "./dates-extra";
import type { MilestoneSummary } from "./milestones";
import type { HouseholdSnapshot, ISODate, ModeName } from "./types";

export interface ModeAssessment {
  mode: ModeName;
  since: ISODate;
  /** 1-based month of the current mode. */
  monthNumber: number;
  /** Next mode the household graduates to, if any. */
  next: ModeName | null;
  /** When all remaining milestones are expected to be done. */
  graduationEstimate: ISODate | null;
  /** Change versus the previous review, in days (negative = earlier). */
  shiftDays: number | null;
  shiftNote: string | null;
}

const ORDER: ModeName[] = ["Stabilise", "Right the Ship", "Stay Ahead", "Build Wealth"];

/**
 * Which mode the household is in, from its milestones and history.
 *
 * - Stabilise: overdue bills, or cash flow negative in two of the last three months.
 * - Right the Ship: no emergency, but the six recovery milestones are not all met.
 * - Stay Ahead: all six milestones met.
 * - Build Wealth: Stay Ahead plus an emergency fund of three months of bills.
 */
export function determineMode(snapshot: HouseholdSnapshot, milestones: MilestoneSummary): ModeName {
  const history = [...snapshot.history].sort((a, b) => a.month.localeCompare(b.month)).filter((h) => h.month < snapshot.asOf.slice(0, 7));
  const lastThree = history.slice(-3);
  const overdue = (history[history.length - 1]?.overdueBills ?? 0) > 0;
  const negatives = lastThree.filter((h) => h.netCashFlow < 0).length;
  if (overdue || negatives >= 2) return "Stabilise";
  if (milestones.done < milestones.total) return "Right the Ship";
  const monthlyBills = snapshot.bills.reduce((s, b) => s + b.amount, 0);
  const savings = snapshot.goals.reduce((s, g) => s + g.balance, 0);
  return savings >= monthlyBills * 3 ? "Build Wealth" : "Stay Ahead";
}

export function assessMode(snapshot: HouseholdSnapshot, milestones: MilestoneSummary): ModeAssessment {
  const mode = determineMode(snapshot, milestones);
  const since = mode === snapshot.mode.mode ? snapshot.mode.since : snapshot.asOf;
  const monthNumber = monthsUntil(since, snapshot.asOf) + 1;
  const idx = ORDER.indexOf(mode);
  const next = idx >= 0 && idx < ORDER.length - 1 ? ORDER[idx + 1] : null;

  let graduationEstimate: ISODate | null = null;
  if (mode === "Right the Ship") {
    for (const m of milestones.milestones) {
      if (m.status === "done") continue;
      if (!m.estimatedOn) {
        graduationEstimate = null;
        break;
      }
      if (!graduationEstimate || toUTC(m.estimatedOn) > toUTC(graduationEstimate)) graduationEstimate = m.estimatedOn;
    }
  }

  const prev = snapshot.mode.previousEstimate;
  const shiftDays = graduationEstimate && prev ? daysBetween(prev, graduationEstimate) : null;

  return {
    mode,
    since,
    monthNumber,
    next,
    graduationEstimate,
    shiftDays,
    shiftNote: shiftDays !== null ? snapshot.mode.previousEstimateNote ?? null : null,
  };
}
