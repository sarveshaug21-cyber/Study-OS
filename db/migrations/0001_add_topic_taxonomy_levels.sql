CREATE TYPE "public"."mark_scheme_type" AS ENUM('official', 'generated');--> statement-breakpoint
CREATE TYPE "public"."topic_level" AS ENUM('subject', 'unit', 'chapter', 'topic');--> statement-breakpoint
CREATE TABLE "drive_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"drive_file_id" text NOT NULL,
	"name" text NOT NULL,
	"mimeType" text NOT NULL,
	"size" text,
	"parent_id" text NOT NULL,
	"board" "exam_board",
	"qualification" "qualification_level",
	"subject" text,
	"spec_code" text,
	"resource_type" text,
	"source_url" text,
	"verified" boolean DEFAULT false NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "examiner_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"past_paper_id" uuid NOT NULL,
	"title" text NOT NULL,
	"official_url" text,
	"source_url" text,
	"document_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "google_drive_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_encrypted" text NOT NULL,
	"folder_id" text NOT NULL,
	"folder_name" text,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "google_drive_connections_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "mark_schemes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"past_paper_id" uuid NOT NULL,
	"source_type" "mark_scheme_type" DEFAULT 'official' NOT NULL,
	"title" text NOT NULL,
	"official_url" text,
	"source_url" text,
	"document_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specification_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"specification_id" uuid NOT NULL,
	"version" text NOT NULL,
	"title" text NOT NULL,
	"official_url" text,
	"first_teaching" timestamp with time zone,
	"first_assessment" timestamp with time zone,
	"change_summary" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic_hierarchy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_topic_id" uuid NOT NULL,
	"child_topic_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "level" "topic_level" DEFAULT 'topic' NOT NULL;--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "parent_topic_id" uuid;--> statement-breakpoint
ALTER TABLE "drive_files" ADD CONSTRAINT "drive_files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "examiner_reports" ADD CONSTRAINT "examiner_reports_past_paper_id_past_papers_id_fk" FOREIGN KEY ("past_paper_id") REFERENCES "public"."past_papers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_drive_connections" ADD CONSTRAINT "google_drive_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mark_schemes" ADD CONSTRAINT "mark_schemes_past_paper_id_past_papers_id_fk" FOREIGN KEY ("past_paper_id") REFERENCES "public"."past_papers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specification_versions" ADD CONSTRAINT "specification_versions_specification_id_specifications_id_fk" FOREIGN KEY ("specification_id") REFERENCES "public"."specifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_hierarchy" ADD CONSTRAINT "topic_hierarchy_parent_topic_id_topics_id_fk" FOREIGN KEY ("parent_topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_hierarchy" ADD CONSTRAINT "topic_hierarchy_child_topic_id_topics_id_fk" FOREIGN KEY ("child_topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "drive_files_user_drive_file_idx" ON "drive_files" USING btree ("user_id","drive_file_id");--> statement-breakpoint
CREATE UNIQUE INDEX "spec_versions_spec_version_idx" ON "specification_versions" USING btree ("specification_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "topic_hierarchy_parent_child_idx" ON "topic_hierarchy" USING btree ("parent_topic_id","child_topic_id");--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_parent_topic_id_topics_id_fk" FOREIGN KEY ("parent_topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "topics_subject_id_idx" ON "topics" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "topics_parent_topic_id_idx" ON "topics" USING btree ("parent_topic_id");--> statement-breakpoint
CREATE INDEX "topics_level_idx" ON "topics" USING btree ("level");