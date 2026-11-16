ALTER TABLE "past_paper_completions" ADD COLUMN IF NOT EXISTS "duration_seconds" integer;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "past_paper_completions_duration_idx" ON "past_paper_completions" (duration_seconds);
