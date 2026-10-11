import { cardUtilisation } from "./debts";
import type { Forecast, HouseholdSnapshot } from "./types";

export interface HealthComponent {
  id: string;
  label: string;
  /** Points earned. */
  points: number;
  /** Points available. */
  max: number;
  detail: string;
}

export interface HealthScore {
  score: number;
  previous: number | null;
  delta: number | null;
  components: HealthComponent[];
}

/** Monthly take-home income across all streams. */
export function monthlyIncome(snapshot: HouseholdSnapshot): number {
  return snapshot.incomes.reduce((s, inc) => {
    switch (inc.cadence) {
      case "weekly":
        return s + (inc.amount * 52) / 12;
      case "biweekly":
        return s + (inc.amount * 26) / 12;
      case "semimonthly":
        return s + inc.amount * 2;
      default:
        return s + inc.amount;
    }
  }, 0);
}

/**
 * Together's household health score (0–100). It is not a credit score: it
 * measures how much room the household has, from six plain components.
 */
export function healthScore(snapshot: HouseholdSnapshot, base30: Forecast): HealthScore {
  const reserve = snapshot.settings.protectedReserve;
  const history = [...snapshot.history].sort((a, b) => a.month.localeCompare(b.month)).filter((h) => h.month < snapshot.asOf.slice(0, 7));

  // 1. Reserve cover: how far the projected low point sits above the reserve (full marks at 2× reserve).
  const cover = reserve > 0 ? Math.max(0, Math.min(1, base30.lowest.balance / (reserve * 2))) : 1;

  // 2. Positive cash flow streak (full marks at 6 months).
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].netCashFlow > 0) streak++;
    else break;
  }
  const streakScore = Math.min(1, streak / 6);

  // 3. Card utilisation (lower is better).
  const util = cardUtilisation(snapshot.debts);
  const utilScore = util === null ? 1 : Math.max(0, 1 - util);

  // 4. Debt payments as a share of income (full marks under 0%, nothing at 50%).
  const income = monthlyIncome(snapshot);
  const debtPayments = snapshot.debts.reduce((s, d) => s + (d.balance > 0 ? d.minimumPayment : 0), 0);
  const dti = income > 0 ? debtPayments / income : 1;
  const dtiScore = Math.max(0, Math.min(1, 1 - dti / 0.5));

  // 5. Emergency savings progress toward the first goal.
  const goal = snapshot.goals[0];
  const savingsScore = goal && goal.target > 0 ? Math.min(1, goal.balance / goal.target) : 0;

  // 6. Bills paid on time last month.
  const onTime = (history[history.length - 1]?.overdueBills ?? 0) === 0 ? 1 : 0;

  const components: HealthComponent[] = [
    { id: "reserve", label: "Reserve cover", points: cover * 20, max: 20, detail: `Low point ${money(base30.lowest.balance)} vs ${money(reserve)} reserve` },
    { id: "cashflow", label: "Positive cash flow", points: streakScore * 15, max: 15, detail: `${streak} month${streak === 1 ? "" : "s"} in a row` },
    { id: "utilisation", label: "Card utilization", points: utilScore * 20, max: 20, detail: util === null ? "No card limits known" : `${Math.round(util * 100)}% of limits used` },
    { id: "dti", label: "Debt payments vs income", points: dtiScore * 20, max: 20, detail: `${Math.round(dti * 100)}% of monthly income` },
    { id: "savings", label: "Starter fund", points: savingsScore * 15, max: 15, detail: goal ? `${money(goal.balance)} of ${money(goal.target)}` : "No goal yet" },
    { id: "ontime", label: "Bills on time", points: onTime * 10, max: 10, detail: onTime ? "Nothing overdue last month" : "Overdue bills last month" },
  ];
  const score = Math.round(components.reduce((s, c) => s + c.points, 0));
  const previous = snapshot.previousHealthScore ?? null;
  return {
    score,
    previous,
    delta: previous === null ? null : score - previous,
    components: components.map((c) => ({ ...c, points: Math.round(c.points * 10) / 10 })),
  };
}

function money(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}
