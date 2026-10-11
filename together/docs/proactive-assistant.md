# The proactive assistant

## Principle

The assistant has three jobs and one rule. It **notices** (rule-based checks over the engine's results), it **times** (surfaces each finding at the last good moment to act), and it **explains** (in plain words). The rule: it never produces a number. Every figure it shows is read from the calculation engine, and a guard rejects wording that contains anything else.

## Checks

| Rule | Trigger | Action | Approval | Last good moment |
| --- | --- | --- | --- | --- |
| Cash protection | Base 30-day safe-to-spend below the comfort buffer | Move the smallest round amount of a flexible payment, scheduled before the low point, to the first payday after it | One partner | Two days before the payment goes out |
| Debt allocation | The next extra payment targets a debt that is not the one costing most, and the avalanche saves ≥ $50 | Re-target the payment; re-order the plan | Both partners | Three days before the payment |
| Subscriptions | Three or more streaming services across both partners' cards | Drop the most expensive | None | Before its next charge |

Each rule returns `null` when it does not apply, so an empty recommendation list is a normal state and the UI says so.

## Facts and the guard

A recommendation's `facts` is a flat `Record<string, number>`: the moved amount, the low point before and after, the interest cost, the APR, the days deferred, and so on. `guardNumbers(text, facts)` extracts every numeric token from a text (money, percentages, bare numbers) and checks it against the fact values, their rounded forms and their percentage forms. Dates ("Nov 6", "June 2027"), years and card masks ("••4412") are skipped. The rules' own titles and bodies are run through the guard in the test suite, so the templates can never drift from the engine either.

## Explanations

`templateExplainer` is the default and the fallback. `guardedExplainer(generate)` accepts any `(prompt) => Promise<string>`; the prompt lists the facts and instructs the model to use only those numbers. If the reply fails the guard (or the generator throws), the template text is used and the result is marked `model_rejected` with the offending tokens, so the server can log how often the model needed correcting.

## Timing

`surfaceOn` and `actBy` are dates. The home screen shows recommendations whose window is open, ordered by priority then by how soon the window closes. For the demo household on 11 October: the cash-protection move must be approved by 18 October, the November allocation by 17 November, the subscription before the next charge in early November.

## What "Accept" does

`applyAction` turns a recommendation into a new snapshot: a moved payment becomes two planned payments, a re-targeted payment changes its debt, a cancelled subscription leaves the recurring list. Recommendations that need both partners do not change the household's money until the second partner also accepts; the first acceptance is recorded as pending.
