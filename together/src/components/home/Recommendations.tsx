"use client";

import { useState } from "react";
import { actByLabel, type Approval, type Recommendation } from "@/lib/assistant/rules";
import type { HouseholdState } from "@/lib/state/household";
import type { Partner } from "@/lib/engine/types";

const APPROVAL_LABEL: Record<Approval, string> = {
  none: "No approval needed",
  one_partner: "Needs one partner",
  both_partners: "Needs both partners",
};

function tagClass(tag: Recommendation["tag"]): string {
  return tag === "Cash protection" ? "pill-amber" : tag === "Debt" ? "pill-teal" : "pill-grey";
}

interface Props {
  state: HouseholdState;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
  /** Mobile: one card, the most urgent. */
  compact?: boolean;
}

function acceptedText(rec: Recommendation, partners: Partner[], byId: string): string {
  const me = partners.find((p) => p.id === byId)?.name ?? "You";
  if (rec.approval === "both_partners") {
    const other = partners.find((p) => p.id !== byId)?.name ?? "your partner";
    return `Accepted by ${me}. Waiting on ${other} to approve.`;
  }
  return `Accepted by ${me}. ${rec.acceptedText}`;
}

export function Recommendations({ state, onAccept, onDismiss, compact = false }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const today = state.snapshot.asOf;
  const acceptedList = Object.values(state.accepted).map((a) => ({ rec: a.rec, accepted: true, by: a.decision.by }));
  const liveList = state.live.map((rec) => ({ rec, accepted: false, by: "" }));
  const all = [...acceptedList, ...liveList].sort((a, b) => a.rec.priority - b.rec.priority);
  const shown = compact ? all.filter((x) => !x.accepted).slice(0, 1).concat(all.filter((x) => !x.accepted).length === 0 ? all.slice(0, 1) : []) : all;
  const toggle = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  return (
    <section className="card" aria-labelledby={compact ? "rec-m" : "rec-d"}>
      <div className="card-head">
        <h2 className="card-title" id={compact ? "rec-m" : "rec-d"}>Together recommends</h2>
        <span className="card-sub">{compact ? (state.live.length ? `1 of ${state.live.length}` : "All clear") : `${state.live.length} open`}</span>
      </div>

      {all.length === 0 && (
        <div className="callout callout-green">You&apos;re all caught up. We&apos;ll flag the next opportunity when your data changes.</div>
      )}

      {shown.map(({ rec, accepted, by }) => {
        const isOpen = !!expanded[rec.id];
        return (
          <article key={rec.id} className={`rec ${compact ? "compact" : ""}`} aria-label={rec.title}>
            <div className="row">
              <span className={`pill ${tagClass(rec.tag)}`}>{rec.tag}</span>
              {!compact && (
                <span className="card-sub">
                  {APPROVAL_LABEL[rec.approval]}
                  {!accepted ? ` · ${actByLabel(rec, today)}` : ""}
                </span>
              )}
            </div>
            <h3>{rec.title}</h3>
            <p className="why">{compact ? rec.impact : rec.why}</p>
            {!compact && <div className="impact num">{rec.impact}</div>}
            {isOpen && (
              <div className="detail">
                {compact && <div>{rec.why}</div>}
                <div><strong>Assumptions:</strong> {rec.assumptions}</div>
                <div><strong>Risk:</strong> {rec.risk}</div>
                <div><strong>Confidence:</strong> {rec.confidence} · <strong>Source:</strong> {rec.source}</div>
                <div><strong>{APPROVAL_LABEL[rec.approval]}</strong> · {actByLabel(rec, today)}</div>
              </div>
            )}
            {accepted && <div className="accepted">{acceptedText(rec, state.snapshot.partners, by)}</div>}
            <div className="actions">
              {accepted ? (
                compact && <button type="button" className="btn btn-primary done" disabled>Accepted</button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={() => onAccept(rec.id)}>Accept</button>
              )}
              <button type="button" className="btn btn-secondary" aria-expanded={isOpen} onClick={() => toggle(rec.id)}>
                {isOpen ? "Hide impact" : "View impact"}
              </button>
              {!accepted && !compact && (
                <button type="button" className="btn btn-ghost" onClick={() => onDismiss(rec.id)}>Dismiss</button>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
