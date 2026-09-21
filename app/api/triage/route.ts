import {
  APIError,
  TypeSafeClient,
  TypeSafeError,
  type SystemOneResult,
} from "@typesafe-ai/sdk";
import { questions } from "@/lib/questions";
import { routeTicket } from "@/lib/routeTicket";
import type { Department, TriageAnswers, TriageError, TriageSuccess } from "@/lib/types";

export const runtime = "nodejs";

const MAX_TICKET_CHARS = 8000;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Send JSON with a ticket string.", 400);
  }

  const ticket =
    typeof body === "object" &&
    body !== null &&
    "ticket" in body &&
    typeof body.ticket === "string"
      ? body.ticket.trim()
      : "";

  if (!ticket) {
    return jsonError("Paste a ticket first.", 400);
  }

  if (ticket.length > MAX_TICKET_CHARS) {
    return jsonError(`Ticket is too long (max ${MAX_TICKET_CHARS} characters).`, 400);
  }

  try {
    const client = new TypeSafeClient({ timeout: 20_000 });
    const response = await client.systemOne({
      state: ticket,
      questions,
    });

    const answers = serializeAnswers(response.answers);
    const payload: TriageSuccess = {
      answers,
      decision: routeTicket(answers),
      model: response.model,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    };

    return Response.json(payload);
  } catch (error) {
    const { status, message } = describeError(error);
    return jsonError(message, status);
  }
}

function serializeAnswers(
  answers: SystemOneResult<typeof questions>["answers"],
): TriageAnswers {
  return {
    department: {
      type: "choice",
      choice: answers.department.choice as Department,
      confidence: answers.department.confidence,
      probabilities: answers.department.probabilities,
    },
    frustration: {
      type: "score",
      score: answers.frustration.score,
      confidence: answers.frustration.confidence,
      legend: { ...answers.frustration.legend },
      probabilities: { ...answers.frustration.probabilities },
    },
    isUrgent: {
      type: "noul",
      noul: answers.isUrgent.noul,
    },
  };
}

function describeError(error: unknown): { status: number; message: string } {
  if (error instanceof APIError) {
    if (error.status === 401) {
      return { status: 500, message: "TypeSafe rejected the API key. Check TYPESAFE_API_KEY." };
    }
    return { status: error.status >= 500 ? 502 : 400, message: error.message };
  }

  if (error instanceof TypeSafeError) {
    if (/api key/i.test(error.message)) {
      return { status: 500, message: "Set TYPESAFE_API_KEY in .env.local" };
    }
    return { status: 400, message: error.message };
  }

  return { status: 500, message: "Triage failed. Try again." };
}

function jsonError(error: string, status: number) {
  const payload: TriageError = { error };
  return Response.json(payload, { status });
}
