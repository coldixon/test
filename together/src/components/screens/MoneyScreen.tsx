"use client";

import { UpcomingBills } from "@/components/home/UpcomingBills";
import { upcomingBills } from "@/lib/engine/schedule";
import { useHousehold } from "@/lib/state/household";
import { money, shortDate, weekdayDate } from "@/lib/format";

const KIND_LABEL = { checking: "Checking", savings: "Savings", credit_card: "Credit cards", loan: "Loans" } as const;
const CADENCE = { weekly: "weekly", biweekly: "every 2 weeks", semimonthly: "15th and last day", monthly: "monthly" } as const;
const STATUS = { scheduled: "Scheduled", awaiting_approval: "Awaiting approval", paid: "Paid", cancelled: "Cancelled" } as const;

export function MoneyScreen() {
  const h = useHousehold();
  const s = h.snapshot;
  const bills = upcomingBills(s, 60);
  const groups = (["checking", "savings", "credit_card", "loan"] as const).map((k) => ({ kind: k, accounts: s.accounts.filter((a) => a.kind === k) })).filter((g) => g.accounts.length);

  return (
    <>
      <div className="stack-sm">
        <h1 className="page-title">Money</h1>
        <p className="page-lede">Every account, income stream, bill and planned payment the forecast is built from.</p>
      </div>

      <div className="two-col">
        <section className="card" aria-labelledby="acc-h">
          <div className="card-head">
            <h2 className="card-title" id="acc-h">Accounts</h2>
            <span className="card-sub">{s.accounts.length} synced</span>
          </div>
          {groups.map((g) => (
            <div key={g.kind} className="list">
              <div className="w" style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "6px 0" }}>{KIND_LABEL[g.kind]}</div>
              {g.accounts.map((a) => (
                <div key={a.id} className="list-row">
                  <div>
                    <div className="n">{a.name}</div>
                    <div className="w">
                      {a.institution} · {a.visibility === "shared" ? "shared" : "private"}
                      {a.ownerId ? ` · ${s.partners.find((p) => p.id === a.ownerId)?.name}` : ""}
                    </div>
                  </div>
                  <div className="num" style={{ fontWeight: 700, color: a.balance < 0 ? "var(--ink-2)" : "var(--ink)" }}>{money(a.balance)}</div>
                </div>
              ))}
            </div>
          ))}
        </section>

        <div className="stack">
          <section className="card" aria-labelledby="inc-h">
            <h2 className="card-title" id="inc-h">Income</h2>
            <div className="list">
              {s.incomes.map((inc) => (
                <div key={inc.id} className="list-row">
                  <div>
                    <div className="n">{inc.name}</div>
                    <div className="w">
                      {CADENCE[inc.cadence]}
                      {inc.cadence === "biweekly" && inc.anchorDate ? ` · next ${shortDate(inc.anchorDate)}` : ""}
                    </div>
                  </div>
                  <div className="num" style={{ fontWeight: 700, color: "var(--green)" }}>+{money(inc.amount)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="card" aria-labelledby="pp-h">
            <h2 className="card-title" id="pp-h">Planned payments</h2>
            <div className="list">
              {s.plannedPayments
                .filter((p) => p.status !== "cancelled")
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((p) => (
                  <div key={p.id} className="list-row">
                    <div>
                      <div className="n">{p.name}</div>
                      <div className="w">
                        {weekdayDate(p.date)} · {STATUS[p.status]}
                        {p.flexible ? " · movable" : ""}
                      </div>
                    </div>
                    <div className="num" style={{ fontWeight: 700 }}>{money(p.amount)}</div>
                  </div>
                ))}
            </div>
          </section>
        </div>
      </div>

      <UpcomingBills snapshot={s} bills={bills} mobileRows={bills.length} desktopRows={bills.length} showAllLink={false} />
      <p className="footnote">Everyday spending is forecast at {money(s.settings.dailyDiscretionary)} a day on top of these items. The protected reserve is {money(s.settings.protectedReserve)}.</p>
    </>
  );
}
