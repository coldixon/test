/**
 * Rule-based checks that spot problems and opportunities.
 *
 * Each rule reads the snapshot and the engine's results, decides whether it
 * applies, and if so returns a recommendation with:
 *   - the action to take (structured, so Accept can apply it),
 *   - the numbers the engine computed for it (`facts`), which are the only
 *     numbers an explanation may quote,
 *   - timing: `surfaceOn` (when it is worth showing) and `actBy` (the last
 *     good moment to act, after which the opportunity is gone).
 */

import { addDays, daysBetween, monthName, shortDate, shortMonthYear, toUTC, weekdayDate } from "@/lib/engine/dates";
import { nextExtraTarget, simulatePayoff, type PayoffPlan } from "@/lib/engine/debts";
import { forecast } from "@/lib/engine/forecast";
import { nextPayday } from "@/lib/engine/schedule";
import { simulateShiftPayment } from "@/lib/engine/simulate";
import type { HouseholdSnapshot, ISODate } from "@/lib/engine/types";
import type { Facts } from "./numberGuard";

export type RecommendationTag = "Cash protection" | "Debt" | "Spending";
export type Approval = "none" | "one_partner" | "both_partners";

export type RecommendationAction =
  | { type: "shift_payment"; paymentId: string; amount: number; toDate: ISODate }
  | { type: "retarget_payment"; paymentId: string; toDebtId: string }
  | { type: "cancel_subscription"; chargeId: string };

export interface Recommendation {
  id: string;
  ruleId: string;
  tag: RecommendationTag;
  approval: Approval;
  title: string;
  why: string;
  impact: string;
  assumptions: string;
  risk: string;
  confidence: "High" | "Medium" | "Low";
  source: string;
  acceptedText: string;
  action: RecommendationAction;
  facts: Facts;
  surfaceOn: ISODate;
  actBy: ISODate;
  /** Lower comes first. */
  priority: number;
}

export interface RuleContext {
  snapshot: HouseholdSnapshot;
  currentPlan: PayoffPlan;
  avalanchePlan: PayoffPlan;
}

export function money(n: number): string {
  const abs = Math.abs(n);
  const whole = Number.isInteger(abs) || abs >= 1000;
  const s = whole ? Math.round(abs).toLocaleString("en-US") : abs.toFixed(2);
  return `${n < 0 ? "−" : ""}$${s}`;
}

function pct(fraction: number): string {
  return `${(fraction * 100).toFixed(2).replace(/\.?0+$/, "")}%`;
}

function roundUpTo(n: number, step: number): number {
  return Math.ceil(n / step) * step;
}

/* ------------------------------------------------------------------ */
/* Rule 1: cash protection                                             */
/* ------------------------------------------------------------------ */

/**
 * When the next 30 days leave less than the comfort buffer above the
 * reserve, look for a flexible planned payment before the low point and
 * move just enough of it to the first payday after the low point.
 */
export function cashProtectionRule(ctx: RuleContext): Recommendation | null {
  const { snapshot } = ctx;
  const base = forecast(snapshot, { days: 30, scenario: "base" });
  const comfort = snapshot.settings.comfortBuffer;
  if (base.safeToSpendRaw >= comfort) return null;

  const lowDate = base.lowest.date;
  const candidates = snapshot.plannedPayments
    .filter((p) => p.flexible && p.status !== "paid" && p.status !== "cancelled")
    .filter((p) => toUTC(p.date) > toUTC(snapshot.asOf) && toUTC(p.date) <= toUTC(lowDate))
    .sort((a, b) => toUTC(b.date) - toUTC(a.date)); // closest before the low point first
  const payment = candidates[0];
  if (!payment) return null;

  const toDate = nextPayday(snapshot, lowDate);
  if (!toDate) return null;
  const payer = snapshot.incomes.find((i) => nextPayday(snapshot, lowDate, i.partnerId) === toDate);
  const payerName = payer ? snapshot.partners.find((p) => p.id === payer.partnerId)?.name : null;

  const needed = comfort - base.safeToSpendRaw;
  const amount = Math.min(payment.amount, roundUpTo(needed, 50));
  const sim = simulateShiftPayment(snapshot, { paymentId: payment.id, amount, toDate, days: 30 });

  // Which bills make the week before the low point tight?
  const weekStart = addDays(lowDate, -6);
  const tightDays = base.points
    .filter((p) => toUTC(p.date) >= toUTC(weekStart) && toUTC(p.date) <= toUTC(lowDate))
    .map((p) => ({ date: p.date, bills: p.events.filter((e) => !/paycheck|salary|pay$/i.test(e)) }))
    .filter((p) => p.bills.length > 0);
  const tightBills = tightDays.flatMap((p) => p.bills);
  const HORIZON = 90;
  const quarter = forecast(snapshot, { days: HORIZON, scenario: "base" });
  const tightest = quarter.lowest.date === lowDate;

  const billsText = listNames(tightBills.slice(0, 3));
  const spanStart = tightDays[0]?.date ?? weekStart;
  const span = spanStart.slice(0, 7) === lowDate.slice(0, 7)
    ? `${shortDate(spanStart)}–${lowDate.slice(8).replace(/^0/, "")}`
    : `${shortDate(spanStart)}–${shortDate(lowDate)}`;
  const why = `${billsText} land ${span}, before ${payerName ? `${payerName}'s` : "the"} ${shortDate(toDate)} paycheck.${tightest ? ` That is your tightest week of the next ${HORIZON} days.` : ""}`;

  const facts: Facts = {
    amount: sim.amount,
    lowBefore: sim.lowBefore,
    lowAfter: sim.lowAfter,
    lowDelta: sim.lowDelta,
    interestCost: sim.interestCost,
    apr: sim.apr,
    daysDeferred: sim.daysDeferred,
    reserve: snapshot.settings.protectedReserve,
    safeBefore: base.safeToSpend,
    safeAfter: sim.after.safeToSpend,
    paymentTotal: payment.amount,
  };

  const estimated = snapshot.bills.filter((b) => b.certainty === "estimated");
  const assumptions = `Paychecks arrive on schedule${estimated.length ? `; ${estimated.map((b) => b.name.toLowerCase()).join(", ")} stay${estimated.length === 1 ? "s" : ""} near the ${estimated.map((b) => money(b.amount)).join(" and ")} estimate` : ""}.`;
  for (const b of estimated) facts[`estimate_${b.id}`] = b.amount;

  const incomeCount = snapshot.incomes.length;
  const billCount = base.points.reduce((n, p) => n + p.events.length, 0);
  facts.billCount = billCount;
  facts.incomeCount = incomeCount;
  facts.horizonDays = HORIZON;

  return {
    id: `cash-protection:${payment.id}`,
    ruleId: "cash_protection",
    tag: "Cash protection",
    approval: payment.approval === "none" ? "one_partner" : payment.approval,
    title: `Move ${money(sim.amount)} of the ${shortDate(payment.date)} ${payment.name} to ${shortDate(toDate)}`,
    why,
    impact: `Low point rises by ${money(sim.lowDelta)} · costs about ${money(sim.interestCost)} in interest`,
    assumptions,
    risk: payerName
      ? `If ${payerName}'s paycheck is late, the ${shortDate(toDate)} payment waits for it automatically.`
      : `If the paycheck is late, the ${shortDate(toDate)} payment waits for it automatically.`,
    confidence: "High",
    source: `Base forecast, ${billCount} bills, ${incomeCount} income streams`,
    acceptedText: "Payment rescheduled; forecast updated.",
    action: { type: "shift_payment", paymentId: payment.id, amount: sim.amount, toDate },
    facts,
    surfaceOn: snapshot.asOf,
    // Two days before the payment goes out: time for a partner to approve.
    actBy: addDays(payment.date, -2),
    priority: 1,
  };
}

/* ------------------------------------------------------------------ */
/* Rule 2: debt allocation                                             */
/* ------------------------------------------------------------------ */

/**
 * If the next extra payment is not going to the debt that costs the most,
 * compare the current plan with a promo-aware avalanche and quote the
 * interest saved over the life of the plan.
 */
export function debtAllocationRule(ctx: RuleContext): Recommendation | null {
  const { snapshot, currentPlan, avalanchePlan } = ctx;
  if (snapshot.debts.length < 2 || snapshot.monthlyExtraDebtPayment <= 0) return null;

  const nextPayment = snapshot.plannedPayments
    .filter((p) => p.kind === "extra_debt_payment" && p.status !== "paid" && p.status !== "cancelled")
    .filter((p) => toUTC(p.date) > toUTC(snapshot.asOf))
    .sort((a, b) => toUTC(a.date) - toUTC(b.date))
    .find((p) => {
      const month = p.date.slice(0, 7);
      const nextMonth = addDays(snapshot.asOf, 32).slice(0, 7);
      return month === nextMonth;
    });
  if (!nextPayment) return null;

  const current = snapshot.debts.find((d) => d.id === nextPayment.targetId);
  const better = nextExtraTarget(snapshot.debts, { kind: "avalanche" }, snapshot.monthlyExtraDebtPayment, nextPayment.date);
  if (!current || !better || better.id === current.id) return null;

  const saved = Math.round(currentPlan.totalInterest - avalanchePlan.totalInterest);
  if (saved < 50) return null;

  const promoDebt = snapshot.debts.find((d) => d.promo && d.id === current.id);
  const switchMonth = promoDebt ? avalanchePlan.promoSwitchMonths[promoDebt.id] : undefined;
  const reminderMonth = switchMonth ? addDays(switchMonth, -31) : null;

  const facts: Facts = {
    extra: nextPayment.amount,
    betterApr: better.apr,
    currentApr: current.apr,
    interestSaved: saved,
    currentPlanInterest: currentPlan.totalInterest,
    avalancheInterest: avalanchePlan.totalInterest,
  };
  if (promoDebt?.promo) facts.promoApr = promoDebt.promo.apr;

  const monthLabel = monthName(nextPayment.date);
  const why = promoDebt?.promo
    ? `It carries your highest rate. The ${current.name.toLowerCase()}'s ${pct(promoDebt.promo.apr)} promo runs to ${shortMonthYear(promoDebt.promo.endsOn)}, so there is no rush there yet.`
    : `It carries your highest rate (${pct(better.apr)} against ${pct(current.apr)}).`;

  return {
    id: `debt-allocation:${nextPayment.id}`,
    ruleId: "debt_allocation",
    tag: "Debt",
    approval: "both_partners",
    title: `Send ${monthLabel}'s extra ${money(nextPayment.amount)} to ${better.name} (${pct(better.apr)} APR) instead of the ${current.name.toLowerCase()}`,
    why,
    impact: `Saves an estimated ${money(saved)} in interest over the plan`,
    assumptions: promoDebt?.promo
      ? `APRs unchanged; ${current.name.toLowerCase()} promo ends ${shortMonthYear(promoDebt.promo.endsOn)} as reported.`
      : "APRs unchanged for the life of the plan.",
    risk: promoDebt?.promo
      ? `The ${current.name.toLowerCase()} balance must be cleared before the promo ends.${reminderMonth ? ` Together will remind you in ${monthName(reminderMonth)}.` : ""}`
      : "None beyond the usual: rates can change.",
    confidence: "High",
    source: "Amortization engine · avalanche vs current plan",
    acceptedText: "Waiting on the other partner to approve.",
    action: { type: "retarget_payment", paymentId: nextPayment.id, toDebtId: better.id },
    facts,
    surfaceOn: snapshot.asOf,
    actBy: addDays(nextPayment.date, -3),
    priority: 2,
  };
}

/* ------------------------------------------------------------------ */
/* Rule 3: overlapping subscriptions                                   */
/* ------------------------------------------------------------------ */

export function subscriptionRule(ctx: RuleContext): Recommendation | null {
  const { snapshot } = ctx;
  const streaming = snapshot.recurringCharges.filter((c) => c.category === "streaming");
  if (streaming.length < 3) return null;
  const partners = new Set(streaming.map((c) => c.partnerId));
  if (partners.size < 2) return null;

  const total = round2(streaming.reduce((s, c) => s + c.amount, 0));
  const drop = [...streaming].sort((a, b) => b.amount - a.amount)[0];
  const yearly = Math.round(drop.amount * 12);

  const facts: Facts = {
    services: streaming.length,
    monthlyTotal: total,
    freedMonthly: drop.amount,
    freedYearly: yearly,
    minOccurrences: Math.min(...streaming.map((c) => c.occurrences)),
  };

  return {
    id: `subscriptions:${drop.id}`,
    ruleId: "subscriptions",
    tag: "Spending",
    approval: "none",
    title: `You pay for ${streaming.length} streaming services. Drop one?`,
    why: `Together found ${money(total)}/mo in overlapping subscriptions across both partners' cards.`,
    impact: `${money(drop.amount)}/mo freed, about ${money(yearly)} a year`,
    assumptions: `Based on the last ${facts.minOccurrences} charges for each service.`,
    risk: "None. You cancel it directly with the provider.",
    confidence: "Medium",
    source: "Recurring transaction detection",
    acceptedText: "Marked to cancel. Together will confirm when charges stop.",
    action: { type: "cancel_subscription", chargeId: drop.id },
    facts,
    surfaceOn: snapshot.asOf,
    // Before the next charge for the most expensive service.
    actBy: addDays(drop.lastChargedOn, 30),
    priority: 3,
  };
}

/* ------------------------------------------------------------------ */

export const RULES = [cashProtectionRule, debtAllocationRule, subscriptionRule];

export interface AssistantOptions {
  /** Ids the household has dismissed; those rules stay quiet. */
  dismissedIds?: string[];
}

/** Run every rule and return the recommendations worth showing today. */
export function runRules(snapshot: HouseholdSnapshot, options: AssistantOptions = {}): Recommendation[] {
  const currentPlan = simulatePayoff(snapshot.debts, { kind: "fixed", order: snapshot.debtPlanOrder }, snapshot.monthlyExtraDebtPayment, snapshot.asOf);
  const avalanchePlan = simulatePayoff(snapshot.debts, { kind: "avalanche" }, snapshot.monthlyExtraDebtPayment, snapshot.asOf);
  const ctx: RuleContext = { snapshot, currentPlan, avalanchePlan };
  const dismissed = new Set(options.dismissedIds ?? []);
  const out: Recommendation[] = [];
  for (const rule of RULES) {
    const rec = rule(ctx);
    if (!rec || dismissed.has(rec.id)) continue;
    if (toUTC(rec.surfaceOn) > toUTC(snapshot.asOf)) continue;
    if (toUTC(rec.actBy) < toUTC(snapshot.asOf)) continue; // too late to help
    out.push(rec);
  }
  return out.sort((a, b) => a.priority - b.priority || toUTC(a.actBy) - toUTC(b.actBy));
}

/** Days left before a recommendation stops being useful. */
export function daysToAct(rec: Recommendation, today: ISODate): number {
  return daysBetween(today, rec.actBy);
}

export function actByLabel(rec: Recommendation, today: ISODate): string {
  const d = daysToAct(rec, today);
  if (d <= 0) return "Act today";
  if (d === 1) return "Act by tomorrow";
  return `Act by ${weekdayDate(rec.actBy)}`;
}

function listNames(names: string[]): string {
  const unique = [...new Set(names)];
  if (unique.length === 0) return "Several bills";
  if (unique.length === 1) return unique[0];
  return `${unique.slice(0, -1).join(", ")} and ${unique[unique.length - 1].toLowerCase()}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
