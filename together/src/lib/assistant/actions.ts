import { simulateShiftPayment, applyShift } from "@/lib/engine/simulate";
import type { HouseholdSnapshot } from "@/lib/engine/types";
import type { Recommendation } from "./rules";

/**
 * Apply an accepted recommendation to a snapshot.
 *
 * Recommendations that need both partners do not change the household's
 * money until the second partner approves; they are recorded as pending.
 */
export function applyAction(snapshot: HouseholdSnapshot, rec: Recommendation): HouseholdSnapshot {
  if (rec.approval === "both_partners") return snapshot;
  const a = rec.action;
  switch (a.type) {
    case "shift_payment": {
      const sim = simulateShiftPayment(snapshot, { paymentId: a.paymentId, amount: a.amount, toDate: a.toDate });
      return applyShift(snapshot, sim);
    }
    case "retarget_payment": {
      const debt = snapshot.debts.find((d) => d.id === a.toDebtId);
      return {
        ...snapshot,
        plannedPayments: snapshot.plannedPayments.map((p) =>
          p.id === a.paymentId ? { ...p, targetId: a.toDebtId, name: debt ? `${debt.name} extra payment` : p.name } : p,
        ),
      };
    }
    case "cancel_subscription":
      return { ...snapshot, recurringCharges: snapshot.recurringCharges.filter((c) => c.id !== a.chargeId) };
  }
}
