/**
 * Core domain types for the Together calculation engine.
 *
 * Everything the engine needs is expressed in a `HouseholdSnapshot`: a plain,
 * serialisable description of a household's money on a given day. The data
 * layer builds a snapshot from Supabase (or the demo fixtures); the engine is
 * pure and never touches a database or the network.
 *
 * Dates are ISO calendar dates (`YYYY-MM-DD`). Money is in whole currency
 * units as JavaScript numbers; the engine rounds to cents where it matters.
 */

export type ISODate = string; // YYYY-MM-DD

export type Scenario = "base" | "conservative" | "optimistic";

export type PartnerId = string;

export interface Partner {
  id: PartnerId;
  name: string;
  /** Single letter used for avatars. */
  initial: string;
  /** Accent colour for avatars and commitment bars. */
  color: string;
}

export type IncomeCadence = "biweekly" | "semimonthly" | "monthly" | "weekly";

export interface IncomeStream {
  id: string;
  partnerId: PartnerId;
  name: string;
  amount: number;
  cadence: IncomeCadence;
  /**
   * Anchor for weekly/biweekly cadences: a known past or future pay date.
   * For semimonthly, the two days of month (`[15, 31]`; 31 means "last day").
   * For monthly, a single day of month.
   */
  anchorDate?: ISODate;
  daysOfMonth?: number[];
}

export type PayMethod =
  | "bank_autopay"
  | "together_pay"
  | "manual"
  | "awaiting_approval";

export type Certainty = "confirmed" | "estimated" | "planned";

export interface Bill {
  id: string;
  name: string;
  category: string;
  amount: number;
  /** Day of month the bill is due (1–31; 31 clamps to month end). */
  dueDay: number;
  certainty: Certainty;
  /** Which partner is responsible. `null` means shared. */
  payerId: PartnerId | null;
  payMethod: PayMethod;
  /** Debt this bill services, if any (links minimum payments to balances). */
  debtId?: string;
}

/**
 * A planned, one-off or recurring outflow that is not a bill: an extra debt
 * payment, a savings transfer. These are what recommendations may move.
 */
export interface PlannedPayment {
  id: string;
  name: string;
  amount: number;
  date: ISODate;
  kind: "extra_debt_payment" | "savings_transfer";
  /** Debt or goal this targets. */
  targetId: string;
  /** Can Together suggest moving this? (Minimums are never flexible.) */
  flexible: boolean;
  approval: "none" | "one_partner" | "both_partners";
  status: "scheduled" | "awaiting_approval" | "paid" | "cancelled";
}

export interface Debt {
  id: string;
  name: string;
  kind: "credit_card" | "store_card" | "student_loan" | "auto_loan" | "other";
  balance: number;
  /** Annual percentage rate as a fraction, e.g. 0.2799. */
  apr: number;
  minimumPayment: number;
  creditLimit?: number;
  /** Promotional rate details, if any. */
  promo?: { apr: number; endsOn: ISODate };
  ownerId: PartnerId | null;
}

export interface SavingsGoal {
  id: string;
  name: string;
  balance: number;
  target: number;
  monthlyContribution: number;
}

export interface RecurringCharge {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  partnerId: PartnerId;
  cardLabel: string;
  lastChargedOn: ISODate;
  occurrences: number;
}

export interface Commitment {
  id: string;
  partnerId: PartnerId;
  kind: "debt_payoff" | "savings";
  /** Month in YYYY-MM form. */
  month: string;
  goal: number;
  done: number;
}

export interface MonthHistoryPoint {
  /** YYYY-MM */
  month: string;
  totalDebt: number;
  totalSavings: number;
  /** Net cash flow for the month; positive means income exceeded spending. */
  netCashFlow: number;
  /** Was the protected reserve held for the whole month? */
  reserveHeld: boolean;
  overdueBills: number;
}

export type ModeName =
  | "Stabilise"
  | "Right the Ship"
  | "Stay Ahead"
  | "Build Wealth";

export interface ModeRecord {
  mode: ModeName;
  since: ISODate;
  /** The graduation estimate as it stood at the previous month's review. */
  previousEstimate?: ISODate;
  previousEstimateNote?: string;
}

export interface HouseholdSettings {
  /** Cash that is never counted as spendable. */
  protectedReserve: number;
  /** Below this safe-to-spend figure the assistant looks for cash-protection moves. */
  comfortBuffer: number;
  /** Average daily everyday spending outside of bills. */
  dailyDiscretionary: number;
  /** Per-transaction cap for Together pay. */
  paymentCap: number;
}

export interface Account {
  id: string;
  name: string;
  institution: string;
  kind: "checking" | "savings" | "credit_card" | "loan";
  balance: number;
  /** Shared accounts count toward household cash; private ones do not. */
  visibility: "shared" | "private";
  ownerId: PartnerId | null;
  lastSyncedAt: string;
}

export interface HouseholdSnapshot {
  householdId: string;
  name: string;
  /** The "today" the engine forecasts from. */
  asOf: ISODate;
  /** Wall-clock time the snapshot was taken (ISO datetime), for "synced N min ago". */
  clock?: string;
  partners: Partner[];
  settings: HouseholdSettings;
  accounts: Account[];
  incomes: IncomeStream[];
  bills: Bill[];
  plannedPayments: PlannedPayment[];
  debts: Debt[];
  goals: SavingsGoal[];
  recurringCharges: RecurringCharge[];
  commitments: Commitment[];
  history: MonthHistoryPoint[];
  mode: ModeRecord;
  /** Health score recorded at the last monthly review, for the delta. */
  previousHealthScore?: number;
  /** Debt plan: which debt gets extra payments first under the current plan. */
  debtPlanOrder: string[];
  /** Monthly extra amount the household commits beyond minimums. */
  monthlyExtraDebtPayment: number;
}

/* ---------- Engine outputs ---------- */

export interface ForecastPoint {
  dayIndex: number;
  date: ISODate;
  balance: number;
  inflow: number;
  outflow: number;
  /** Labels of the events that landed on this day, for tooltips and audit. */
  events: string[];
}

export interface Forecast {
  scenario: Scenario;
  days: number;
  start: ISODate;
  end: ISODate;
  points: ForecastPoint[];
  startingBalance: number;
  endingBalance: number;
  totalInflows: number;
  totalOutflows: number;
  lowest: ForecastPoint;
  reserve: number;
  /** Lowest balance minus the protected reserve, floored at zero for display. */
  safeToSpend: number;
  /** Raw (possibly negative) safe-to-spend. */
  safeToSpendRaw: number;
  breachesReserve: boolean;
  breachBy: number;
}

export interface UpcomingBill {
  id: string;
  name: string;
  category: string;
  dueDate: ISODate;
  amount: number;
  certainty: Certainty;
  payerId: PartnerId | null;
  payMethod: PayMethod;
  kind: "bill" | "planned";
}
