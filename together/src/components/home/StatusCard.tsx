import type { Dashboard } from "@/lib/engine";
import { money, shortDate, shortMonthYear } from "@/lib/format";

/** The mobile home card: mode, safe-to-spend and milestone progress in one place. */
export function StatusCard({ dashboard: d, className = "" }: { dashboard: Dashboard; className?: string }) {
  const f = d.base30;
  const pct = Math.round((d.milestones.done / d.milestones.total) * 100);
  return (
    <section className={`status-card ${className}`} aria-label="Safe to spend">
      <div className="between">
        <span className="pill pill-mode">{d.mode.mode}</span>
        <span className="dim">{d.mode.graduationEstimate ? `Graduate ~${shortMonthYear(d.mode.graduationEstimate)}` : d.mode.next ? `Next: ${d.mode.next}` : ""}</span>
      </div>
      <div className="dim" style={{ fontSize: 13, marginTop: 8 }}>Safe to spend until {shortDate(f.lowest.date)}</div>
      <div className={`big num ${f.safeToSpendRaw <= 0 ? "warn" : ""}`}>{money(f.safeToSpend)}</div>
      <div className="dim" style={{ fontSize: 13 }}>
        {f.breachesReserve
          ? `The ${money(f.reserve)} reserve is at risk: you dip ${money(f.breachBy)} below it on ${shortDate(f.lowest.date)}.`
          : `Bills, minimums, savings and your ${money(f.reserve)} reserve are already set aside.`}
      </div>
      <div className="bar on-dark" style={{ marginTop: 10 }} role="progressbar" aria-valuenow={d.milestones.done} aria-valuemin={0} aria-valuemax={d.milestones.total} aria-label="Recovery milestones">
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="dim">{d.milestones.done} of {d.milestones.total} recovery milestones reached</div>
    </section>
  );
}
