import type { HouseholdSnapshot } from "@/lib/engine/types";
import { demoSnapshot } from "./demo";

/**
 * Where snapshots come from.
 *
 * There is no backend yet, so the only provider serves the demo household.
 * When a server exists it implements this same interface (load a snapshot,
 * persist a decision) and the UI does not change.
 */
export interface DataProvider {
  loadSnapshot(): Promise<HouseholdSnapshot>;
}

export const demoProvider: DataProvider = {
  async loadSnapshot() {
    return demoSnapshot;
  },
};

export function getProvider(): DataProvider {
  return demoProvider;
}
