# Deep Research (Temporal-backed agent)

This is a small “deep research” agent. A user submits a query in the web UI, a Temporal workflow orchestrates tool calls (search, relevance marking, page fetch), and the UI shows the live status and results.

## What this project demonstrates

- Temporal is the only orchestration system
- Each tool call maps to Temporal activity execution (the web search tool is a composite child workflow that still uses activities for each external call)
- Workflow code is deterministic
- Activities are isolated
- Frontend starts the workflow and shows status/results

## Architecture at a glance

- **Frontend**: Next.js (App Router)
- **Backend**: Next.js API routes
- **Workflow engine**: Temporal (Node SDK)
- **Worker**: Single unified worker (`deep-research` task queue) with all activities and workflows
- **DB**: Postgres with Prisma

> Note: More details and diagrams are in `ARCHITECTURE.md`.

## Systems thinking

- Clear separation: UI, API, workflow orchestration, activities, and persistence are isolated.
- State is stored as message blocks so the UI can show progress without extra schemas.

## Quick start

1. Copy env file: `cp .env.example .env` and fill in API keys.
2. Start Docker desktop
3. Start Postgres: `npm run docker:up`
4. Install deps: `npm install`
5. Run Prisma migrate: `npm run prisma:migrate`
6. Start Temporal: `temporal server start-dev`
7. Start Deep Research UI and Worker: `npm run dev`

## How a request flows

1. User submits a query in `/chat/new`.
2. Frontend creates a `conversationId` and POSTs to `/api/conversations/:id/messages`.
3. API stores the user message and starts `deepResearchWorkflow` in Temporal.
4. Workflow:
   - Runs a main LLM step to decide tool calls.
   - For web search calls, spawns child workflows for each sub-query.
   - Scores relevance and fetches page text as needed.
   - Writes each step to the DB as structured message blocks.
5. UI polls `/api/conversations/:id` until the status is `completed` or `failed`.

## Where key logic lives

- Workflow orchestration: `apps/worker/src/workflows/deepResearchWorkflow.ts`
- Child search workflow: `apps/worker/src/workflows/subSearchWorkflow.ts`
- Activity timeouts/retries: `apps/worker/src/workflows/activityProxies.ts`
- Activities:
  - Web search: `apps/worker/src/activities/executeWebSearch.ts`
  - Relevance scoring: `apps/worker/src/activities/assessResultRelevance.ts`
  - Page fetch: `apps/worker/src/activities/executeFetchWebPage.ts`
  - DB writes: `apps/worker/src/activities/writeMessage.ts` + `updateConversationStatus.ts`
- Workflow start API: `apps/web/app/api/conversations/[id]/messages/route.ts`

## Workflows vs Activities

- The **workflow** owns the plan and state: it decides which tools to call, in what order, and when to stop.
- **Activities** do side-effectful work (LLM calls, DB writes, web search/fetch). This keeps workflows deterministic.
- The web-search tool is a **composite** activity: the main workflow starts a child workflow that fans out to multiple activities. This keeps parallelism and retries inside a deterministic boundary.

## Failure handling (current behavior)

- Web search sub-workflows run in parallel and use `Promise.allSettled`.
- If fewer than 50% of sub-searches succeed, the tool returns a structured error.
- The workflow marks the conversation as `failed` only if the workflow throws or ends without a valid final response.

## Retries and timeouts

- Activities have explicit timeouts and retry policies in `apps/worker/src/workflows/activityProxies.ts`.
- Web, LLM, and DB operations each use different retry settings to match their failure modes.

## Determinism choices

- Workflow code only calls activities and child workflows.
- IDs are based on `conversationId` and message index (no randomness in workflow code).
- All side effects (LLM calls, API calls, DB writes) live in activities.

## Production considerations

- Split workers by activity type and apply per-queue limits (LLM vs web vs DB).
- Add auth, rate limiting, input validation, and request size limits.
- Replace polling with push updates and add tracing/metrics.
- Implement realtime streaming via Redis pub/sub or stream (SSE).

## Extension points

- Add a new tool by creating an activity, adding a tool schema in `runMainLlmStep`, and a UI block renderer.
- Add new workflows (e.g., summarization, extraction) that reuse existing activities.
- Add new content block types without changing the DB schema.
