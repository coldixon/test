import type { HouseholdSnapshot } from "@/lib/engine/types";

/**
 * The demo household: Maya & Jordan, as of 11 October 2026.
 *
 * Every number on the home screen is derived from this snapshot by the
 * engine. Nothing in the UI is hard-coded.
 */
export const DEMO_AS_OF = "2026-10-11";

export const demoSnapshot: HouseholdSnapshot = {
  householdId: "demo-household",
  name: "Maya & Jordan",
  asOf: DEMO_AS_OF,
  clock: "2026-10-11T14:58:00Z",
  partners: [
    { id: "maya", name: "Maya", initial: "M", color: "#0B6E6E" },
    { id: "jordan", name: "Jordan", initial: "J", color: "#0F1E33" },
  ],
  settings: {
    protectedReserve: 800,
    comfortBuffer: 500,
    dailyDiscretionary: 66,
    paymentCap: 2500,
  },
  accounts: [
    { id: "acc-joint", name: "Joint checking", institution: "Harbor Bank", kind: "checking", balance: 1460, visibility: "shared", ownerId: null, lastSyncedAt: "2026-10-11T14:52:00Z" },
    { id: "acc-maya-chk", name: "Maya's checking", institution: "Harbor Bank", kind: "checking", balance: 620, visibility: "shared", ownerId: "maya", lastSyncedAt: "2026-10-11T14:52:00Z" },
    { id: "acc-jordan-chk", name: "Jordan's checking", institution: "Northline Credit Union", kind: "checking", balance: 380, visibility: "shared", ownerId: "jordan", lastSyncedAt: "2026-10-11T14:51:00Z" },
    { id: "acc-starter", name: "Starter fund", institution: "Harbor Bank", kind: "savings", balance: 1350, visibility: "shared", ownerId: null, lastSyncedAt: "2026-10-11T14:52:00Z" },
    { id: "acc-visa", name: "Visa ••4412", institution: "Harbor Bank", kind: "credit_card", balance: -6240, visibility: "shared", ownerId: null, lastSyncedAt: "2026-10-11T14:50:00Z" },
    { id: "acc-store", name: "Store card ••0177", institution: "Fielding's", kind: "credit_card", balance: -2100, visibility: "shared", ownerId: "jordan", lastSyncedAt: "2026-10-11T14:49:00Z" },
    { id: "acc-student", name: "Student loan", institution: "EduServ", kind: "loan", balance: -9800, visibility: "shared", ownerId: "jordan", lastSyncedAt: "2026-10-11T14:48:00Z" },
    { id: "acc-auto", name: "Car loan", institution: "Northline Credit Union", kind: "loan", balance: -5700, visibility: "shared", ownerId: null, lastSyncedAt: "2026-10-11T14:51:00Z" },
  ],
  incomes: [
    { id: "inc-maya", partnerId: "maya", name: "Maya's paycheck", amount: 2040, cadence: "biweekly", anchorDate: "2026-10-23" },
    { id: "inc-jordan", partnerId: "jordan", name: "Jordan's paycheck", amount: 1480, cadence: "semimonthly", daysOfMonth: [15, 31] },
  ],
  bills: [
    { id: "bill-rent", name: "Rent", category: "Housing", amount: 2350, dueDay: 1, certainty: "confirmed", payerId: null, payMethod: "together_pay" },
    { id: "bill-car", name: "Car loan", category: "Transport", amount: 412, dueDay: 5, certainty: "confirmed", payerId: null, payMethod: "bank_autopay", debtId: "debt-auto" },
    { id: "bill-insurance", name: "Car insurance", category: "Insurance", amount: 238, dueDay: 9, certainty: "confirmed", payerId: null, payMethod: "bank_autopay" },
    { id: "bill-student", name: "Student loan", category: "Education", amount: 310, dueDay: 12, certainty: "confirmed", payerId: "jordan", payMethod: "bank_autopay", debtId: "debt-student" },
    { id: "bill-visa-min", name: "Visa ••4412 minimum", category: "Debt · joint card", amount: 145, dueDay: 14, certainty: "confirmed", payerId: "maya", payMethod: "together_pay", debtId: "debt-visa" },
    { id: "bill-electric", name: "Electric & gas", category: "Utilities", amount: 186, dueDay: 18, certainty: "estimated", payerId: null, payMethod: "manual" },
    { id: "bill-internet", name: "Internet & phone", category: "Utilities", amount: 164, dueDay: 22, certainty: "confirmed", payerId: "jordan", payMethod: "bank_autopay" },
    { id: "bill-store-min", name: "Store card minimum", category: "Debt · Jordan", amount: 35, dueDay: 24, certainty: "confirmed", payerId: "jordan", payMethod: "bank_autopay", debtId: "debt-store" },
    { id: "bill-subs", name: "Subscriptions", category: "Entertainment", amount: 61, dueDay: 24, certainty: "confirmed", payerId: "maya", payMethod: "bank_autopay" },
    { id: "bill-gym", name: "Gym", category: "Health", amount: 80, dueDay: 27, certainty: "confirmed", payerId: null, payMethod: "bank_autopay" },
  ],
  plannedPayments: [
    { id: "pp-visa-2026-10", name: "Visa ••4412 extra payment", amount: 650, date: "2026-10-20", kind: "extra_debt_payment", targetId: "debt-visa", flexible: true, approval: "one_partner", status: "awaiting_approval" },
    { id: "pp-starter-2026-10", name: "Starter fund transfer", amount: 300, date: "2026-10-17", kind: "savings_transfer", targetId: "goal-starter", flexible: false, approval: "none", status: "scheduled" },
    { id: "pp-extra-2026-11", name: "Store card extra payment", amount: 650, date: "2026-11-20", kind: "extra_debt_payment", targetId: "debt-store", flexible: true, approval: "one_partner", status: "scheduled" },
    { id: "pp-starter-2026-11", name: "Starter fund transfer", amount: 300, date: "2026-11-17", kind: "savings_transfer", targetId: "goal-starter", flexible: false, approval: "none", status: "scheduled" },
    { id: "pp-extra-2026-12", name: "Store card extra payment", amount: 650, date: "2026-12-20", kind: "extra_debt_payment", targetId: "debt-store", flexible: true, approval: "one_partner", status: "scheduled" },
    { id: "pp-starter-2026-12", name: "Starter fund transfer", amount: 300, date: "2026-12-17", kind: "savings_transfer", targetId: "goal-starter", flexible: false, approval: "none", status: "scheduled" },
    { id: "pp-extra-2027-01", name: "Store card extra payment", amount: 650, date: "2027-01-20", kind: "extra_debt_payment", targetId: "debt-store", flexible: true, approval: "one_partner", status: "scheduled" },
    { id: "pp-starter-2027-01", name: "Starter fund transfer", amount: 300, date: "2027-01-17", kind: "savings_transfer", targetId: "goal-starter", flexible: false, approval: "none", status: "scheduled" },
  ],
  debts: [
    { id: "debt-visa", name: "Visa ••4412", kind: "credit_card", balance: 6240, apr: 0.2799, minimumPayment: 145, creditLimit: 8000, ownerId: null },
    { id: "debt-store", name: "Store card", kind: "store_card", balance: 2100, apr: 0.2999, minimumPayment: 35, creditLimit: 3000, promo: { apr: 0, endsOn: "2027-06-30" }, ownerId: "jordan" },
    { id: "debt-student", name: "Student loan", kind: "student_loan", balance: 9800, apr: 0.055, minimumPayment: 310, ownerId: "jordan" },
    { id: "debt-auto", name: "Car loan", kind: "auto_loan", balance: 5700, apr: 0.069, minimumPayment: 412, ownerId: null },
  ],
  goals: [{ id: "goal-starter", name: "Starter fund", balance: 1350, target: 3000, monthlyContribution: 300 }],
  recurringCharges: [
    { id: "rc-streamly", merchant: "Streamly", amount: 16.99, category: "streaming", partnerId: "maya", cardLabel: "Visa ••4412", lastChargedOn: "2026-10-03", occurrences: 3 },
    { id: "rc-boxd", merchant: "Boxd TV", amount: 15.49, category: "streaming", partnerId: "jordan", cardLabel: "Debit ••8821", lastChargedOn: "2026-10-07", occurrences: 3 },
    { id: "rc-vue", merchant: "Vue+", amount: 14.52, category: "streaming", partnerId: "maya", cardLabel: "Visa ••4412", lastChargedOn: "2026-10-09", occurrences: 3 },
    { id: "rc-cloud", merchant: "Cloud storage", amount: 9.99, category: "software", partnerId: "maya", cardLabel: "Visa ••4412", lastChargedOn: "2026-10-02", occurrences: 6 },
    { id: "rc-music", merchant: "Music", amount: 4.01, category: "music", partnerId: "jordan", cardLabel: "Debit ••8821", lastChargedOn: "2026-10-05", occurrences: 6 },
  ],
  commitments: [
    { id: "c-maya-debt", partnerId: "maya", kind: "debt_payoff", month: "2026-10", goal: 400, done: 400 },
    { id: "c-maya-sav", partnerId: "maya", kind: "savings", month: "2026-10", goal: 150, done: 150 },
    { id: "c-jordan-debt", partnerId: "jordan", kind: "debt_payoff", month: "2026-10", goal: 300, done: 180 },
    { id: "c-jordan-sav", partnerId: "jordan", kind: "savings", month: "2026-10", goal: 250, done: 75 },
  ],
  history: [
    { month: "2026-05", totalDebt: 27410, totalSavings: 0, netCashFlow: -120, reserveHeld: false, overdueBills: 1 },
    { month: "2026-06", totalDebt: 26720, totalSavings: 150, netCashFlow: -40, reserveHeld: false, overdueBills: 0 },
    { month: "2026-07", totalDebt: 26010, totalSavings: 450, netCashFlow: 210, reserveHeld: true, overdueBills: 0 },
    { month: "2026-08", totalDebt: 25280, totalSavings: 750, netCashFlow: 180, reserveHeld: true, overdueBills: 0 },
    { month: "2026-09", totalDebt: 24560, totalSavings: 1050, netCashFlow: 260, reserveHeld: true, overdueBills: 0 },
    { month: "2026-10", totalDebt: 23840, totalSavings: 1350, netCashFlow: 90, reserveHeld: true, overdueBills: 0 },
  ],
  mode: {
    mode: "Right the Ship",
    since: "2026-07-01",
    // Set after the September review; the engine compares its current estimate against it.
    previousEstimate: "2027-11-01",
    previousEstimateNote: "Jordan's commitment went up $50/mo.",
  },
  previousHealthScore: 52,
  debtPlanOrder: ["debt-store", "debt-visa", "debt-student", "debt-auto"],
  monthlyExtraDebtPayment: 650,
};
