# Study OS

A polished, responsive study workspace for **GCSE**, **International GCSE**, **A-level** and **International A-level** across **AQA**, **Pearson Edexcel**, **OCR**, **WJEC**, **Eduqas** and **CCEA**.

Demo mode works with no database or credentials. With Supabase configured, the same UI persists data per-user.

## Stack
- Next.js App Router + TypeScript, Tailwind CSS, Lucide icons
- Drizzle ORM + PostgreSQL (Supabase), `@supabase/ssr` auth

## Quick start (demo)
```bash
npm install
npm run dev   # http://localhost:3000
```

## Production checks
```bash
npm run lint
npm run typecheck
npm run build
```

## Supabase setup
1. Create a Supabase project.
2. Copy `.env.example` → `.env.local` and fill values (never commit `.env.local`).
3. `npm run db:generate` (review `db/migrations/`), then `npm run db:push` or `db:migrate`.
4. Apply `db/rls.sql` in Supabase SQL editor (RLS per user via `auth.uid()`).
5. Sign up at `/auth/signup`. `SUPABASE_SERVICE_ROLE_KEY` is server-only — never import it in client code.

## 12-phase status
| Phase | Status |
|---|---|
| 1 Auth | Implemented (SSR browser/server clients, login/signup/logout/reset/update, middleware protection, profile + settings bootstrap). Demo fallback works. |
| 2 Database/RLS | 23-table Drizzle schema + generated migration + `db/rls.sql`. Migration reviewed; not applied to any live DB. |
| 3 Persistence | REST APIs + forms for subjects, notes, decks/cards, practice, planner, sessions, progress, settings, topics, past-paper completions. Loading/success/error/empty states. |
| 4 Spec system | Catalogue of 6 boards × 4 qualifications, `/specifications`, official URLs, verified/unverified flags. No invented syllabus. |
| 5 Subject workspace | `/subjects/[id]` with specification checklist, topic completion, links to notes/cards/practice/papers/AI. |
| 6 Notes & flashcards | Markdown notes, deck/card CRUD APIs, spaced-repetition scheduling + review history. |
| 7 Practice | Question create/attempt APIs; source labels (official/generated/user-created). |
| 8 Past papers | Library + official-source panel (links, no scraping/copying), completion tracking API. |
| 9 AI tutor | `/api/ai` provider abstraction: Open Notebook (default) or OpenRouter via env. Chat persists conversations/messages; canned fallback only in demo. |
| 10 Planner & analytics | Planner APIs + session logging; `/api/progress` analytics shown via `RealAnalytics`. |
| 11 Search/settings/updates | Global `/api/search` + header search (⌘K), settings API, manual spec-update monitoring API + panel (no fake cron). |
| 12 Readiness | lint/typecheck/build verified; see remaining manual steps below. |

## AI configuration
Server-only env: `AI_PROVIDER`, `OPEN_NOTEBOOK_URL`, `OPEN_NOTEBOOK_API_URL`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_BASE_URL`. Chat is clearly labelled as AI-generated; failures show an error and fall back to demo replies only when Supabase/AI is unconfigured.

## Security
- `.env.local` is git-ignored; `.env.example` has placeholders only.
- Service-role key is only imported in `lib/supabase/admin.ts`.
- RLS policies scope every user table to `auth.uid()`.
- No secrets in repository history (`git ls-files` shows no `.env*` besides `.env.example`).

## Remaining manual steps before production
- Create Supabase project, set `.env.local`, apply migrations + RLS, confirm signup/login end-to-end.
- Verify Open Notebook/OpenRouter connectivity (`/api/ai`); do not claim AI is connected until tested.
- Import official specification topics per board (currently personal/unverified flags only).
- Schedule monthly spec-update checks (e.g., Vercel Cron / GitHub Action) — none is running by default.
