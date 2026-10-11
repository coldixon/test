"use client";

import { CheckIcon, CircleIcon, HalfIcon } from "@/components/icons";
import { ForecastChart } from "@/components/home/ForecastChart";
import { ModeBanner } from "@/components/home/ModeBanner";
import { useHousehold } from "@/lib/state/household";
import { money, percent, shortMonthYear } from "@/lib/format";

export function PlanScreen() {
  const h = useHousehold();
  const d = h.dashboard;
  const s = h.snapshot;
  const cur = d.currentPlan;
  const av = d.avalanchePlan;
  const saved = Math.round(cur.totalInterest - av.totalInterest);

  return (
    <>
      <div className="stack-sm">
        <h1 className="page-title">Plan</h1>
        <p className="page-lede">Where the household is heading: the recovery milestones, the debt plan, and the cash-flow forecast out to 90 days.</p>
      </div>

      <ModeBanner dashboard={d} />

      <div className="two-col">
        <section className="card" aria-labelledby="ms-h">
          <h2 className="card-title" id="ms-h">Recovery milestones</h2>
          <div className="list">
            {d.milestones.milestones.map((m) => (
              <div key={m.id} className="list-row">
                <div className="row" style={{ flex: 1, minWidth: 0 }}>
                  {m.status === "done" ? <CheckIcon stroke="#237A4B" /> : m.status === "in_progress" ? <HalfIcon /> : <CircleIcon />}
                  <div>
                    <div className="n">{m.label}</div>
                    <div className="w">
                      {m.status === "done" ? "Done" : m.estimatedOn ? `Expected ${shortMonthYear(m.estimatedOn)}` : "No estimate yet"}
                      {m.progress && m.id === "utilisation" ? ` · ${m.progress.current}% now` : ""}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card" aria-labelledby="dp-h">
          <div className="card-head">
            <h2 className="card-title" id="dp-h">Debt plan</h2>
            <span className="card-sub">{money(s.monthlyExtraDebtPayment)}/mo beyond minimums</span>
          </div>
          <div className="table-wrap">
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Debt</th>
                  <th className="right">Balance</th>
                  <th className="right">Rate</th>
                  <th className="right">Current plan</th>
                  <th className="right">Avalanche</th>
                </tr>
              </thead>
              <tbody>
                {s.debts.map((debt) => (
                  <tr key={debt.id}>
                    <td>
                      {debt.name}
                      {debt.promo ? <span className="w" style={{ display: "block", fontSize: 11, color: "var(--ink-3)" }}>{percent(debt.promo.apr)} promo to {shortMonthYear(debt.promo.endsOn)}</span> : null}
                    </td>
                    <td className="right num">{money(debt.balance)}</td>
                    <td className="right num">{percent(debt.apr, 2)}</td>
                    <td className="right num">{cur.payoffDates[debt.id] ? shortMonthYear(cur.payoffDates[debt.id]!) : "—"}</td>
                    <td className="right num">{av.payoffDates[debt.id] ? shortMonthYear(av.payoffDates[debt.id]!) : "—"}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ fontWeight: 700 }}>Interest over the plan</td>
                  <td className="right num" style={{ fontWeight: 700 }}>{money(d.totalDebt)}</td>
                  <td />
                  <td className="right num" style={{ fontWeight: 700 }}>{money(cur.totalInterest)}</td>
                  <td className="right num" style={{ fontWeight: 700 }}>{money(av.totalInterest)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={`callout ${saved > 0 ? "callout-green" : "callout-grey"}`}>
            {saved > 0
              ? `Switching to the avalanche order (highest rate first, promo cards cleared before their promo ends) saves about ${money(saved)} in interest. Debt-free ${av.debtFreeOn ? shortMonthYear(av.debtFreeOn) : "—"} either way.`
              : "Your current order already matches the avalanche. Nothing to change."}
          </div>
        </section>
      </div>

      <ForecastChart snapshot={s} defaultDays={90} title="Cash-flow forecast" />
    </>
  );
}
