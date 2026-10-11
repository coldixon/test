"use client";

import { useHousehold } from "@/lib/state/household";
import { Commitments } from "./Commitments";
import { DebtSavingsChart } from "./DebtSavingsChart";
import { ForecastChart } from "./ForecastChart";
import { KpiTiles, SafeToSpendHero } from "./HeroAndTiles";
import { ModeBanner } from "./ModeBanner";
import { Recommendations } from "./Recommendations";
import { StatusCard } from "./StatusCard";
import { UpcomingBills } from "./UpcomingBills";

export function HomeScreen() {
  const h = useHousehold();
  const d = h.dashboard;
  const accept = (id: string) => h.decide("accept", id);
  const dismiss = (id: string) => h.decide("dismiss", id);

  return (
    <>
      <StatusCard dashboard={d} className="only-mobile mo-0" />
      <ModeBanner dashboard={d} className="only-desktop flex" />

      <section className="hero-row only-desktop flex" aria-label="Financial health summary">
        <SafeToSpendHero dashboard={d} />
        <KpiTiles dashboard={d} />
      </section>

      <div className="home-columns">
        <div className="home-main">
          <div className="only-mobile mo-1"><ForecastChart snapshot={h.snapshot} compact /></div>
          <div className="only-desktop"><ForecastChart snapshot={h.snapshot} /></div>
          <div className="mo-3"><UpcomingBills snapshot={h.snapshot} bills={d.upcoming} /></div>
          <div className="only-desktop"><DebtSavingsChart dashboard={d} /></div>
        </div>
        <div className="home-side">
          <div className="only-mobile mo-2"><Recommendations state={h} onAccept={accept} onDismiss={dismiss} compact /></div>
          <div className="only-desktop"><Recommendations state={h} onAccept={accept} onDismiss={dismiss} /></div>
          <div className="only-desktop"><Commitments dashboard={d} /></div>
        </div>
      </div>

      <p className="footnote mo-9">
        Demo household. Forecasts are estimates built from your connected accounts and detected bills. The health score is Together&apos;s own measure, not a credit score.
        {h.decisions.length > 0 && (
          <>
            {" "}
            <button type="button" className="btn btn-ghost" style={{ minHeight: 0, padding: 0, fontSize: 12, textDecoration: "underline" }} onClick={h.reset}>
              Reset demo decisions
            </button>
          </>
        )}
      </p>
    </>
  );
}
