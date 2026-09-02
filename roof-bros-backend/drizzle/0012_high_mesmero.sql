CREATE TYPE "public"."delivery_method_enum" AS ENUM('deliver to site', 'pickup at yard');--> statement-breakpoint
CREATE TYPE "public"."delivery_status_enum" AS ENUM('requested', 'scheduled', 'out for delivery', 'delivered');--> statement-breakpoint
CREATE TYPE "public"."time_window_enum" AS ENUM('morning', 'afternoon');--> statement-breakpoint
CREATE TABLE "delivery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"tracking_number" text NOT NULL,
	"method" "delivery_method_enum" NOT NULL,
	"delivery_address" text,
	"preferred_day" timestamp NOT NULL,
	"time_window" time_window_enum NOT NULL,
	"drop_zone_notes" text,
	"drop_zone_photo_url" text,
	"status" "delivery_status_enum" DEFAULT 'requested' NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"scheduled_at" timestamp,
	"out_for_delivery_at" timestamp,
	"delivered_at" timestamp,
	"proof_of_delivery_photo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "job_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "job_status" SET DEFAULT 'quoted'::text;--> statement-breakpoint
DROP TYPE "public"."job_status_enum";--> statement-breakpoint
CREATE TYPE "public"."job_status_enum" AS ENUM('quoted', 'requested', 'delivered');--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "job_status" SET DEFAULT 'quoted'::"public"."job_status_enum";--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "job_status" SET DATA TYPE "public"."job_status_enum" USING "job_status"::"public"."job_status_enum";--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "job_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."job_type_enum";--> statement-breakpoint
CREATE TYPE "public"."job_type_enum" AS ENUM('roof replacement', 'new roof installation');--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "job_type" SET DATA TYPE "public"."job_type_enum" USING "job_type"::"public"."job_type_enum";--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "pitch" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "tilesize" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "total_tiles" integer;--> statement-breakpoint
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;