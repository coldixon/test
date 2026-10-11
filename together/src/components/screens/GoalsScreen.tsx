"use client";

import { Commitments } from "@/components/home/Commitments";
import { addMonths } from "@/lib/engine/dates";
import { useHousehold } from "@/lib/state/household";
import { money, shortMonthYear } from "@/lib/format";

export function GoalsScreen() {
  const h = useHousehold();
  const d = h.dashboard;
  const s = h.snapshot;

  return (
    <>
      <div className="stack-sm">
        <h1 className="page-title">Goals</h1>
        <p className="page-lede">What each of you committed to this month, and the savings goals those commitments feed.</p>
      </div>

      <div className="two-col">
        <section className="card" aria-labelledby="sg-h">
          <h2 className="card-title" id="sg-h">Savings goals</h2>
          {s.goals.map((g) => {
            const p = g.target > 0 ? Math.min(1, g.balance / g.target) : 0;
            const monthsLeft = g.monthlyContribution > 0 ? Math.ceil(Math.max(0, g.target - g.balance) / g.monthlyContribution) : null;
            return (
              <div key={g.id} className="commit">
                <div className="line">
                  <span><strong>{g.name}</strong></span>
                  <span className="num" style={{ color: "var(--ink-2)" }}>{money(g.balance)} of {money(g.target)}</span>
                </div>
                <div className="bar" role="progressbar" aria-valuenow={g.balance} aria-valuemin={0} aria-valuemax={g.target} aria-label={g.name}>
                  <span style={{ width: `${Math.round(p * 100)}%`, background: p >= 1 ? "var(--green-bar)" : "var(--teal)" }} />
                </div>
                <div className="w" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                  {money(g.monthlyContribution)}/mo
                  {monthsLeft !== null && monthsLeft > 0 ? ` · full by ${shortMonthYear(addMonths(s.asOf, monthsLeft))}` : p >= 1 ? " · funded" : ""}
                </div>
              </div>
            );
          })}
          <div className="callout callout-grey">
            Debt is a goal too: {money(d.totalDebt)} today, {money(Math.abs(d.debtChangeSincePlanStart))} less than when the plan started
            {d.currentPlan.debtFreeOn ? `, and gone by ${shortMonthYear(d.currentPlan.debtFreeOn)} on the current plan` : ""}.
          </div>
        </section>

        <Commitments dashboard={d} />
      </div>

      <section className="card" aria-labelledby="pl-h">
        <h2 className="card-title" id="pl-h">Partner view</h2>
        <div className="two-col">
          {s.partners.map((p) => {
            const mine = s.commitments.filter((c) => c.partnerId === p.id && c.month === s.asOf.slice(0, 7));
            const done = mine.reduce((n, c) => n + c.done, 0);
            const goal = mine.reduce((n, c) => n + c.goal, 0);
            const bills = s.bills.filter((b) => b.payerId === p.id);
            const income = s.incomes.filter((i) => i.partnerId === p.id);
            return (
              <div key={p.id} className="stack-sm">
                <div className="row">
                  <span className="avatar" style={{ background: p.color }}>{p.initial}</span>
                  <strong>{p.name}</strong>
                </div>
                <div className="w" style={{ fontSize: 13, color: "var(--ink-2)" }}>
                  {money(done)} of {money(goal)} committed this month · pays {bills.length} bill{bills.length === 1 ? "" : "s"} · {income.length} income stream{income.length === 1 ? "" : "s"}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
