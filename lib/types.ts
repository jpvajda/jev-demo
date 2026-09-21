/**
 * Shapes passed between the API route and the UI.
 *
 * `TriageAnswers` mirrors Jev's typed answers (Choice / Score / Noul).
 * `TicketDecision` is ours — `routeTicket` builds it in code, not the model.
 *
 * Docs: https://docs.typesafe.ai/primitives
 */

/** Choice criteria from `questions.department`. */
export type Department = "billing" | "technical" | "sales";

/** Department Jev picked, or `human-review` when confidence is too low. */
export type Queue = Department | "human-review";

/** SLA set in `routeTicket` from urgency + frustration, not by Jev. */
export type Sla = "1 hour" | "24 hours";

/** One answer per question ID. Keys match `lib/questions.ts`. */
export type TriageAnswers = {
  // Choice: winning option + how peaked the distribution is.
  // https://docs.typesafe.ai/primitives/choice
  department: {
    type: "choice";
    choice: Department;
    /** 0–1, from how concentrated `probabilities` is. Not the same as P(choice). */
    confidence: number;
    probabilities: Record<Department, number>;
  };
  // Score: position on the 0 / 1 / 2 rubric. `score` can sit between levels.
  // https://docs.typesafe.ai/primitives/score
  frustration: {
    type: "score";
    score: number;
    confidence: number;
    /** Rubric text keyed by level (`"0"`, `"1"`, `"2"`). */
    legend: Record<string, string>;
    probabilities: Record<string, number>;
  };
  // Noul: P(yes). No `confidence` field — 0.5 means unsure, not "medium".
  // https://docs.typesafe.ai/primitives/noul
  isUrgent: {
    type: "noul";
    noul: number;
  };
};

/** What our if/else does with the answers. See `lib/routeTicket.ts`. */
export type TicketDecision = {
  queue: Queue;
  sla: Sla;
  autoRoute: boolean;
};

/** JSON body from `POST /api/triage` on success. */
export type TriageSuccess = {
  answers: TriageAnswers;
  decision: TicketDecision;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
};

/** JSON body when triage fails (missing key, bad ticket, API error). */
export type TriageError = {
  error: string;
};
