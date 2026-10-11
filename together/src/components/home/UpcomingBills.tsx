import Link from "next/link";
import type { HouseholdSnapshot, PayMethod, UpcomingBill } from "@/lib/engine/types";
import { dayOfMonth, money, monthAbbrev, weekdayDate } from "@/lib/format";

export const PAY_LABEL: Record<PayMethod, string> = {
  bank_autopay: "Bank autopay",
  together_pay: "Together pay",
  manual: "Manual",
  awaiting_approval: "Awaiting approval",
};

export function payClass(method: PayMethod): string {
  switch (method) {
    case "awaiting_approval":
      return "pill-amber";
    case "together_pay":
      return "pill-teal";
    case "manual":
      return "pill-grey";
    default:
      return "pill-green";
  }
}

export function certaintyLabel(c: UpcomingBill["certainty"]): string {
  return c === "estimated" ? "Estimated" : c === "planned" ? "Planned" : "Confirmed";
}

export function whoLabel(snapshot: HouseholdSnapshot, payerId: string | null): string {
  return snapshot.partners.find((p) => p.id === payerId)?.name ?? "Shared";
}

interface Props {
  snapshot: HouseholdSnapshot;
  bills: UpcomingBill[];
  /** How many rows to show on each layout. */
  mobileRows?: number;
  desktopRows?: number;
  showAllLink?: boolean;
}

export function UpcomingBills({ snapshot, bills, mobileRows = 3, desktopRows = 5, showAllLink = true }: Props) {
  return (
    <section className="card" aria-labelledby="bills-h">
      <div className="card-head">
        <h2 className="card-title" id="bills-h">Coming up</h2>
        {showAllLink && (
          <span className="card-sub">
            <Link href="/money/">All {bills.length} upcoming</Link>
          </span>
        )}
      </div>

      {/* Mobile list */}
      <div className="bill-list only-mobile">
        {bills.slice(0, mobileRows).map((b) => (
          <div key={b.id} className="bill-row">
            <div className="bill-date">
              <div className="m">{monthAbbrev(b.dueDate).toUpperCase()}</div>
              <div className="d num">{dayOfMonth(b.dueDate)}</div>
            </div>
            <div className="bill-name">
              <div className="n">{b.name}</div>
              <div className="w">
                {whoLabel(snapshot, b.payerId)} · {PAY_LABEL[b.payMethod].toLowerCase()}
              </div>
            </div>
            <div className="bill-amt num">
              <div>{b.certainty === "estimated" ? "~" : ""}{money(b.amount)}</div>
              {b.certainty === "estimated" && <div className="est">Estimated</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="table-wrap only-desktop">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Obligation</th>
              <th scope="col">Due</th>
              <th scope="col" className="right">Amount</th>
              <th scope="col">Who</th>
              <th scope="col">How it&apos;s paid</th>
            </tr>
          </thead>
          <tbody>
            {bills.slice(0, desktopRows).map((b) => (
              <tr key={b.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{b.name}</div>
                  <div className="sub">{b.category}</div>
                </td>
                <td className="num" style={{ whiteSpace: "nowrap" }}>{weekdayDate(b.dueDate)}</td>
                <td className="right num">
                  <div style={{ fontWeight: 700 }}>{money(b.amount)}</div>
                  <div className="cert" style={{ color: b.certainty === "estimated" ? "var(--amber-text)" : b.certainty === "planned" ? "var(--ink-3)" : "var(--green)" }}>
                    {certaintyLabel(b.certainty)}
                  </div>
                </td>
                <td>{whoLabel(snapshot, b.payerId)}</td>
                <td>
                  <span className={`tag ${payClass(b.payMethod)}`}>{PAY_LABEL[b.payMethod]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
