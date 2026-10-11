import { describe, expect, it } from "vitest";
import { demoSnapshot } from "@/lib/data/demo";
import { simulateShiftPayment, applyShift } from "./simulate";
import { forecast } from "./forecast";
import { interestForDays } from "./debts";

describe("what-if: move part of a payment", () => {
  it("moving $200 of the Oct 20 extra payment to Nov 6 raises the low point by $200 for $2.61", () => {
    const r = simulateShiftPayment(demoSnapshot, { paymentId: "pp-visa-2026-10", amount: 200, toDate: "2026-11-06" });
    expect(r.lowBefore).toBe(1117);
    expect(r.lowAfter).toBe(1317);
    expect(r.lowDelta).toBe(200);
    expect(r.daysDeferred).toBe(17);
    expect(r.apr).toBe(0.2799);
    expect(r.interestCost).toBe(2.61);
    expect(r.after.safeToSpend).toBe(517);
  });

  it("keeps the total amount paid the same", () => {
    const r = simulateShiftPayment(demoSnapshot, { paymentId: "pp-visa-2026-10", amount: 200, toDate: "2026-11-06" });
    const before = demoSnapshot.plannedPayments.reduce((s, p) => s + p.amount, 0);
    const after = r.plannedPayments.reduce((s, p) => s + p.amount, 0);
    expect(after).toBe(before);
    expect(r.plannedPayments.find((p) => p.id === "pp-visa-2026-10")?.amount).toBe(450);
    expect(r.plannedPayments.find((p) => p.id === "pp-visa-2026-10:moved")?.date).toBe("2026-11-06");
  });

  it("accepting the move changes the forecast the dashboard sees", () => {
    const r = simulateShiftPayment(demoSnapshot, { paymentId: "pp-visa-2026-10", amount: 200, toDate: "2026-11-06" });
    const next = applyShift(demoSnapshot, r);
    expect(forecast(next, { days: 30 }).lowest.balance).toBe(1317);
  });

  it("caps the moved amount at the payment size", () => {
    const r = simulateShiftPayment(demoSnapshot, { paymentId: "pp-visa-2026-10", amount: 9999, toDate: "2026-11-06" });
    expect(r.amount).toBe(650);
  });

  it("computes simple daily interest", () => {
    expect(interestForDays(200, 0.2799, 17)).toBe(2.61);
    expect(interestForDays(1000, 0.1, 365)).toBe(100);
  });
});
