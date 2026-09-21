import {
  CONFIDENCE_REVIEW_BELOW,
  FRUSTRATION_FAST_SLA_AT,
  URGENT_NOUL_ABOVE,
} from "./thresholds";
import type { TicketDecision, TriageAnswers } from "./types";

export function routeTicket(answers: TriageAnswers): TicketDecision {
  const autoRoute = answers.department.confidence >= CONFIDENCE_REVIEW_BELOW;
  const queue = autoRoute ? answers.department.choice : "human-review";
  const fastSla =
    answers.isUrgent.noul > URGENT_NOUL_ABOVE ||
    answers.frustration.score >= FRUSTRATION_FAST_SLA_AT;

  return {
    queue,
    sla: fastSla ? "1 hour" : "24 hours",
    autoRoute,
  };
}
