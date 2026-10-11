"use client";

import { DebtSavingsChart } from "@/components/home/DebtSavingsChart";
import { useHousehold } from "@/lib/state/household";
import { money, shortDate } from "@/lib/format";

export function InsightsScreen() {
  const h = useHousehold();
  const d = h.dashboard;
  const s = h.snapshot;
  const subs = [...s.recurringCharges].sort((a, b) => b.amount - a.amount);
  const subsTotal = subs.reduce((n, c) => n + c.amount, 0);

  return (
    <>
      <div className="stack-sm">
        <h1 className="page-title">Insights</h1>
        <p className="page-lede">How the household health score is built, what is moving, and the decisions you have made so far.</p>
      </div>

      <div className="two-col">
        <section className="card" aria-labelledby="hs-h">
          <div className="card-head">
            <h2 className="card-title" id="hs-h">Household health</h2>
            <span className="num" style={{ fontSize: 26, fontWeight: 700 }}>
              {d.health.score}
              <span style={{ fontSize: 15, color: "var(--ink-3)", fontWeight: 500 }}> / 100</span>
            </span>
          </div>
          {d.health.components.map((c) => (
            <div key={c.id} className="score-row">
              <span>
                <strong>{c.label}</strong>
                <span className="w" style={{ display: "block", fontSize: 12, color: "var(--ink-3)" }}>{c.detail}</span>
              </span>
              <span className="num" style={{ color: "var(--ink-2)" }}>{c.points} / {c.max}</span>
              <div className="bar" role="progressbar" aria-valuenow={c.points} aria-valuemin={0} aria-valuemax={c.max} aria-label={c.label}>
                <span style={{ width: `${Math.round((c.points / c.max) * 100)}%` }} />
              </div>
            </div>
          ))}
          <p className="footnote">Together&apos;s own measure of room to breathe, not a credit score. {d.health.previous !== null ? `Last review: ${d.health.previous}.` : ""}</p>
        </section>

        <div className="stack">
          <DebtSavingsChart dashboard={d} />
          <section className="card" aria-labelledby="sub-h">
            <div className="card-head">
              <h2 className="card-title" id="sub-h">Recurring charges</h2>
              <span className="card-sub num">{money(subsTotal)}/mo</span>
            </div>
            <div className="list">
              {subs.map((c) => (
                <div key={c.id} className="list-row">
                  <div>
                    <div className="n">{c.merchant}</div>
                    <div className="w">
                      {c.category} · {s.partners.find((p) => p.id === c.partnerId)?.name} · {c.cardLabel} · last {shortDate(c.lastChargedOn)}
                    </div>
                  </div>
                  <div className="num" style={{ fontWeight: 700 }}>{money(c.amount, { cents: true })}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="card" aria-labelledby="dec-h">
        <div className="card-head">
          <h2 className="card-title" id="dec-h">Your decisions</h2>
          {h.decisions.length > 0 && (
            <button type="button" className="btn btn-secondary" style={{ minHeight: 36, padding: "6px 12px", fontSize: 13 }} onClick={h.reset}>
              Reset demo
            </button>
          )}
        </div>
        {h.decisions.length === 0 ? (
          <p className="footnote">Nothing yet. Accept or dismiss a recommendation on Home and it shows up here.</p>
        ) : (
          <div className="list">
            {h.decisions.map((dec, i) => {
              const rec = h.accepted[dec.id]?.rec;
              return (
                <div key={i} className="list-row">
                  <div>
                    <div className="n">{rec?.title ?? dec.id}</div>
                    <div className="w">{dec.type === "accept" ? "Accepted" : "Dismissed"} by {s.partners.find((p) => p.id === dec.by)?.name ?? dec.by}</div>
                  </div>
                  <span className={`pill ${dec.type === "accept" ? "pill-green" : "pill-grey"}`}>{dec.type}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="card" aria-labelledby="how-h">
        <h2 className="card-title" id="how-h">How Together decides</h2>
        <div className="two-col">
          <div className="stack-sm">
            <strong>1. The engine computes.</strong>
            <span style={{ fontSize: 14, color: "var(--ink-2)" }}>A day-by-day cash-flow forecast, debt amortisation under each payment order, milestones and the health score. Deterministic: the same data always gives the same numbers.</span>
          </div>
          <div className="stack-sm">
            <strong>2. Rules watch for moments.</strong>
            <span style={{ fontSize: 14, color: "var(--ink-2)" }}>Each check knows the last good moment to act and only surfaces while acting still helps: a payment can be moved until two days before it goes out.</span>
          </div>
          <div className="stack-sm">
            <strong>3. The assistant only explains.</strong>
            <span style={{ fontSize: 14, color: "var(--ink-2)" }}>Every number in a recommendation is read from the engine&apos;s result. A guard rejects any wording that mentions a figure the engine did not produce.</span>
          </div>
        </div>
      </section>
    </>
  );
}
