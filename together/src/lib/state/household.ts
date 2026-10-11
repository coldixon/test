"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { applyAction } from "@/lib/assistant/actions";
import { runRules, type Recommendation } from "@/lib/assistant/rules";
import { demoSnapshot } from "@/lib/data/demo";
import { computeDashboard, type Dashboard } from "@/lib/engine";
import type { HouseholdSnapshot } from "@/lib/engine/types";

/**
 * Client-side household state for the demo.
 *
 * The only state is the list of decisions the couple has made (accepted or
 * dismissed recommendations). Everything else is recomputed by replaying
 * those decisions over the base snapshot, so the UI never holds derived
 * numbers of its own. Decisions persist in localStorage; clearing them
 * returns the demo to its starting point.
 */

export interface Decision {
  type: "accept" | "dismiss";
  id: string;
  at: string;
  by: string;
}

export interface HouseholdState {
  snapshot: HouseholdSnapshot;
  dashboard: Dashboard;
  /** Recommendations that still apply, in priority order. */
  live: Recommendation[];
  /** Accepted recommendations, frozen as they were when accepted. */
  accepted: Record<string, { rec: Recommendation; decision: Decision }>;
  dismissed: string[];
  /** The partner using this device in the demo. */
  currentPartnerId: string;
}

const STORAGE_KEY = "together.demo.decisions.v1";
export const CURRENT_PARTNER_ID = "maya";

export function replay(base: HouseholdSnapshot, decisions: Decision[]): Omit<HouseholdState, "currentPartnerId"> {
  let snapshot = base;
  const accepted: HouseholdState["accepted"] = {};
  const dismissed: string[] = [];
  const hidden = () => [...dismissed, ...Object.keys(accepted)];
  for (const d of decisions) {
    const rec = runRules(snapshot, { dismissedIds: hidden() }).find((r) => r.id === d.id);
    if (!rec) continue;
    if (d.type === "dismiss") {
      dismissed.push(d.id);
    } else {
      accepted[d.id] = { rec, decision: d };
      snapshot = applyAction(snapshot, rec);
    }
  }
  const live = runRules(snapshot, { dismissedIds: hidden() });
  return { snapshot, dashboard: computeDashboard(snapshot), live, accepted, dismissed };
}

function load(): Decision[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Decision[]) : [];
  } catch {
    return [];
  }
}

function save(decisions: Decision[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
  } catch {
    // Private mode or blocked storage: the session still works, it just will not persist.
  }
}

export function useHousehold() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDecisions(load());
    setHydrated(true);
  }, []);

  const state = useMemo<HouseholdState>(() => ({ ...replay(demoSnapshot, decisions), currentPartnerId: CURRENT_PARTNER_ID }), [decisions]);

  const decide = useCallback((type: Decision["type"], id: string) => {
    setDecisions((prev) => {
      const next = [...prev, { type, id, at: new Date().toISOString(), by: CURRENT_PARTNER_ID }];
      save(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    save([]);
    setDecisions([]);
  }, []);

  return { ...state, decisions, decide, reset, hydrated };
}
