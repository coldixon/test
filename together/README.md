# Together

Shared money for couples. Together forecasts a household's cash day by day, turns that into one number the couple can trust ("safe to spend until Nov 5: $317"), and runs a proactive assistant that spots problems and opportunities early. The assistant never does arithmetic of its own: every figure it shows is read from the calculation engine, and a guard rejects any wording that mentions a number the engine did not produce.

This is the local, no-backend build. It serves a demo household (Maya & Jordan) from built-in fixtures and keeps the couple's decisions in the browser.

## Run it locally

```bash
cd together
npm install
npm run dev
```

Open http://localhost:3000. Resize the window below 900px for the phone layout.

Other commands:

```bash
npm test          # engine + assistant unit tests (vitest)
npm run typecheck # tsc --noEmit
npm run build     # static export to ./out (any static host can serve it)
npm run bundle    # one self-contained file: dist/together.html (open it directly, no server)
```

The bundle is the whole app in a single HTML file with hash routing (`#plan`, `#money`, …). It is what the shareable preview is published from.

No environment variables are needed. `.env.example` lists the one optional key for a future server.

## What is here

```
src/lib/engine/        Pure calculation engine (no React, no I/O)
  forecast.ts          Day-by-day cash projection, low point, safe-to-spend, scenarios
  schedule.ts          Expands income, bills and planned payments into dated events
  simulate.ts          What-if: move part of a payment; before/after forecasts, interest cost
  debts.ts             Amortisation under a fixed order or a promo-aware avalanche
  milestones.ts        The six "Right the Ship" recovery milestones
  mode.ts              Stabilise → Right the Ship → Stay Ahead → Build Wealth, graduation estimate
  health.ts            Household health score (0–100) from six components
  index.ts             computeDashboard(): everything the home screen needs
src/lib/assistant/     The proactive assistant
  rules.ts             Rule-based checks → recommendations with facts and timing (surfaceOn / actBy)
  numberGuard.ts       Rejects any number in an explanation that the engine did not produce
  explain.ts           Template explainer, and a guarded wrapper for a model-backed one
  actions.ts           Applies an accepted recommendation to a snapshot
src/lib/data/          Demo household fixtures and the DataProvider interface a server will implement
src/lib/state/         Client state: decisions replayed over the base snapshot, persisted in localStorage
src/components/        UI (Next.js App Router, plain CSS, no component library)
src/app/               Routes: / (Home), /plan, /money, /goals, /insights
docs/                  Architecture and the proactive-assistant design
```

## Design

The home screen follows the Together Dashboard canvas (desktop 1440 and phone 390 artboards): navy status card and mode banner, Fraunces display type with Manrope body, teal forecast line with the protected reserve as a dashed amber line, and a 900px breakpoint between the two layouts.

## Demo household at a glance

| Figure | Value | Where it comes from |
| --- | --- | --- |
| Available cash | $2,460 | Three shared checking accounts |
| Lowest projected (30d, base) | $1,117 on Thu, Nov 5 | Rent and car loan land Nov 1–5, before Maya's Nov 6 paycheck |
| Safe to spend | $317 | Low point minus the $800 protected reserve |
| Recommendation 1 | Move $200 of the Oct 20 extra card payment to Nov 6 | Raises the low point by $200 for $2.61 of interest (27.99% APR × 17 days) |
| Recommendation 2 | Send November's extra $650 to the Visa, not the store card | Saves $221 over the plan; the store card still clears before its 0% promo ends |
| Recommendation 3 | Three streaming services across both partners | $47/mo overlapping; dropping the priciest frees $16.99/mo |
| Mode | Right the Ship, month 4 | Graduates to Stay Ahead when the Visa clears, October 2027 |
| Health | 58 / 100, +6 since September | Six components, see Insights |

All of these are asserted by the unit tests, so a change to the engine that moves a headline number fails the build.

## Next

- A server: the `DataProvider` interface in `src/lib/data/provider.ts` is the seam. Supabase migrations for households, partners, accounts, bills, debts, planned payments, recommendations and decisions were drafted in an earlier session and will be re-created against this data model.
- Model-backed explanations: `guardedExplainer()` in `src/lib/assistant/explain.ts` wraps any `(prompt) => Promise<string>`; wire a Claude call there on the server. The guard and template fallback are already tested.
- Dark mode.
