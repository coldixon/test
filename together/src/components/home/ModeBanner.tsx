import { CheckIcon, CircleIcon, HalfIcon } from "@/components/icons";
import type { Dashboard } from "@/lib/engine";
import { addMonths } from "@/lib/engine/dates";
import { monthName, monthYear } from "@/lib/format";

export function ModeBanner({ dashboard: d, className = "" }: { dashboard: Dashboard; className?: string }) {
  const m = d.mode;
  const prevReview = monthName(addMonths(d.snapshot.asOf, -1));
  let note: string;
  if (m.shiftDays === null) {
    note = "The estimate updates as your accounts sync and payments clear.";
  } else if (m.shiftDays === 0) {
    note = `Unchanged since ${prevReview}.`;
  } else {
    const weeks = Math.max(1, Math.round(Math.abs(m.shiftDays) / 7));
    const dir = m.shiftDays < 0 ? "earlier" : "later";
    note = `Moved ${weeks} week${weeks === 1 ? "" : "s"} ${dir} since ${prevReview}${m.shiftNote ? ` because ${m.shiftNote.replace(/\.$/, "")}` : ""}.`;
  }
  return (
    <section className={`mode-banner ${className}`} aria-label="Financial mode">
      <div className="lead">
        <span className="pill pill-mode" style={{ alignSelf: "flex-start", fontSize: 12 }}>
          {m.mode} · Month {m.monthNumber}
        </span>
        <div className="headline">
          {m.graduationEstimate && m.next ? (
            <>
              Estimated graduation to {m.next}: <em>{monthYear(m.graduationEstimate)}</em>
            </>
          ) : m.next ? (
            <>Next stage: <em>{m.next}</em></>
          ) : (
            <>You are in the final stage.</>
          )}
        </div>
        <div className="note">{note}</div>
      </div>
      <ol className="milestone-list" aria-label="Recovery milestones">
        {d.milestones.milestones.map((ms) => (
          <li key={ms.id} className={ms.status === "pending" ? "pending" : ""}>
            {ms.status === "done" ? <CheckIcon /> : ms.status === "in_progress" ? <HalfIcon /> : <CircleIcon />}
            {ms.label}
          </li>
        ))}
      </ol>
    </section>
  );
}
