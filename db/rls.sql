-- Study OS Row Level Security — REVIEWED + CORRECTED (not executed).
--
-- IMPORTANT — READ BEFORE APPLYING:
-- 1. The Next.js server connects via DIRECT PostgreSQL (DATABASE_URL) using the
--    `postgres` owner role. Owner / BYPASSRLS roles BYPASS Row Level Security.
--    => RLS does NOT protect Drizzle queries. All application-level ownership
--       checks in app/api/** are the real enforcement point.
-- 2. RLS below protects ONLY paths that go through PostgREST / Supabase clients
--    using anon/authenticated roles (e.g. future browser-side queries).
-- 3. Apply ONLY after a separate reviewed migration. Do not apply alongside
--    unchecked `db:push` output.
--
-- To make RLS meaningful for the server path, connect Drizzle with a
-- restricted role (REVOKE BYPASSRLS) or use the Supabase JS client with the
-- user's JWT. Until then, RLS is defense-in-depth, NOT primary security.

-- Enable RLS on every table
alter table public.users enable row level security;
alter table public.subjects enable row level security;
alter table public.notes enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.practice_questions enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.planner_tasks enable row level security;
alter table public.progress_records enable row level security;
alter table public.study_sessions enable row level security;
alter table public.topic_progress enable row level security;
alter table public.bookmarks enable row level security;
alter table public.flashcard_reviews enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.user_settings enable row level security;
alter table public.past_paper_completions enable row level security;
alter table public.exam_boards enable row level security;
alter table public.qualifications enable row level security;
alter table public.specifications enable row level security;
alter table public.topics enable row level security;
alter table public.past_papers enable row level security;
alter table public.spec_updates enable row level security;

-- Users table: row id IS the Supabase Auth UUID
create policy "users own" on public.users for all using (id = auth.uid()) with check (id = auth.uid());

-- User-owned tables
create policy "subjects own" on public.subjects for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notes own" on public.notes for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "decks own" on public.flashcard_decks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "flashcards own" on public.flashcards for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "practice_questions own" on public.practice_questions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "practice_attempts own" on public.practice_attempts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "planner_tasks own" on public.planner_tasks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "progress_records own" on public.progress_records for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "study_sessions own" on public.study_sessions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "topic_progress own" on public.topic_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "bookmarks own" on public.bookmarks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "flashcard_reviews own" on public.flashcard_reviews for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ai_conversations own" on public.ai_conversations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "user_settings own" on public.user_settings for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "past_paper_completions own" on public.past_paper_completions for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "ai_messages via conversation" on public.ai_messages for all
  using (exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid()));

-- Topics FIX: was `using (true)` — leaked ALL private topics.
-- Public topics require BOTH user_id IS NULL AND is_official = true.
-- Shared/unverified topics (user_id IS NULL but is_official = false) are hidden.
-- Private topics only by owner; writes only by owner.
create policy "topics official read" on public.topics for select
  using (user_id is null and is_official = true and auth.uid() is not null);
create policy "topics own read" on public.topics for select
  using (user_id = auth.uid());
create policy "topics own write" on public.topics for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Catalogue tables: read-only for ordinary authenticated users.
-- No INSERT/UPDATE/DELETE policies = no writes via RLS-enforced roles.
create policy "catalog read" on public.exam_boards for select using (auth.uid() is not null);
create policy "qualifications read" on public.qualifications for select using (auth.uid() is not null);
create policy "specifications read" on public.specifications for select using (auth.uid() is not null);
create policy "past_papers read" on public.past_papers for select using (auth.uid() is not null);
create policy "spec_updates read" on public.spec_updates for select using (auth.uid() is not null);
