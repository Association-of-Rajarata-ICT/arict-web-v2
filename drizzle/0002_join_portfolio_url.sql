ALTER TABLE "join_applications" ADD COLUMN "portfolio_url" text;--> statement-breakpoint
UPDATE "join_applications" SET "portfolio_url" = "github_url" WHERE "portfolio_url" IS NULL AND "github_url" IS NOT NULL;
