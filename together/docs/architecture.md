# Architecture

Together is built in three layers that only talk downwards.

```
┌──────────────────────────────────────────────────────────┐
│ UI (Next.js, static)                                      │
│   Home · Plan · Money · Goals · Insights                  │
│   Holds only *decisions* (accept / dismiss)               │
├──────────────────────────────────────────────────────────┤
│ Assistant (src/lib/assistant)                             │
│   rules.ts  → Recommendation { action, facts, actBy }     │
│   explain.ts → wording; numberGuard.ts checks it          │
├──────────────────────────────────────────────────────────┤
│ Engine (src/lib/engine)                                   │
│   forecast · simulate · debts · milestones · mode · health │
│   Pure functions over a HouseholdSnapshot                 │
├──────────────────────────────────────────────────────────┤
│ Data (src/lib/data)                                       │
│   DataProvider.loadSnapshot() — demo fixtures today,      │
│   a server later                                          │
└──────────────────────────────────────────────────────────┘
```

## The snapshot

`HouseholdSnapshot` (`src/lib/engine/types.ts`) is a plain, serialisable description of a household's money on one day: partners, settings (protected reserve, comfort buffer, everyday spending), accounts, income streams, bills, planned payments, debts, goals, detected recurring charges, this month's commitments, monthly history, and the current mode. It is the only input the engine takes, which keeps the engine testable and makes a server trivial to slot in: it just has to produce a snapshot.

## The engine

Every function is deterministic and side-effect free.

- **forecast** expands recurring items into dated events, walks the days, and returns the series plus derived facts: lowest point, safe-to-spend (low minus reserve), totals, whether the reserve is breached. Scenarios scale only the uncertain parts (estimated bills ×1.1 and everyday spending ×1.15 in the conservative case; everyday spending ×0.9 in the optimistic case).
- **simulate** answers "what if we moved part of this payment": it clones the planned payments, runs two forecasts and prices the deferral at the debt's effective APR for the days deferred. Accepting a recommendation applies exactly the payments the simulation used.
- **debts** amortises month by month under a strategy. `fixed` follows the couple's own order. `avalanche` targets the highest effective rate, with one twist: a promotional-rate debt jumps to the front once the months left on its promo are only just enough to clear it, so a balance never rolls onto the post-promo rate.
- **milestones**, **mode**, **health** evaluate the recovery milestones, derive the mode and graduation estimate from them, and build the 0–100 health score from six named components so the Insights page can show its working.

## The assistant

Rules are functions `(RuleContext) => Recommendation | null`. A recommendation carries a structured `action` (so Accept can apply it), `facts` (every number the engine produced for it), and two dates: `surfaceOn` and `actBy`. Rules stay quiet before `surfaceOn` and after `actBy`, which is how Together alerts at the last good moment rather than nagging.

Explanations are separate from decisions. `templateExplainer` builds prose from the recommendation's fields. `guardedExplainer(generate)` wraps any text generator (a Claude call on a server, for instance), runs `guardNumbers` on the reply, and falls back to the template if the reply contains any number not in `facts`. Card masks (••4412), dates and years are recognised and ignored by the guard; everything else must trace back to the engine.

## State

The UI stores decisions, not numbers. `useHousehold()` replays the decision list over the base snapshot: for each decision it re-runs the rules, finds the recommendation by id, and applies its action. This means the forecast, safe-to-spend, milestones and remaining recommendations are always recomputed from first principles, and resetting the demo is just clearing the list.

## Adding a server

1. Implement `DataProvider` against your database and return a `HouseholdSnapshot`.
2. Persist decisions server-side instead of in localStorage (same `Decision` shape).
3. For partner approval flows, record one decision per partner and treat a `both_partners` recommendation as applied when both exist.
4. Put the model-backed explainer behind an endpoint; the client already handles `origin: "model_rejected"`.
