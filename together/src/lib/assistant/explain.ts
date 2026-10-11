/**
 * Explanations.
 *
 * The engine decides *what* to recommend and computes every number. This
 * module only decides *how to say it*. Two explainers exist:
 *
 *  - `templateExplainer`: deterministic prose built from the recommendation's
 *    own fields. Always available, used by the static app.
 *  - `guardedExplainer(generate)`: wraps any text generator (for example a
 *    Claude call made on a server) and runs the number guard on its reply.
 *    A reply that mentions a number the engine did not produce is discarded
 *    and the template wording is used instead, so no invented figure can
 *    reach the screen.
 */

import { guardNumbers, type Facts } from "./numberGuard";
import type { Recommendation } from "./rules";

export interface Explanation {
  text: string;
  /** "template" or "model"; "model_rejected" when the guard discarded a reply. */
  origin: "template" | "model" | "model_rejected";
  rejected?: string[];
}

export type Explainer = (rec: Recommendation) => Promise<Explanation>;

export const templateExplainer: Explainer = async (rec) => ({
  text: `${rec.why} ${rec.impact}.`,
  origin: "template",
});

/** The prompt a model receives. Facts are listed so the model can only restate them. */
export function explanationPrompt(rec: Recommendation): string {
  const facts = Object.entries(rec.facts)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");
  return [
    "You explain a money recommendation to a couple in two plain sentences.",
    "Use only the numbers listed under FACTS, written exactly as given (you may add $ or % and thousands separators).",
    "Do not calculate, estimate, or introduce any other number. Do not give advice beyond the recommendation.",
    "",
    `RECOMMENDATION: ${rec.title}`,
    `WHY: ${rec.why}`,
    `IMPACT: ${rec.impact}`,
    "FACTS:",
    facts,
  ].join("\n");
}

/**
 * Build an explainer from any text generator. The generator is typically a
 * server-side call to Claude; it is injected so this module has no network
 * or SDK dependency and can be unit-tested with a fake.
 */
export function guardedExplainer(generate: (prompt: string) => Promise<string>): Explainer {
  return async (rec) => {
    let reply: string;
    try {
      reply = (await generate(explanationPrompt(rec))).trim();
    } catch {
      return templateExplainer(rec);
    }
    const result = guardNumbers(reply, rec.facts);
    if (!result.ok || reply.length === 0) {
      const fallback = await templateExplainer(rec);
      return { ...fallback, origin: "model_rejected", rejected: result.offending };
    }
    return { text: reply, origin: "model" };
  };
}

export type { Facts };
