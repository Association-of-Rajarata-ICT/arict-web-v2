ALTER TYPE "public"."team_position" ADD VALUE 'other';--> statement-breakpoint
DROP INDEX "team_members_exec_unique";--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "custom_position" varchar(60);--> statement-breakpoint
CREATE UNIQUE INDEX "team_members_exec_unique" ON "team_members" USING btree ("team_term_id","position") WHERE "team_members"."position" in ('president', 'vice_president', 'secretary', 'vice_secretary', 'senior_treasurer', 'junior_treasurer', 'editor', 'junior_editor');