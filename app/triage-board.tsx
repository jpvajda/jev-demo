"use client";

import { useState, type ReactNode } from "react";
import { samples } from "@/lib/samples";
import {
  CONFIDENCE_REVIEW_BELOW,
  FRUSTRATION_FAST_SLA_AT,
  URGENT_NOUL_ABOVE,
} from "@/lib/thresholds";
import type { Queue, TriageError, TriageSuccess } from "@/lib/types";

type Status = "idle" | "loading" | "error" | "done";

export function TriageBoard() {
  const [ticket, setTicket] = useState(samples[0].body);
  const [activeSample, setActiveSample] = useState<string | null>(samples[0].id);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TriageSuccess | null>(null);

  async function route(nextTicket = ticket) {
    const trimmed = nextTicket.trim();
    if (!trimmed) {
      setStatus("error");
      setError("Paste a ticket first.");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket: trimmed }),
      });
      const payload = (await response.json()) as TriageSuccess | TriageError;

      if (!response.ok || !("answers" in payload)) {
        setResult(null);
        setStatus("error");
        setError("error" in payload ? payload.error : "Triage failed. Try again.");
        return;
      }

      setResult(payload);
      setStatus("done");
    } catch {
      setResult(null);
      setStatus("error");
      setError("Could not reach the triage route.");
    }
  }

  function loadSample(id: string, body: string) {
    setActiveSample(id);
    setTicket(body);
    void route(body);
  }

  return (
    <main className="mx-auto grid min-h-full max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12 lg:px-8 lg:py-14">
      <header className="lg:col-span-2">
        <p className="font-display text-lamp text-xl font-semibold">Inbox dispatch</p>
        <h1 className="mt-2 max-w-xl font-display text-4xl font-semibold leading-tight text-paper">
          Paste a support email. Jev judges it. Code picks the queue.
        </h1>
      </header>

      <section className="flex flex-col gap-4 bg-paper p-5 text-paper-ink shadow-[6px_6px_0_#1a2736]">
        <h2 className="font-display text-2xl font-semibold">Incoming ticket</h2>
        <div className="flex flex-col gap-2">
          {samples.map((sample) => {
            const selected = activeSample === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => loadSample(sample.id, sample.body)}
                className={`w-full border px-3 py-1.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desk ${
                  selected
                    ? "border-desk bg-desk text-paper"
                    : "border-rule bg-paper text-paper-ink hover:border-desk"
                }`}
              >
                {sample.label}
              </button>
            );
          })}
        </div>
        <label className="flex flex-1 flex-col gap-2 text-sm text-muted">
          Message
          <textarea
            value={ticket}
            onChange={(event) => {
              setTicket(event.target.value);
              setActiveSample(null);
            }}
            rows={10}
            className="min-h-48 w-full resize-y border border-rule bg-white px-3 py-2 text-base leading-relaxed text-paper-ink outline-none focus-visible:border-desk"
          />
        </label>
        <button
          type="button"
          onClick={() => void route()}
          disabled={status === "loading"}
          className="self-start bg-desk px-4 py-2 font-display text-lg font-semibold text-paper hover:bg-[#1b2a3c] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lamp"
        >
          {status === "loading" ? "Routing…" : "Route this ticket"}
        </button>
      </section>

      <section className="flex flex-col gap-6 bg-paper p-5 text-paper-ink shadow-[6px_6px_0_#1a2736]">
        <DecisionStamp result={result} status={status} error={error} />
        {result ? <Judgments result={result} /> : null}
      </section>
    </main>
  );
}

function DecisionStamp({
  result,
  status,
  error,
}: {
  result: TriageSuccess | null;
  status: Status;
  error: string | null;
}) {
  if (status === "error" && error) {
    return (
      <div className="border border-stamp px-4 py-3 text-stamp">
        <p className="font-display text-2xl font-semibold">Not routed</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="border border-dashed border-rule px-4 py-8 text-muted">
        <p className="font-display text-3xl font-semibold text-paper-ink/40">Waiting</p>
        <p className="mt-2 max-w-md text-sm">
          Pick a sample or paste a ticket. The stamp stays blank until Jev answers and
          code chooses a queue.
        </p>
      </div>
    );
  }

  const stampColor = result.decision.autoRoute ? "text-stamp-ok border-stamp-ok" : "text-stamp border-stamp";

  return (
    <div className="flex flex-col gap-5">
      <div
        className={`w-fit max-w-full border-[3px] px-4 py-3 ${stampColor} motion-safe:-rotate-2`}
      >
        <p className="font-display text-4xl font-bold leading-none">
          {queueLabel(result.decision.queue)}
        </p>
        <p className="mt-2 font-display text-xl font-semibold">
          {result.decision.sla} · {result.decision.autoRoute ? "auto-route" : "hold for a person"}
        </p>
      </div>
      <RoutingCode result={result} />
      <p className="text-xs text-muted">
        {result.model} · {result.usage.input_tokens} in / {result.usage.output_tokens} out
      </p>
    </div>
  );
}

function RoutingCode({ result }: { result: TriageSuccess }) {
  const { department, frustration, isUrgent } = result.answers;
  const lowConfidence = department.confidence < CONFIDENCE_REVIEW_BELOW;
  const fastSla =
    isUrgent.noul > URGENT_NOUL_ABOVE || frustration.score >= FRUSTRATION_FAST_SLA_AT;

  return (
    <pre className="overflow-x-auto border border-rule bg-white p-3 text-sm leading-6 text-paper-ink">
      <code>
        <Line active={lowConfidence}>
          {`if (department.confidence < ${CONFIDENCE_REVIEW_BELOW}) queue = "human-review"`}
        </Line>
        <Line active={!lowConfidence}>
          {`else queue = department.choice  // ${department.choice}`}
        </Line>
        {"\n"}
        <Line active={fastSla}>
          {`if (isUrgent > ${URGENT_NOUL_ABOVE} || frustration >= ${FRUSTRATION_FAST_SLA_AT}) sla = "1 hour"`}
        </Line>
        <Line active={!fastSla}>{`else sla = "24 hours"`}</Line>
      </code>
    </pre>
  );
}

function Line({ active, children }: { active: boolean; children: string }) {
  return (
    <span className={active ? "bg-lamp/35" : "text-muted"}>{children}{"\n"}</span>
  );
}

function Judgments({ result }: { result: TriageSuccess }) {
  const { department, frustration, isUrgent } = result.answers;
  const frustrationLevels = Object.keys(frustration.legend).sort(
    (a, b) => Number(a) - Number(b),
  );

  return (
    <div className="flex flex-col gap-6 border-t border-rule pt-5">
      <Judgment title="Choice · department" meta={`confidence ${fmt(department.confidence)}`}>
        {(["billing", "technical", "sales"] as const).map((option) => (
          <Meter key={option} label={queueLabel(option)} value={department.probabilities[option]} />
        ))}
      </Judgment>
      <Judgment title="Score · frustration" meta={`score ${fmt(frustration.score)} · confidence ${fmt(frustration.confidence)}`}>
        {frustrationLevels.map((level) => (
          <Meter
            key={level}
            label={frustration.legend[level] ?? `Level ${level}`}
            value={frustration.probabilities[level] ?? 0}
          />
        ))}
      </Judgment>
      <Judgment title="Noul · urgent" meta={`${fmt(isUrgent.noul)} probability of yes`}>
        <Meter label="Urgent" value={isUrgent.noul} />
      </Judgment>
    </div>
  );
}

function Judgment({
  title,
  meta,
  children,
}: {
  title: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted">{meta}</p>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  const width = `${Math.max(0, Math.min(1, value)) * 100}%`;
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,14rem)_1fr_3.25rem] sm:items-center sm:gap-3">
      <span className="text-sm leading-snug">{label}</span>
      <div className="h-2 bg-rule" aria-hidden="true">
        <div className="h-full bg-desk" style={{ width }} />
      </div>
      <span className="text-sm tabular-nums sm:text-right">{pct(value)}</span>
    </div>
  );
}

function queueLabel(queue: Queue) {
  switch (queue) {
    case "human-review":
      return "Human review";
    case "billing":
      return "Billing";
    case "technical":
      return "Technical";
    case "sales":
      return "Sales";
  }
}

function fmt(value: number) {
  return value.toFixed(2);
}

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}
