# Inbox dispatch

A small demo of [Jev](https://docs.typesafe.ai/introduction), TypeSafe’s System One model. Paste a support email. Jev returns typed answers. Your code picks the queue.

## Why Jev

An LLM would write a paragraph (“this looks technical and urgent…”). You would parse it, hope the format holds, and still not know how sure it is.

Jev does not generate text. It evaluates typed questions against the ticket and returns values your code can branch on:

- **Choice** — one option from a list, plus a probability per option and confidence
- **Score** — a position on your rubric, plus probabilities and confidence
- **Noul** — probability that a statement is true (0–1)

Code stays in control. Change a cutoff in `lib/thresholds.ts` and the product changes. You do not rewrite a prompt.

The three sample chips are canned input only. Jev’s judgment is live: the same questions run on whatever is in the textarea.

Docs: [Introduction](https://docs.typesafe.ai/introduction) · [Primitives](https://docs.typesafe.ai/primitives)

## Run it

1. Copy `.env.example` to `.env.local`
2. Paste your key from the [TypeSafe dashboard](https://console.typesafe.ai)
3. `npm install`
4. `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

The API key stays on the server. The browser only sends ticket text to `/api/triage`.

## What this demo asks

One `systemOne` call, three questions, then `routeTicket` in code:

- **Choice** `department`: billing / technical / sales
- **Score** `frustration`: calm → angry
- **Noul** `isUrgent`: probability of yes
- **Code**: auto-route if confidence ≥ 0.6; 1-hour SLA if urgency > 0.7 or frustration ≥ 1.5
