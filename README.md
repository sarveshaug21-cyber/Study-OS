# Study OS

A polished, responsive study workspace demo for students preparing for **GCSE**, **International GCSE**, **A-level** and **International A-level** across **AQA**, **Pearson Edexcel**, **OCR**, **WJEC**, **Eduqas** and **CCEA**.

The app uses realistic static demo data. It does not require a database, network access or credentials to build or run, and the temporary workspace contains no user data.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Drizzle ORM with PostgreSQL (Supabase-compatible)
- Lucide icons

## Screens

- Dashboard
- Subjects
- Notes
- Flashcards
- Practice Questions
- Past Papers
- AI Tutor (simulated, browser-only responses)
- Planner
- Progress
- Settings

Interactive demo behaviour includes subject, note, question and past-paper filtering, flashcard review, answer reveals, planner task completion and adding a study block, a simulated AI chat, and local-only settings.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Environment

Copy `.env.example` to `.env.local` and fill in values from your own Supabase project when you are ready to connect a database:

```bash
cp .env.example .env.local
```

Next.js loads `.env.local` automatically. Drizzle Kit does not read `.env.local` by default, so export `DATABASE_URL` in your shell or copy the value into `.env` before running database scripts.

Placeholder variable names:

- `DATABASE_URL` — Supabase PostgreSQL connection string, preferably the transaction pooler URL.
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous/public key.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only service role key. Never expose this in client code.

The demo UI does not read these values. The database client is lazy and only created when `getDb()` is called, so production builds work with no credentials configured.

## Supabase + Drizzle

1. Create a Supabase project.
2. Copy the PostgreSQL connection string into `DATABASE_URL`. Use the pooler connection for serverless deployments.
3. Review `db/schema.ts`. It defines users, subjects, notes, flashcard decks and cards, practice questions and attempts, planner tasks, progress records and past papers, with PostgreSQL enums for exam boards, qualification levels, difficulty, task status and priority.
4. Generate SQL with `npm run db:generate`.
5. Apply it with `npm run db:push` or `npm run db:migrate` once you have a real project and are ready to manage schema changes.
6. Enable Row Level Security on every user-owned table and add policies that scope rows to `auth.uid()`. Keep the service role key server-side only.

No migrations, seeds or database connections are run by this demo.

## Scripts

```bash
npm run dev         # development server
npm run build       # production build (no database required)
npm run start       # serve the production build
npm run lint        # ESLint
npm run typecheck   # TypeScript check
npm run db:generate # generate Drizzle migrations
npm run db:migrate  # apply migrations
npm run db:push     # push schema to a database
npm run db:studio   # open Drizzle Studio
```

## Data notice

All names, grades, notes, questions, papers and progress figures are fictional demo content. No user data is stored in this workspace, and the sample AI tutor replies are hard-coded in the client.
