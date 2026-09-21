<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Inbox dispatch (Jev demo)

Learning demo, not production. One page: paste a support email, Jev answers typed questions, **code** picks the queue.

Live docs are the source of truth: https://docs.typesafe.ai/llms.txt  
Start here: https://docs.typesafe.ai/primitives.md

## Stack

- Next.js App Router + TypeScript + Tailwind 4
- `@typesafe-ai/sdk` on the **server only** (`TypeSafeClient`, `choice` / `score` / `noul`)
- Env: `TYPESAFE_API_KEY` in `.env` or `.env.local` (never `NEXT_PUBLIC_*`)
- Default model: `jev-latest`

## Layout

| File | Role |
| --- | --- |
| `lib/questions.ts` | Jev questions. Edit instructions/criteria here. |
| `lib/thresholds.ts` | Confidence / SLA cutoffs. Safe to import from the client. |
| `lib/routeTicket.ts` | If/else on answers. This is the product logic. |
| `lib/types.ts` | JSON shapes for `/api/triage` and the UI. |
| `lib/samples.ts` | Three canned tickets. |
| `app/api/triage/route.ts` | `systemOne({ state: ticket, questions })` then `routeTicket`. |
| `app/triage-board.tsx` | Client UI. Do not import the SDK here. |

## Rules when changing TypeSafe code

1. **Ask every question in one `systemOne` call.** Questions are independent and run in parallel. Do not add a second request unless the next question needs the first answer to build new state or options.
2. **One judgment per question.** Split factors; compose in `routeTicket`.
3. **Question IDs are for code only.** They are not sent to the model. Put the full question in `instructions`.
4. **Keep questions and thresholds in those two files.** Do not scatter cutoffs in the UI.
5. **Do not invent request/response fields.** Read the JS SDK or https://docs.typesafe.ai/sdk/javascript.md if unsure.
6. **Choice / Score have `confidence`.** Noul does not — a Noul of `0.5` means unsure, not “medium intensity.”
7. **Never import `@typesafe-ai/sdk` from a client component.** Client may import `lib/types.ts`, `lib/samples.ts`, `lib/thresholds.ts` only.

## Current routing (do not “improve” unless asked)

- `department.confidence < 0.6` → queue `human-review`
- else queue = `department.choice`
- `isUrgent.noul > 0.7` or `frustration.score >= 1.5` → SLA `1 hour`, else `24 hours`

## Commands

```bash
npm install
npm run dev    # http://localhost:3000
```

Verify UI in the browser after visual or routing changes. Click all three samples.
