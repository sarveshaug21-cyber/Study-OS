CREATE TABLE IF NOT EXISTS "topic_hierarchy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_topic_id" uuid NOT NULL,
	"child_topic_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "topic_hierarchy" ADD CONSTRAINT "topic_hierarchy_parent_topic_id_topics_id_fk" FOREIGN KEY ("parent_topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "topic_hierarchy" ADD CONSTRAINT "topic_hierarchy_child_topic_id_topics_id_fk" FOREIGN KEY ("child_topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "topic_hierarchy_parent_child_idx" ON "topic_hierarchy" USING btree ("parent_topic_id","child_topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "topic_hierarchy_parent_idx" ON "topic_hierarchy" USING btree ("parent_topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "topic_hierarchy_child_idx" ON "topic_hierarchy" USING btree ("child_topic_id");
