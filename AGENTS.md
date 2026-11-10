# Study OS — Agent Notes

Next.js 15 App Router + React 19 + TS. Drizzle ORM + Supabase (Postgres/Auth). Docker standalone deploy.

## Commands
- `npm run dev` — dev server (port 3000)
- `npm run lint` → `npm run typecheck` → `npm run test` → `npm run build` (run in this order)
- `npm run test` runs tsx over `tests/*.test.ts`
- `npm run db:generate` / `db:push` / `db:migrate` / `db:studio` (Drizzle Kit)
- Docker: `docker compose --env-file .env.local -f docker-compose.studyos.yml up -d --build` (build args need `.env.local` present at build time)
- Health: `GET /api/health`

## Env & secrets
- `.env.local` is gitignored; never commit. `.env.example` is the template.
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are browser-safe; `SUPABASE_SERVICE_ROLE_KEY` and `DATABASE_URL` are server-only (`lib/supabase/admin.ts` uses `server-only`).
- Drizzle reads `DATABASE_URL` from process env, **not** `.env.local` — export it (e.g. `set -a; . ./.env.local; set +a`) before `db:*` commands.
- Supabase pooler requires `prepare: false` (set in `db/index.ts`).

## Demo mode
- App works with no credentials. `lib/env.ts` `supabaseConfigured()`/`databaseConfigured()` gate everything.
- `middleware.ts` passes through when Supabase env is missing; `withUser` (in `lib/api-helpers.ts`) returns 503 "Database not configured" in demo mode. Do not remove these fallbacks.

## Auth & ownership
- `requireUserId()` (lib/auth.ts) verifies Supabase session and upserts profile + settings.
- Every API route under `app/api/**` must wrap handlers in `withUser` and scope queries by `userId`. Use helpers in `lib/api-helpers.ts` (`assertOwnedSubject`, `assertOwnedDeck`, `assertTopicVisible`, etc.).
- `users.id` = Supabase Auth UUID. `ensureProfile` creates rows on first login.
- Email is intentionally NOT updatable via settings (security: prevents ADMIN_EMAILS spoofing). Use Supabase Auth flow.

## Data model & RLS
- 23 tables in `db/schema.ts`; migration `db/migrations/0000_careful_warbound.sql`; RLS in `db/rls.sql` (unapplied by default).
- Drizzle connects as the Postgres owner role, which **bypasses RLS**. App-level ownership checks are the real enforcement; RLS is defense-in-depth. Do not claim RLS protects Drizzle queries.
- Topics visibility rule: `user_id IS NULL AND is_official = true` (public) OR owned by user. Private topics must never leak via search/topics GET.

## AI / Open Notebook
- Provider abstraction in `lib/ai/provider.ts` + `lib/ai/providers.ts`. Default OpenRouter model: `liquid/lfm-3-1.7b:free` (Open Notebook config).
- Open Notebook API at `OPEN_NOTEBOOK_API_URL` (default `http://192.168.1.191:5055`). Calls `/api/chat/sessions` then `/api/chat/execute` with `context: { system }`.
- `lib/ai/prompts.ts` `buildSystemPrompt()` assembles server-side prompt: core + year profile + exam board + qualification + subject + topic + student context. System prompts never go to the client.
- Year groups: **only** Year 10–13 (`YEAR_GROUPS`). Year 7/8/9 must not appear. `isYearGroup()` validates. AI requests without a year group return 400 ("Please select your year group in Settings").
- Admin gate (`spec-updates` POST) uses JWT-confirmed Auth email via `getCurrentUser()`, compared to `ADMIN_EMAILS` env var (deny-all if unset).

## Conventions
- `lib/validation.ts` holds pure, testable validators (ValidationError → 400). Reuse; don't inline.
- Errors: 400 validation, 401 auth, 403 forbidden, 404 not found, 500 generic "Internal server error" (details logged server-side only). Never leak DB/driver messages.
- `app/api/health/route.ts` returns `{ status: "ok" }` — used by Docker healthcheck (must bind 127.0.0.1, not localhost, due to IPv6).
- Dockerfile produces standalone output; `next.config.ts` has `output: "standalone"`. No `public/` dir exists — Dockerfile copies `app/icon.svg`.
- Tests use `node:test` via tsx; add tests under `tests/*.test.ts` and update the `test` script.

## Gotchas
- `middleware.ts` protected list does not include `/research` or `/specifications` (intentional — they're accessible). Add new protected routes to `PROTECTED` array.
- `db:push` may hang on Supabase pooler — prefer applying migration SQL directly if needed.
- Open Notebook container may lose connectivity to SurrealDB after firewall resets; see `/etc/systemd/system/study-portal-docker-firewall.service` (PartOf=docker.service).
- Never commit `.env.local`, `node_modules`, `.next`, or build artifacts. `.gitignore` already covers them.