import type { Dashboard } from "@/lib/engine";
import { daysInMonth } from "@/lib/engine/dates";
import { dayOfMonth, money, monthName, monthYear } from "@/lib/format";

const KIND_LABEL = { debt_payoff: "debt payoff", savings: "savings" } as const;

export function Commitments({ dashboard: d, showFooter = true }: { dashboard: Dashboard; showFooter?: boolean }) {
  const s = d.snapshot;
  const month = s.asOf.slice(0, 7);
  const items = s.commitments.filter((c) => c.month === month);
  const daysLeft = daysInMonth(s.asOf) - dayOfMonth(s.asOf);
  return (
    <section className="card" aria-labelledby="com-h">
      <div className="card-head">
        <h2 className="card-title" id="com-h">{monthName(s.asOf)} commitments</h2>
        <span className="card-sub">{daysLeft} days left</span>
      </div>
      {items.map((c) => {
        const partner = s.partners.find((p) => p.id === c.partnerId);
        const p = c.goal > 0 ? Math.min(1, c.done / c.goal) : 0;
        return (
          <div key={c.id} className="commit">
            <div className="line">
              <span>
                <strong>{partner?.name ?? c.partnerId}</strong> · {KIND_LABEL[c.kind]}
              </span>
              <span className="num" style={{ color: "var(--ink-2)" }}>
                {money(c.done)} of {money(c.goal)}
              </span>
            </div>
            <div className="bar" role="progressbar" aria-valuenow={c.done} aria-valuemin={0} aria-valuemax={c.goal} aria-label={`${partner?.name ?? ""} ${KIND_LABEL[c.kind]}`}>
              <span style={{ width: `${Math.round(p * 100)}%`, background: p >= 1 ? "var(--green-bar)" : "var(--teal)" }} />
            </div>
          </div>
        );
      })}
      {showFooter && (
        <div className="footnote" style={{ fontSize: 13, color: "var(--ink-2)", borderTop: "1px solid var(--line-2)", paddingTop: 12 }}>
          Household: <strong className="num">{money(d.commitmentsTotal.done)} of {money(d.commitmentsTotal.goal)}</strong> committed this month.
          {d.mode.graduationEstimate ? ` On pace for the ${monthYear(d.mode.graduationEstimate)} date.` : ""}
        </div>
      )}
    </section>
  );
}
