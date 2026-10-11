"use client";

import { useMemo, useState } from "react";
import { forecast } from "@/lib/engine/forecast";
import type { HouseholdSnapshot, Scenario } from "@/lib/engine/types";
import { money, shortDate, weekdayDate } from "@/lib/format";
import { WarnIcon } from "@/components/icons";

const RANGES = [7, 30, 60, 90] as const;
const SCENARIOS: { key: Scenario; label: string }[] = [
  { key: "base", label: "Base" },
  { key: "conservative", label: "Conservative" },
  { key: "optimistic", label: "Optimistic" },
];

interface Props {
  snapshot: HouseholdSnapshot;
  /** Mobile: fixed 30-day base view with a small chart and no controls. */
  compact?: boolean;
  defaultDays?: (typeof RANGES)[number];
  defaultScenario?: Scenario;
  title?: string;
}

export function ForecastChart({ snapshot, compact = false, defaultDays = 30, defaultScenario = "base", title }: Props) {
  const [range, setRange] = useState<number>(defaultDays);
  const [scenario, setScenario] = useState<Scenario>(defaultScenario);
  const days = compact ? 30 : range;
  const scen: Scenario = compact ? "base" : scenario;

  const f = useMemo(() => forecast(snapshot, { days, scenario: scen }), [snapshot, days, scen]);

  const W = compact ? 330 : 1000;
  const H = compact ? 100 : 240;
  const geom = useMemo(() => {
    const vals = f.points.map((p) => p.balance).concat([f.reserve]);
    let lo = Math.min(...vals);
    let hi = Math.max(...vals);
    const pad = (hi - lo) * 0.12 || 100;
    lo -= pad;
    hi += pad;
    const X = (i: number) => (i / days) * W;
    const Y = (v: number) => H * 0.958 - ((v - lo) / (hi - lo)) * H * 0.916;
    const line = f.points.map((p, k) => `${k ? "L" : "M"}${X(p.dayIndex).toFixed(1)} ${Y(p.balance).toFixed(1)}`).join(" ");
    const area = `${line} L${W} ${H} L0 ${H} Z`;
    const ry = Y(f.reserve);
    const lowX = X(f.lowest.dayIndex);
    const lowY = Y(f.lowest.balance);
    const shiftX = lowX > W * 0.7 ? "-105%" : lowX < W * 0.12 ? "10%" : "-50%";
    const shiftY = lowY > H * 0.7 ? "-170%" : "60%";
    return {
      line,
      area,
      reserve: `M0 ${ry.toFixed(1)} H${W}`,
      reserveTop: `${((ry / H) * 100).toFixed(2)}%`,
      startTop: `${((Y(f.points[0].balance) / H) * 100).toFixed(2)}%`,
      lowLeft: `${((lowX / W) * 100).toFixed(2)}%`,
      lowTop: `${((lowY / H) * 100).toFixed(2)}%`,
      lowShift: `translate(${shiftX}, ${shiftY})`,
    };
  }, [f, days, W, H]);

  const tickFractions = compact ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1];
  const ticks = tickFractions.map((fr, i) => (i === 0 ? "Today" : shortDate(f.points[Math.round(fr * days)].date)));
  const lowColor = f.breachesReserve ? "var(--orange)" : "var(--teal)";
  const scenLabel = SCENARIOS.find((s) => s.key === scen)?.label ?? "Base";
  const label = `${scenLabel} forecast over ${days} days. Lowest balance ${money(f.lowest.balance)} on ${shortDate(f.lowest.date)}, ${f.breachesReserve ? `${money(f.breachBy)} below` : "above"} the ${money(f.reserve)} reserve.`;

  return (
    <section className="card" aria-labelledby={compact ? "fc-m" : "fc-d"}>
      <div className="card-head">
        <h2 className="card-title" id={compact ? "fc-m" : "fc-d"}>{title ?? (compact ? "Next 30 days" : "Cash-flow forecast")}</h2>
        {compact ? (
          <span className="num card-sub" style={{ fontSize: 13 }}>
            Low <strong style={{ color: lowColor }}>{money(f.lowest.balance)}</strong> · {weekdayDate(f.lowest.date)}
          </span>
        ) : (
          <div className="row" style={{ gap: 10 }}>
            <div className="seg-group" role="group" aria-label="Scenario">
              {SCENARIOS.map((s) => (
                <button key={s.key} type="button" aria-pressed={scen === s.key} onClick={() => setScenario(s.key)}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="seg-group" role="group" aria-label="Range">
              {RANGES.map((r) => (
                <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)} style={{ minWidth: 44 }}>
                  {r}d
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="chart" style={{ height: H }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label} style={{ height: H }}>
          <path d={geom.area} fill="#0B6E6E" fillOpacity="0.08" />
          <path d={geom.reserve} fill="none" stroke="#B4690E" strokeWidth={compact ? 1.2 : 1.5} strokeDasharray={compact ? "5 4" : "6 5"} vectorEffect="non-scaling-stroke" />
          <path d={geom.line} fill="none" stroke="#0B6E6E" strokeWidth={compact ? 2.2 : 2.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {!compact && (
          <>
            <div className="reserve-label" style={{ top: geom.reserveTop }}>Protected reserve {money(f.reserve)}</div>
            <div className="dot" style={{ left: 0, top: geom.startTop, background: "var(--navy)", boxShadow: "0 0 0 1px var(--navy)" }} />
          </>
        )}
        <div className="dot low" style={{ left: geom.lowLeft, top: geom.lowTop, background: lowColor, boxShadow: `0 0 0 1px ${lowColor}`, ...(compact ? { width: 12, height: 12 } : {}) }} />
        {!compact && (
          <div className="low-label num" style={{ left: geom.lowLeft, top: geom.lowTop, transform: geom.lowShift }}>
            Low point {money(f.lowest.balance)} · {shortDate(f.lowest.date)}
          </div>
        )}
      </div>
      <div className="ticks num">
        {ticks.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>

      {!compact && (
        <>
          <div className="fc-summary num">
            <div className="stack-sm" style={{ gap: 0 }}>
              <span className="label">Starting · confirmed</span>
              <span className="value">{money(f.startingBalance)}</span>
            </div>
            <div className="stack-sm" style={{ gap: 0 }}>
              <span className="label">Expected inflows</span>
              <span className="value" style={{ color: "var(--green)" }}>+{money(f.totalInflows)}</span>
            </div>
            <div className="stack-sm" style={{ gap: 0 }}>
              <span className="label">Expected outflows</span>
              <span className="value">−{money(f.totalOutflows)}</span>
            </div>
            <div className="stack-sm" style={{ gap: 0 }}>
              <span className="label">Ending · {shortDate(f.end)}</span>
              <span className="value">{money(f.endingBalance)}</span>
            </div>
          </div>
          {f.breachesReserve && (
            <div className="callout callout-amber" role="status">
              <WarnIcon style={{ flex: "none", marginTop: 1 }} />
              <span>
                In the {scenLabel.toLowerCase()} case, you dip {money(f.breachBy)} below your protected reserve on {shortDate(f.lowest.date)}.
                {scen !== "base" ? " The first recommendation is the quickest fix." : ""}
              </span>
            </div>
          )}
        </>
      )}
    </section>
  );
}
