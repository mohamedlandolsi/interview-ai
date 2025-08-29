<!-- .github/copilot-instructions.md
     Purpose: focused, actionable guidance for AI coding agents working in this repo.
-->

# Quick orientation

This is a Next.js (app router) TypeScript app that combines Supabase (auth + storage), Prisma (schema & migrations), and Vapi (@vapi-ai/web) for interview voice/AI analysis. UI uses React server/client components and Tailwind.

Start here (minimal reading order):
- `src/utils/supabase/server.ts` — server-only Supabase client helpers.
- `src/utils/supabase/middleware.ts` and `middleware.ts` — cookie handling and global route protection.
- `src/app/api/**/route.ts` — canonical API route handlers and the `X-User-*` header pattern.
- Vapi surface: `src/lib/vapi-assistant-config.ts`, `src/lib/vapi-assistant-service.ts`, `src/hooks/useVapi.ts`, and the webhook `src/app/api/vapi/webhook/route.ts`.

Key commands (verified in package.json):
- Dev: `npm run dev`
- Build (runs Prisma generate): `npm run build`
- Start prod: `npm run start`
- Tests (Jest): `npm run test` (watch: `npm run test:watch`)
- Prisma helpers: `npm run db:generate`, `npm run db:migrate`, `npm run db:seed`, `npm run db:studio`

Concrete, project-specific rules and gotchas:
- Supabase server vs client: use `createClient()` from `src/utils/supabase/server.ts` inside Server Components and API routes. Client components must only use public anon keys (`NEXT_PUBLIC_SUPABASE_*`).
- Middleware cookie handling: `createMiddlewareClient()` returns `{ supabase, response }` and mutates `response`. Middleware MUST return that mutated `response` so cookies persist (see `src/utils/supabase/middleware.ts`).
- Auth headers and tests: API handlers use `X-User-*` headers (e.g., `X-User-Id`, `X-User-Email`) to carry authenticated user info in internal server-to-server calls; tests and API mocks depend on that pattern (see `src/__tests__/middleware/*`).
- Vapi assistant strategy: the repo uses a single shared assistant — prefer `NEXT_PUBLIC_VAPI_ASSISTANT_ID` and avoid creating assistants per interview (see `VAPI_SINGLE_ASSISTANT_FIX.md`).
- Webhook security: server webhook handlers validate `VAPI_WEBHOOK_SECRET` and use `VAPI_PRIVATE_KEY` server-side; do not expose these to the client.

DB/Migrations and PR workflow:
- Change models in `prisma/schema.prisma`.
- Run `npm run db:generate` then `npm run db:migrate` locally. `npm run build` triggers `prisma generate` so run build before opening a PR.
- If you change server DB code, add/modify tests and update `src/__tests__/middleware/*` mocks if auth flow changed.

Files worth scanning for examples and patterns:
- Auth & middleware: `middleware.ts`, `src/utils/supabase/middleware.ts`, `src/utils/supabase/server.ts`
- Vapi & interview: `src/lib/vapi-assistant-config.ts`, `src/lib/vapi-assistant-service.ts`, `src/hooks/useVapi.ts`, `src/lib/interview-session.ts`, `src/lib/interview-analysis.ts`, `src/app/api/vapi/webhook/route.ts`
- DB & migrations: `prisma/schema.prisma`, `supabase/migrations/`
- Tests: `src/__tests__/**`, `jest.config.js`, `jest.setup.js`, `test-vapi-prompts.js`

Minimal PR checklist for AI agents:
1. Reference changed files in PR body.
2. Run `npm run build` and fix build/type errors.
3. Run `npm test` and fix failing Jest tests (check `src/__tests__/middleware/*` and API mocks first).
4. Ensure no server secrets or service-role keys are leaked into client code. Server-only envs: `SUPABASE_SERVICE_ROLE_KEY`, `VAPI_PRIVATE_KEY`, `VAPI_WEBHOOK_SECRET`, `DATABASE_URL`.

If a section is unclear or you want examples (local DB setup, migration steps, test-mock patterns, or Vercel deploy notes), ask for that section and I will expand with concrete examples.
<!-- .github/copilot-instructions.md
     Purpose: focused, actionable guidance for AI coding agents working in this repo.
-->

# Quick orientation

Small summary: This is a Next.js (app router) TypeScript app that uses Supabase for auth/storage, Prisma for schema & migrations, and Vapi (@vapi-ai/web) for interview voice/AI analysis. UI uses React (server/client components) and Tailwind.

# Where to start (concrete)
- Read server-side Supabase helpers: `src/utils/supabase/server.ts` and `src/utils/supabase/middleware.ts` (cookie handling and `createMiddlewareClient`).
- Read `middleware.ts` (global route protection) and `src/app/api/**/route.ts` handlers to learn auth patterns (`X-User-*` headers, server `createClient()`).
- Vapi integration: `src/lib/vapi-assistant-config.ts`, `src/lib/vapi-assistant-service.ts`, `src/hooks/useVapi.ts`, and the webhook at `src/app/api/vapi/webhook/route.ts`.

# Fast commands (verified)
- Start dev: `npm run dev`
- Build (includes Prisma generate): `npm run build`
- Start production server: `npm run start`
- Tests (Jest): `npm run test`  (watch: `npm run test:watch`)
- Prisma helpers in package.json: `db:generate`, `db:migrate`, `db:seed`, `db:studio`.

# Important env vars (must NOT leak client-side secrets)
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY  (client)
- SUPABASE_SERVICE_ROLE_KEY (server/admin)
- DATABASE_URL, DIRECT_URL (Prisma/Postgres)
- NEXT_PUBLIC_VAPI_PUBLIC_KEY, NEXT_PUBLIC_VAPI_ASSISTANT_ID (client Vapi config)
- VAPI_PRIVATE_KEY, VAPI_WEBHOOK_SECRET (server-only)

# Project-specific conventions & gotchas (concrete examples)
- Single shared Vapi assistant: prefer `NEXT_PUBLIC_VAPI_ASSISTANT_ID` (see `VAPI_SINGLE_ASSISTANT_FIX.md`). Don't create assistants per interview.
- Middleware cookie handling: `createMiddlewareClient()` returns `{ supabase, response }` and mutates `response` — middleware must return that `response` so cookies persist.
- Server vs client Supabase: inside Server Components / API routes use `createClient()` from `src/utils/supabase/server.ts`. Tests rely on middleware mocks in `src/__tests__/middleware/*`.
- API route handlers use Next.js route handler pattern under `src/app/api/**/route.ts` — follow existing `X-User-*` header and auth patterns.

# Testing & edits workflow
- When changing server logic that touches the DB, update Prisma schema + run `npm run db:generate` and `npm run db:migrate` locally (see `prisma/schema.prisma`).
- Tests mock Supabase middleware; if you modify middleware or auth, update `src/__tests__/middleware/*` mocks to keep Jest green.

# Files to reference (quick map)
- Auth & middleware: `middleware.ts`, `src/utils/supabase/middleware.ts`, `src/utils/supabase/server.ts`
- Vapi & interview: `src/lib/vapi-assistant-config.ts`, `src/lib/vapi-assistant-service.ts`, `src/hooks/useVapi.ts`, `src/lib/interview-session.ts`, `src/lib/interview-analysis.ts`, `src/app/api/vapi/webhook/route.ts`
- DB & migrations: `prisma/schema.prisma`, `supabase/migrations/`
- Tests: `src/__tests__/**`, `test-vapi-prompts.js`, `test-enhanced-analysis.js`

# Quick PR checklist for AI agents
- Reference changed files in the PR description.
- Run `npm run build` (this runs `prisma generate` first) and fix build errors.
- Run `npm test` and fix failing Jest tests (check middleware/api mocks first).

If any section is unclear or you'd like extra examples (local DB setup, Vercel deploy notes, or test mocks), tell me which and I will expand.
