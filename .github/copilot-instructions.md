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


<!-- .github/copilot-instructions.md
     Focused, actionable guidance for AI coding agents working in this repo.
-->

# Quick orientation

This is a Next.js (app router) TypeScript app that uses Supabase (auth + storage), Prisma (DB + migrations), and Vapi (@vapi-ai/web) for interview voice/AI analysis. UI is React (server/client) with Tailwind.

Start here (minimal reading order):
- `src/utils/supabase/server.ts` — server-only Supabase client helpers (use these in Server Components and API routes).
- `src/utils/supabase/middleware.ts` + top-level `middleware.ts` — cookie handling; must return the mutated `response` from `createMiddlewareClient()`.
- `src/app/api/**/route.ts` — API route patterns; internal calls propagate auth via `X-User-*` headers (e.g. `X-User-Id`).
- Vapi surface: `src/lib/vapi-assistant-service.ts`, `src/lib/vapi-assistant-config.ts`, `src/hooks/useVapi.ts`, `src/app/api/vapi/webhook/route.ts`.

Key commands (from `package.json`):
- Dev: `npm run dev`
- Build: `npm run build` (runs `prisma generate` before `next build`)
- Start prod: `npm run start`
- Tests: `npm run test` (watch: `npm run test:watch`)
- Prisma helpers: `npm run db:generate`, `npm run db:migrate`, `npm run db:seed`, `npm run db:studio`

Project-specific rules & gotchas (do not skip):
- Supabase server vs client: always use the server helper in `src/utils/supabase/server.ts` on server-side code. Client components must only reference `NEXT_PUBLIC_SUPABASE_*` env vars.
- Middleware cookie pattern: `createMiddlewareClient()` mutates and returns a `response` object — the middleware must return that mutated `response` or auth cookies won't persist.
- Auth propagation: internal server-to-server requests rely on `X-User-*` headers (e.g. `X-User-Id`, `X-User-Email`). Tests and mocks expect this exact pattern (`src/__tests__/middleware/*`).
- Vapi assistant: the app uses a single shared assistant. Prefer `NEXT_PUBLIC_VAPI_ASSISTANT_ID` instead of creating assistants per interview (see `VAPI_SINGLE_ASSISTANT_FIX.md`).
- Webhook & secrets: webhook handlers validate `VAPI_WEBHOOK_SECRET` and use `VAPI_PRIVATE_KEY` server-side — never expose these to client bundles.

DB/PR workflow notes:
- Edit `prisma/schema.prisma`, then run `npm run db:generate` and `npm run db:migrate` locally. `npm run build` runs `prisma generate` as well — build before opening PRs.
- If you change server DB code, update tests and `src/__tests__/middleware/*` mocks when auth flows change.

Files to scan for examples and patterns:
- Auth & middleware: `middleware.ts`, `src/utils/supabase/middleware.ts`, `src/utils/supabase/server.ts`
- Vapi & interview flow: `src/lib/vapi-assistant-service.ts`, `src/lib/interview-session.ts`, `src/lib/interview-analysis.ts`, `src/app/api/vapi/webhook/route.ts`
- Tests & mocks: `src/__tests__/middleware/*`, `jest.config.js`, `jest.setup.js`

Minimal PR checklist for AI agents:
1. Reference changed files in PR description.
2. Run `npm run build` and fix build/type errors.
3. Run `npm test` and fix failing Jest tests (check `src/__tests__/middleware/*` first).
4. Ensure no server-only envs leak to client bundles: `SUPABASE_SERVICE_ROLE_KEY`, `VAPI_PRIVATE_KEY`, `VAPI_WEBHOOK_SECRET`, `DATABASE_URL`.

If anything here is unclear or you want concrete examples (local DB setup, migration commands, test-mock snippets), tell me which section to expand.
# Fast commands (verified)
