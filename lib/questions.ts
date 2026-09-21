import { choice, noul, score } from "@typesafe-ai/sdk";

/**
 * Jev questions for one ticket. All three primitives go in a single
 * `systemOne` call against the same state (the email text).
 *
 * Docs: https://docs.typesafe.ai/primitives
 *
 * Keys (`department`, `frustration`, `isUrgent`) are for our code only —
 * they are not sent to the model. Put the full question in `instructions`.
 */
export const questions = {
  // Choice: pick one unordered option. Returns `choice`, `probabilities`, `confidence`.
  // https://docs.typesafe.ai/primitives/choice
  department: choice("Which team should handle this", {
    billing: "Payment or subscription issues",
    technical: "Bugs or integration problems",
    sales: "Pricing or account questions",
  }),
  // Score: rate on an ordered rubric (index 0, 1, 2). Returns `score` (can
  // fall between levels), `probabilities`, `confidence`.
  // https://docs.typesafe.ai/primitives/score
  frustration: score("How frustrated the customer appears", [
    "Calm, just stating facts",
    "Frustrated but civil",
    "Very angry, strong language",
  ]),
  // Noul: probability that the statement is true (0–1). No separate confidence.
  // Near 0.5 means unsure, not "medium urgency" — use Score for intensity.
  // https://docs.typesafe.ai/primitives/noul
  isUrgent: noul("The message conveys urgency or time-sensitivity"),
};
