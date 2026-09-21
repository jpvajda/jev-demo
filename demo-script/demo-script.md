Inbox Dispatch — 2-minute demo script

Screencast for developers evaluating TypeSafe's Jev model.
App running at localhost:3000.

OPEN (15 sec)

Jev is a System One model. You send it state — any text or structured data — and typed questions. It returns typed answers with probabilities. No text generation, no parsing. Your code gets numbers it can branch on.

Let me show you all three question types in one call.

(App is open. Stripe integration sample loaded.)


BEAT 1 — Three primitives, one call (30 sec)

(Click Route this ticket.)

That was one API call with three questions. Each one is a different primitive.

Choice asked "which team?" and returned "technical" with a probability for each option and a confidence score. Choice is for picking one option from a fixed list.

Score asked "how frustrated?" and returned a position on a three-level rubric — calm, civil, angry — with probabilities across the levels. Score is for measuring degree.

Noul asked "is this urgent?" and returned 0.94 — the probability that the answer is yes. Noul is a yes/no question where the probability itself is the answer.


BEAT 2 — Confidence is the key feature (30 sec)

(Click It's broken.)

Same three questions, same call. But look at the confidence on the Choice answer — it dropped. The model is telling us "I'm not sure which team this belongs to."

That's the point. Jev doesn't just give you an answer. Choice and Score give you confidence — derived from how peaked or spread out the probability distribution is. Your code can use that to decide whether to act automatically or escalate.

A high-confidence answer means one option dominated. A low-confidence answer means the probabilities were spread across options. Both are useful.


BEAT 3 — Code stays in control (25 sec)

(Show lib/questions.ts in the editor.)

These are the three questions. Each is one line — the primitive type, an instruction, and criteria. All three go in one request and run in parallel. Adding questions barely changes response time.

(Show lib/thresholds.ts.)

And this is where the decisions happen — in code, not in a prompt. Confidence below 0.6, hold for a human. Urgency above 0.7, fast SLA. Change a number here and the product changes. The model's job is judgment. Your code's job is the decision.


CLOSE (10 sec)

Three primitives: Choice, Score, Noul. Typed answers with probabilities and confidence. One fast call. Code owns the decision.

Links in the description.
