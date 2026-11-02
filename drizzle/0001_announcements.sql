CREATE TYPE "public"."announcement_kind" AS ENUM('news', 'advertisement');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(120) NOT NULL,
	"kind" "announcement_kind" DEFAULT 'news' NOT NULL,
	"message" text NOT NULL,
	"image" text,
	"image_alt" varchar(200),
	"link_label" varchar(40),
	"link_url" text,
	"published" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "announcements_published_order_idx" ON "announcements" USING btree ("published","display_order");
