import type { Dashboard } from "@/lib/engine";
import { addMonths } from "@/lib/engine/dates";
import { money, monthName, shortDate, weekdayDate } from "@/lib/format";

export function SafeToSpendHero({ dashboard: d }: { dashboard: Dashboard }) {
  const f = d.base30;
  return (
    <div className="card hero">
      <div className="label">Safe to spend until {shortDate(f.lowest.date)}</div>
      <div className={`big num ${f.safeToSpendRaw <= 0 ? "warn" : ""}`}>{money(f.safeToSpend)}</div>
      <div className="detail">
        Beyond planned spending, after every bill, minimum payment and savings transfer, while keeping your {money(f.reserve)} protected reserve. Base forecast.
      </div>
    </div>
  );
}

export function KpiTiles({ dashboard: d }: { dashboard: Dashboard }) {
  const f = d.base30;
  const sharedChecking = d.snapshot.accounts.filter((a) => a.visibility === "shared" && a.kind === "checking").length;
  const prevReview = monthName(addMonths(d.snapshot.asOf, -1));
  const lowColor = f.breachesReserve ? "var(--orange)" : "var(--teal)";
  return (
    <div className="kpi-grid">
      <div className="tile">
        <span className="label">Available cash</span>
        <span className="value num">{money(d.availableCash)}</span>
        <span className="sub">{sharedChecking} shared accounts · confirmed</span>
      </div>
      <div className="tile">
        <span className="label">Lowest projected</span>
        <span className="value num" style={{ color: lowColor }}>{money(f.lowest.balance)}</span>
        <span className="sub">{weekdayDate(f.lowest.date)} · forecast</span>
      </div>
      <div className="tile">
        <span className="label">Total debt</span>
        <span className="value num">{money(d.totalDebt)}</span>
        <span className={`sub ${d.debtChangeSincePlanStart < 0 ? "good" : "warn"}`}>
          {money(d.debtChangeSincePlanStart, { sign: true })} since {d.planStartMonthLabel.slice(0, 3)}
        </span>
      </div>
      <div className="tile">
        <span className="label">Savings</span>
        <span className="value num">{money(d.totalSavings)}</span>
        <span className={`sub ${d.savingsThisMonth >= 0 ? "good" : "warn"}`}>{money(d.savingsThisMonth, { sign: true })} this month</span>
      </div>
      <div className="tile">
        <span className="label">Household health</span>
        <span className="value num">
          {d.health.score}
          <small> / 100</small>
        </span>
        {d.health.delta !== null ? (
          <span className={`sub ${d.health.delta >= 0 ? "good" : "warn"}`}>
            {d.health.delta >= 0 ? "+" : "−"}{Math.abs(d.health.delta)} since {prevReview}
          </span>
        ) : (
          <span className="sub">First month measured</span>
        )}
      </div>
    </div>
  );
}
