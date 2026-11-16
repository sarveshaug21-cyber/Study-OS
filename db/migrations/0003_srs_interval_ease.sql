ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "interval_days" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "ease_factor" numeric(4,2) DEFAULT 2.5 NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "flashcards_interval_days_idx" ON "flashcards" USING btree ("interval_days");
