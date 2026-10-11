import { describe, expect, it } from "vitest";
import { demoSnapshot } from "@/lib/data/demo";
import { guardNumbers } from "./numberGuard";
import { runRules } from "./rules";
import { guardedExplainer, templateExplainer } from "./explain";

describe("rules", () => {
  const recs = runRules(demoSnapshot);

  it("produces the three recommendations for the demo household, cash protection first", () => {
    expect(recs.map((r) => r.ruleId)).toEqual(["cash_protection", "debt_allocation", "subscriptions"]);
  });

  it("cash protection moves $200 of the Oct 20 payment to Nov 6 and quotes engine numbers", () => {
    const rec = recs[0];
    expect(rec.title).toBe("Move $200 of the Oct 20 Visa ••4412 extra payment to Nov 6");
    expect(rec.action).toEqual({ type: "shift_payment", paymentId: "pp-visa-2026-10", amount: 200, toDate: "2026-11-06" });
    expect(rec.facts.lowDelta).toBe(200);
    expect(rec.facts.interestCost).toBe(2.61);
    expect(rec.impact).toBe("Low point rises by $200 · costs about $2.61 in interest");
    expect(rec.why).toBe("Rent and car loan land Nov 1–5, before Maya's Nov 6 paycheck. That is your tightest week of the next 90 days.");
    expect(rec.actBy).toBe("2026-10-18");
    expect(rec.approval).toBe("one_partner");
  });

  it("debt allocation points November's extra payment at the 27.99% card and quotes the saving", () => {
    const rec = recs[1];
    expect(rec.title).toContain("Send November's extra $650 to Visa ••4412 (27.99% APR) instead of the store card");
    expect(rec.facts.interestSaved).toBeGreaterThan(100);
    expect(rec.impact).toBe(`Saves an estimated $${rec.facts.interestSaved} in interest over the plan`);
    expect(rec.risk).toMatch(/Together will remind you in (January|February|March|April)/);
    expect(rec.approval).toBe("both_partners");
  });

  it("subscriptions rule finds the $47 overlap and frees the most expensive service", () => {
    const rec = recs[2];
    expect(rec.why).toBe("Together found $47/mo in overlapping subscriptions across both partners' cards.");
    expect(rec.impact).toBe("$16.99/mo freed, about $204 a year");
    expect(rec.approval).toBe("none");
  });

  it("every recommendation's own wording passes the number guard", () => {
    for (const rec of recs) {
      for (const text of [rec.title, rec.why, rec.impact, rec.assumptions, rec.risk]) {
        const r = guardNumbers(text, rec.facts);
        expect(r.offending, `${rec.id}: "${text}"`).toEqual([]);
      }
    }
  });

  it("dismissed recommendations stay quiet", () => {
    const left = runRules(demoSnapshot, { dismissedIds: [recs[0].id] });
    expect(left.map((r) => r.ruleId)).toEqual(["debt_allocation", "subscriptions"]);
  });

  it("stays quiet when the household already has comfortable room", () => {
    const roomy = { ...demoSnapshot, settings: { ...demoSnapshot.settings, comfortBuffer: 100 } };
    expect(runRules(roomy).find((r) => r.ruleId === "cash_protection")).toBeUndefined();
  });
});

describe("number guard", () => {
  const facts = { amount: 200, lowDelta: 200, interestCost: 2.61, apr: 0.2799 };

  it("accepts numbers the engine produced, in any common format", () => {
    expect(guardNumbers("Moving $200 raises your low point by $200.00 for about $2.61 (27.99% APR).", facts).ok).toBe(true);
  });

  it("ignores dates", () => {
    expect(guardNumbers("Rent lands Nov 1 and the Nov 6 paycheck follows; the promo ends June 2027.", facts).ok).toBe(true);
  });

  it("rejects a number the engine did not produce", () => {
    const r = guardNumbers("This saves you about $35 a month.", facts);
    expect(r.ok).toBe(false);
    expect(r.offending).toEqual(["$35"]);
  });
});

describe("explainers", () => {
  const rec = runRules(demoSnapshot)[0];

  it("template explainer restates the rule's own text", async () => {
    const e = await templateExplainer(rec);
    expect(e.origin).toBe("template");
    expect(e.text).toContain("$2.61");
  });

  it("guarded explainer keeps a model reply that only uses engine numbers", async () => {
    const explain = guardedExplainer(async () => "Shifting $200 lifts your low point by $200 and costs about $2.61 in interest.");
    const e = await explain(rec);
    expect(e.origin).toBe("model");
  });

  it("guarded explainer rejects a model reply with an invented number and falls back", async () => {
    const explain = guardedExplainer(async () => "Shifting $200 lifts your low point by $250 and costs about $2.61 in interest.");
    const e = await explain(rec);
    expect(e.origin).toBe("model_rejected");
    expect(e.rejected).toEqual(["$250"]);
    expect(e.text).toContain("$200");
  });

  it("guarded explainer falls back when the generator fails", async () => {
    const explain = guardedExplainer(async () => {
      throw new Error("network");
    });
    expect((await explain(rec)).origin).toBe("template");
  });
});
