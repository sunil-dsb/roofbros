CREATE TYPE "public"."profile_type_enum" AS ENUM('general', 'brand', 'restore');--> statement-breakpoint
CREATE TABLE "drop_zone_photo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"delivery_id" uuid NOT NULL,
	"url" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"area_sq_mt" numeric(10, 2),
	"top_coat_buckets" integer,
	"primer_type" text,
	"primer" integer,
	"total_tiles" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "job_type" SET DATA TYPE text;--> statement-breakpoint
UPDATE "job" SET "job_type" = 'roof restoration' WHERE "job_type" = 'roof replacement';--> statement-breakpoint
DROP TYPE "public"."job_type_enum";--> statement-breakpoint
CREATE TYPE "public"."job_type_enum" AS ENUM('new roof installation', 'roof restoration');--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "job_type" SET DATA TYPE "public"."job_type_enum" USING "job_type"::"public"."job_type_enum";--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "top_coat_buckets" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "primer" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "tile_color" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "tile_profile" ADD COLUMN "profile_type" "profile_type_enum" DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE "tile_profile_color" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "roof_image" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "additional_notes" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "urgent" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "ridges" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "roof_faces" integer;--> statement-breakpoint
ALTER TABLE "drop_zone_photo" ADD CONSTRAINT "drop_zone_photo_delivery_id_delivery_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."delivery"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;