import { describe, expect, it } from "vitest";
import { demoSnapshot } from "@/lib/data/demo";
import { forecast, availableCash } from "./forecast";
import { upcomingBills, nextPayday } from "./schedule";

describe("forecast (demo household)", () => {
  it("starts from the shared checking balances", () => {
    expect(availableCash(demoSnapshot)).toBe(2460);
  });

  it("finds the 30-day low point of $1,117 on Nov 5 in the base case", () => {
    const f = forecast(demoSnapshot, { days: 30, scenario: "base" });
    expect(f.lowest.balance).toBe(1117);
    expect(f.lowest.date).toBe("2026-11-05");
    expect(f.safeToSpend).toBe(317);
    expect(f.breachesReserve).toBe(false);
  });

  it("is deterministic", () => {
    const a = forecast(demoSnapshot, { days: 60 });
    const b = forecast(demoSnapshot, { days: 60 });
    expect(a.points.map((p) => p.balance)).toEqual(b.points.map((p) => p.balance));
  });

  it("conservative case is never above base, optimistic never below", () => {
    for (const days of [7, 30, 60, 90]) {
      const base = forecast(demoSnapshot, { days, scenario: "base" });
      const cons = forecast(demoSnapshot, { days, scenario: "conservative" });
      const opt = forecast(demoSnapshot, { days, scenario: "optimistic" });
      for (let i = 0; i < base.points.length; i++) {
        expect(cons.points[i].balance).toBeLessThanOrEqual(base.points[i].balance);
        expect(opt.points[i].balance).toBeGreaterThanOrEqual(base.points[i].balance);
      }
    }
  });

  it("totals inflows and outflows consistently with the ending balance", () => {
    const f = forecast(demoSnapshot, { days: 90 });
    expect(Math.round(f.startingBalance + f.totalInflows - f.totalOutflows)).toBe(Math.round(f.endingBalance));
  });

  it("lands Maya's paychecks every 14 days from Oct 23 and Jordan's on the 15th and last day", () => {
    const f = forecast(demoSnapshot, { days: 60 });
    const paydays = f.points.filter((p) => p.inflow > 0).map((p) => `${p.date}:${p.inflow}`);
    expect(paydays).toEqual([
      "2026-10-15:1480",
      "2026-10-23:2040",
      "2026-10-31:1480",
      "2026-11-06:2040",
      "2026-11-15:1480",
      "2026-11-20:2040",
      "2026-11-30:1480",
      "2026-12-04:2040",
    ]);
  });

  it("lists the next bills in order with the estimate flagged", () => {
    const bills = upcomingBills(demoSnapshot);
    expect(bills.slice(0, 3).map((b) => [b.name, b.dueDate, b.amount])).toEqual([
      ["Student loan", "2026-10-12", 310],
      ["Visa ••4412 minimum", "2026-10-14", 145],
      ["Starter fund transfer", "2026-10-17", 300],
    ]);
    const electric = bills.find((b) => b.id === "bill-electric");
    expect(electric?.certainty).toBe("estimated");
    expect(electric?.dueDate).toBe("2026-10-18");
  });

  it("knows the next payday after the low point is Maya's on Nov 6", () => {
    expect(nextPayday(demoSnapshot, "2026-11-05")).toBe("2026-11-06");
    expect(nextPayday(demoSnapshot, "2026-11-05", "jordan")).toBe("2026-11-15");
  });
});
