<!-- .github/copilot-instructions.md
     Purpose: concise, actionable guidance for AI coding agents working in this repo.
-->

# Quick orientation

Next.js (app router) TypeScript app using Supabase (auth + storage), Prisma (DB + migrations), and Vapi (@vapi-ai/web) for interview voice/AI analysis. UI mixes server and client React components and Tailwind.

Start here (minimal reading order):
- `src/utils/supabase/server.ts` — server-only Supabase helper for Server Components and API routes.
- `src/utils/supabase/middleware.ts` + top-level `middleware.ts` — global cookie/auth handling. See the cookie mutation note below.
- `src/app/api/**/route.ts` — canonical API route handlers; internal server-to-server requests use `X-User-*` headers.
- Vapi: `src/lib/vapi-assistant-config.ts`, `src/lib/vapi-assistant-service.ts`, and `src/app/api/vapi/webhook/route.ts`.

# Quick commands
- Dev: `npm run dev`
- Build: `npm run build` (runs `prisma generate` before `next build`)
- Tests: `npm run test` (watch: `npm run test:watch`)
- Prisma helpers: `npm run db:generate`, `npm run db:migrate`, `npm run db:seed`, `npm run db:studio`

# Project-specific must-read points
- Supabase server vs client: always use `src/utils/supabase/server.ts` for server code. Client code must only read `NEXT_PUBLIC_*` envs.
- Middleware cookie mutation: `createMiddlewareClient()` mutates and returns a `response` — `middleware.ts` MUST return that mutated `response` for cookies/auth to persist.
- Auth propagation: internal APIs rely on `X-User-*` headers (exact names matter: `X-User-Id`, `X-User-Email`). Tests/mocks depend on this pattern (`src/__tests__/middleware/*`).
- Single Vapi assistant: the app uses one shared assistant. Use `NEXT_PUBLIC_VAPI_ASSISTANT_ID` instead of creating assistants per interview (`VAPI_SINGLE_ASSISTANT_FIX.md`).
- Webhooks & secrets: webhook endpoints validate `VAPI_WEBHOOK_SECRET` and use `VAPI_PRIVATE_KEY` server-side — never leak these to client bundles.

# Concrete examples / files to inspect
- Cookie middleware (critical): `middleware.ts` and `src/utils/supabase/middleware.ts` — search for `createMiddlewareClient()` and confirm the mutated response is returned.
- Server Supabase usage: `src/utils/supabase/server.ts` — patterns for server-side auth and storage operations.
- API auth headers: `src/app/api/**/route.ts` — examples showing `X-User-*` header propagation.
- Vapi & webhook flow: `src/lib/vapi-assistant-service.ts` and `src/app/api/vapi/webhook/route.ts` — how webhooks verify `VAPI_WEBHOOK_SECRET`.

# Minimal PR checklist for AI agents
1. Reference changed files in your PR description.
2. Run `npm run build` and fix TypeScript/build errors (build runs `prisma generate`).
3. Run `npm test`; if you touch auth/middleware, check `src/__tests__/middleware/*` first.
4. Ensure no server-only env vars leak into client bundles: `SUPABASE_SERVICE_ROLE_KEY`, `VAPI_PRIVATE_KEY`, `VAPI_WEBHOOK_SECRET`, `DATABASE_URL`.

If you want a short code snippet for any item above (middleware return pattern, an API route adding `X-User-*`, or Vapi webhook verification), tell me which and I'll append it.
