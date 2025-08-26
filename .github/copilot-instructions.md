<!-- .github/copilot-instructions.md
     Purpose: targeted, actionable guidance for AI coding agents working in this repo.
-->

# Quick orientation

This is a Next.js (app router) TypeScript app that uses Supabase for auth/storage, Prisma for schema/migrations, and Vapi (@vapi-ai/web) for voice/AI interview analysis. The UI uses React (Server/Client components mix) and Tailwind.

Keep these high-level constraints in mind:
- App router + Server Components: many modules run on the server; prefer `src/utils/supabase/server.ts` for server-side Supabase clients and `src/utils/supabase/middleware.ts` for middleware cookie handling.
- Auth + route protection are implemented in `middleware.ts` using `createMiddlewareClient(request)` from `src/utils/supabase/middleware.ts`.
- Vapi integration is centralized: assistant configuration and lifecycle live in `src/lib/vapi-assistant-config.ts`, `src/lib/vapi-assistant-service.ts`, and the client hook `src/hooks/useVapi.ts`.

# Fast commands
- Start dev server: npm run dev
- Build: npm run build (runs `prisma generate && next build`)
- Start after build: npm run start
- Tests: npm run test (jest). Watch: npm run test:watch
- Prisma: npm run db:generate, db:migrate, db:reset, db:seed, db:studio

# Important environment variables (set before running dev/build)
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY — required for Supabase client
- SUPABASE_SERVICE_ROLE_KEY — required for admin server operations
- DATABASE_URL, DIRECT_URL — Prisma/Postgres connection
- NEXT_PUBLIC_VAPI_PUBLIC_KEY, NEXT_PUBLIC_VAPI_ASSISTANT_ID — client Vapi config
- VAPI_PRIVATE_KEY, VAPI_WEBHOOK_SECRET — server-side Vapi integration (assistant creation, webhooks)

# Architecture & data flow (short)
- User auth & profiles: Supabase Auth + `Profile` table in Prisma (`prisma/schema.prisma`). Middleware refreshes sessions for Server Components.
- Interview lifecycle: UI/API creates an InterviewSession -> `useVapi` / Vapi assistant runs the voice call -> API stores `vapi_call_id` and `vapi_assistant_id` on the session -> Vapi posts events to `/api/vapi/webhook` -> `src/lib/interview-analysis.ts` consumes structured Vapi outputs and writes enhanced fields back to `interview_sessions` (e.g., `vapi_summary`, `vapi_structured_data`, `analysis_score`).

# Project-specific conventions & gotchas
- Single reusable Vapi assistant: codebase moved to using a single assistant (see `VAPI_SINGLE_ASSISTANT_FIX.md`). Prefer `NEXT_PUBLIC_VAPI_ASSISTANT_ID` over creating assistants per-interview.
- Middleware cookie handling: `createMiddlewareClient()` returns { supabase, response } and mutates the response cookies; middleware expects you to return that `response` so headers/cookies persist.
- Server vs client Supabase clients: use `createClient()` (server) from `src/utils/supabase/server.ts` inside Server Components / API routes; do not try to set cookies from Server Components — `createClient()` traps setAll errors and documents this behavior.
- API routes follow Next.js route handlers under `src/app/api/**/route.ts`. Many API handlers expect `X-User-*` or use `createClient()` for auth.
- Tests mock Supabase middleware. See `src/__tests__/middleware/*` and integration tests for mocking patterns.

# Where to look for examples
- Auth & protection: `middleware.ts`, `src/utils/supabase/middleware.ts`, `src/utils/supabase/server.ts`
- Vapi assistant & prompts: `src/lib/vapi-assistant-config.ts`, `src/lib/vapi-assistant-service.ts`, `src/hooks/useVapi.ts`, `src/app/api/vapi/webhook/route.ts`
- Interview session lifecycle: `src/lib/interview-session.ts`, `src/lib/interview-analysis.ts`, `prisma/schema.prisma`
- DB & migrations: `prisma/schema.prisma`, `supabase/migrations/`, package.json prisma scripts
- Tests and debugging aids: `__tests__/**`, `test-vapi-prompts.js`, `test-enhanced-analysis.js`

# Best-effort rules for making edits
- When changing server behavior, update/verify Prisma migrations and seeds (`prisma/` + `npm run db:generate`, `npm run db:migrate`, `npm run db:seed`).
- When changing auth or middleware, update `src/__tests__/middleware/*` mocks to avoid breaking CI tests.
- Keep Vapi keys and webhook secret strictly server-only. Do not leak them into client bundles.

# Quick PR checklist for AI agents
- Reference the exact files you changed in the PR description.
- Run `npm run build` locally to catch build-time errors (this runs `prisma generate` first).
- Run `npm test` and fix failing Jest tests related to middleware/api mocks.

If anything here is unclear or you want the instructions to emphasize another area (local dev DB, Vercel deploy notes, or test harnesses), tell me which section to expand.
