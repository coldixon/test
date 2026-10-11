import { describe, expect, it } from "vitest";
import { demoSnapshot } from "@/lib/data/demo";
import { computeDashboard } from "./index";
import { simulatePayoff } from "./debts";

describe("dashboard (demo household)", () => {
  const d = computeDashboard(demoSnapshot);

  it("summarises cash, debt and savings", () => {
    expect(d.availableCash).toBe(2460);
    expect(d.totalDebt).toBe(23840);
    expect(d.totalSavings).toBe(1350);
    expect(d.savingsThisMonth).toBe(300);
    expect(d.debtChangeSincePlanStart).toBe(-3570);
    expect(d.commitmentsTotal).toEqual({ done: 805, goal: 1100 });
  });

  it("reaches 3 of 6 recovery milestones", () => {
    expect(d.milestones.done).toBe(3);
    expect(d.milestones.total).toBe(6);
    expect(d.milestones.milestones.map((m) => m.status)).toEqual(["done", "done", "done", "in_progress", "pending", "pending"]);
  });

  it("is in Right the Ship, month 4, graduating when the Visa clears in October 2027", () => {
    expect(d.mode.mode).toBe("Right the Ship");
    expect(d.mode.monthNumber).toBe(4);
    expect(d.mode.next).toBe("Stay Ahead");
    expect(d.mode.graduationEstimate).toBe("2027-10-11");
    expect(d.currentPlan.payoffDates["debt-visa"]).toBe("2027-10-11");
    expect(d.mode.shiftDays).toBe(-21);
  });

  it("names the Visa, not the 0% store card, as the card to clear", () => {
    expect(d.milestones.milestones[5].label).toBe("Visa ••4412 paid off");
  });

  it("scores household health 58 with a +6 change", () => {
    expect(d.health.score).toBe(58);
    expect(d.health.delta).toBe(6);
    expect(d.health.components.reduce((s, c) => s + c.max, 0)).toBe(100);
  });
});

describe("payoff plans", () => {
  it("promo-aware avalanche clears the store card before its promo ends and costs less than the current plan", () => {
    const current = simulatePayoff(demoSnapshot.debts, { kind: "fixed", order: demoSnapshot.debtPlanOrder }, 650, demoSnapshot.asOf);
    const avalanche = simulatePayoff(demoSnapshot.debts, { kind: "avalanche" }, 650, demoSnapshot.asOf);
    expect(avalanche.payoffDates["debt-store"]! <= "2027-06-30").toBe(true);
    expect(avalanche.totalInterest).toBeLessThan(current.totalInterest);
    expect(Math.round(current.totalInterest - avalanche.totalInterest)).toBe(221);
    expect(avalanche.payoffDates["debt-visa"]! <= current.payoffDates["debt-visa"]!).toBe(true);
    expect(avalanche.promoSwitchMonths["debt-store"]).toBe("2027-03-11");
  });

  it("every debt is eventually paid in both plans", () => {
    const current = simulatePayoff(demoSnapshot.debts, { kind: "fixed", order: demoSnapshot.debtPlanOrder }, 650, demoSnapshot.asOf);
    expect(current.debtFreeOn).not.toBeNull();
    expect(Object.values(current.payoffDates).every(Boolean)).toBe(true);
  });
});
