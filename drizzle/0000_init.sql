CREATE TYPE "public"."event_status" AS ENUM('scheduled', 'postponed', 'cancelled', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."join_status" AS ENUM('pending', 'reviewing', 'accepted', 'rejected', 'archived');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('in_progress', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('pending', 'under_review', 'accepted', 'rejected', 'needs_changes');--> statement-breakpoint
CREATE TYPE "public"."team_position" AS ENUM('president', 'vice_president', 'secretary', 'vice_secretary', 'senior_treasurer', 'junior_treasurer', 'editor', 'junior_editor', 'committee_member');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'admin', 'editor');--> statement-breakpoint
CREATE TABLE "event_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"alt_text" varchar(200) DEFAULT '' NOT NULL,
	"caption" varchar(240),
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(160) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"excerpt" varchar(320) NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"cover_image" text,
	"start_date" date NOT NULL,
	"end_date" date,
	"start_time" time,
	"end_time" time,
	"location" varchar(200),
	"organizer" varchar(160),
	"registration_url" text,
	"status" "event_status" DEFAULT 'scheduled' NOT NULL,
	"category" varchar(60) DEFAULT 'Workshop' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "join_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(120) NOT NULL,
	"email" varchar(254) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"registration_number" varchar(40) NOT NULL,
	"academic_year" integer NOT NULL,
	"degree" varchar(120) NOT NULL,
	"interests" text[] DEFAULT '{}'::text[] NOT NULL,
	"skills" text NOT NULL,
	"reason" text NOT NULL,
	"linkedin_url" text,
	"github_url" text,
	"status" "join_status" DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"alt_text" varchar(200) DEFAULT '' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"team_member_id" uuid,
	"member_name" varchar(120) NOT NULL,
	"role" varchar(80)
);
--> statement-breakpoint
CREATE TABLE "project_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(160) NOT NULL,
	"slug_candidate" varchar(180) NOT NULL,
	"short_description" varchar(320) NOT NULL,
	"full_description" text NOT NULL,
	"category" varchar(60) NOT NULL,
	"technologies" text[] DEFAULT '{}'::text[] NOT NULL,
	"project_year" integer NOT NULL,
	"cover_image" text,
	"screenshots" text[] DEFAULT '{}'::text[] NOT NULL,
	"github_url" text,
	"live_url" text,
	"portfolio_url" text,
	"linkedin_url" text,
	"video_url" text,
	"team_members" text[] DEFAULT '{}'::text[] NOT NULL,
	"submitter_name" varchar(120) NOT NULL,
	"submitter_email" varchar(254) NOT NULL,
	"status" "submission_status" DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" uuid,
	"accepted_project_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_technologies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(40) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(160) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"excerpt" varchar(320) NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"cover_image" text,
	"github_url" text,
	"live_url" text,
	"video_url" text,
	"year" integer NOT NULL,
	"category" varchar(60) NOT NULL,
	"status" "project_status" DEFAULT 'completed' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit_hits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(128) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" varchar(60) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_term_id" uuid NOT NULL,
	"full_name" varchar(120) NOT NULL,
	"position" "team_position" NOT NULL,
	"academic_year" integer NOT NULL,
	"image" text,
	"bio" varchar(400),
	"linkedin_url" text,
	"portfolio_url" text,
	"github_url" text,
	"email" varchar(254),
	"display_order" integer DEFAULT 0 NOT NULL,
	"featured_on_home" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(120) NOT NULL,
	"year" integer NOT NULL,
	"start_date" date,
	"end_date" date,
	"is_current" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(254) NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'editor' NOT NULL,
	"password_hash" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_images" ADD CONSTRAINT "event_images_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_team_member_id_team_members_id_fk" FOREIGN KEY ("team_member_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_submissions" ADD CONSTRAINT "project_submissions_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_submissions" ADD CONSTRAINT "project_submissions_accepted_project_id_projects_id_fk" FOREIGN KEY ("accepted_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_term_id_team_terms_id_fk" FOREIGN KEY ("team_term_id") REFERENCES "public"."team_terms"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_images_event_idx" ON "event_images" USING btree ("event_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "events_slug_unique" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "events_published_start_idx" ON "events" USING btree ("published","start_date");--> statement-breakpoint
CREATE INDEX "events_category_idx" ON "events" USING btree ("category");--> statement-breakpoint
CREATE INDEX "join_applications_status_idx" ON "join_applications" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "join_applications_email_idx" ON "join_applications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "project_images_project_idx" ON "project_images" USING btree ("project_id","display_order");--> statement-breakpoint
CREATE INDEX "project_members_project_idx" ON "project_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_submissions_status_idx" ON "project_submissions" USING btree ("status","submitted_at");--> statement-breakpoint
CREATE INDEX "project_submissions_email_idx" ON "project_submissions" USING btree ("submitter_email");--> statement-breakpoint
CREATE UNIQUE INDEX "project_tech_unique" ON "project_technologies" USING btree ("project_id","name");--> statement-breakpoint
CREATE INDEX "project_tech_name_idx" ON "project_technologies" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_slug_unique" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "projects_published_idx" ON "projects" USING btree ("published","featured","year");--> statement-breakpoint
CREATE INDEX "rate_limit_hits_key_idx" ON "rate_limit_hits" USING btree ("key","created_at");--> statement-breakpoint
CREATE INDEX "team_members_term_idx" ON "team_members" USING btree ("team_term_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "team_members_exec_unique" ON "team_members" USING btree ("team_term_id","position") WHERE "team_members"."position" <> 'committee_member';--> statement-breakpoint
CREATE UNIQUE INDEX "team_terms_year_unique" ON "team_terms" USING btree ("year");--> statement-breakpoint
CREATE UNIQUE INDEX "team_terms_single_current" ON "team_terms" USING btree ("is_current") WHERE "team_terms"."is_current" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree (lower("email"));