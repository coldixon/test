import type { Dashboard } from "@/lib/engine";
import { money } from "@/lib/format";

export function DebtSavingsChart({ dashboard: d }: { dashboard: Dashboard }) {
  const hist = [...d.snapshot.history].sort((a, b) => a.month.localeCompare(b.month));
  if (hist.length === 0) return null;
  const maxDebt = Math.max(...hist.map((h) => h.totalDebt));
  const debtScale = Math.ceil(maxDebt / 10000) * 10000 || 10000;
  const goal = d.snapshot.goals[0];
  const saveScale = Math.max(goal?.target ?? 0, ...hist.map((h) => h.totalSavings)) || 1000;
  const first = hist[0];
  const last = hist[hist.length - 1];
  const label = (m: string) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(m.slice(5, 7)) - 1];
  const aria = `Debt fell from ${money(first.totalDebt)} in ${label(first.month)} to ${money(last.totalDebt)} in ${label(last.month)} while savings grew from ${money(first.totalSavings)} to ${money(last.totalSavings)}`;

  return (
    <section className="card" aria-labelledby="prog-h">
      <h2 className="card-title" id="prog-h">Debt down, savings up</h2>
      <div className="bars" role="img" aria-label={aria}>
        {hist.map((h) => (
          <div key={h.month} className="col">
            <div className="pair">
              <div className="bar-debt" style={{ height: `${Math.round((h.totalDebt / debtScale) * 130)}px` }} />
              <div className="bar-save" style={{ height: `${Math.max(2, Math.round((h.totalSavings / saveScale) * 130))}px` }} />
            </div>
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{label(h.month)}</span>
          </div>
        ))}
      </div>
      <div className="legend">
        <span><i style={{ background: "var(--navy)" }} />Debt (scaled to {money(debtScale)})</span>
        <span><i style={{ background: "var(--green-bar)" }} />Savings (scaled to {money(saveScale)} goal)</span>
      </div>
    </section>
  );
}
