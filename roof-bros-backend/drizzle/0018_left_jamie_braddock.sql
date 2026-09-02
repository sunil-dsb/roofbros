CREATE SEQUENCE IF NOT EXISTS "public"."quote_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1000 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS "public"."delivery_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1000 CACHE 1;--> statement-breakpoint
ALTER TABLE "job" DROP CONSTRAINT "job_tile_type_id_tile_type_id_fk";
--> statement-breakpoint
ALTER TABLE "job" DROP CONSTRAINT "job_tile_profile_id_tile_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "job" DROP CONSTRAINT "job_tile_color_id_tile_color_id_fk";
--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "additional_notes" SET DATA TYPE jsonb USING to_jsonb("additional_notes");--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "additional_notes" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "dropzone_photos" SET DATA TYPE jsonb USING to_jsonb("dropzone_photos");--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "dropzone_photos" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "delivery" ADD COLUMN "urgent" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "active_quote_id" uuid;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "quote_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "area_sqmt" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_active_quote_id_quote_id_fk" FOREIGN KEY ("active_quote_id") REFERENCES "public"."quote"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job" DROP COLUMN "job_type";--> statement-breakpoint
ALTER TABLE "job" DROP COLUMN "area_square";--> statement-breakpoint
ALTER TABLE "job" DROP COLUMN "urgent";--> statement-breakpoint
ALTER TABLE "job" DROP COLUMN "total_tiles";--> statement-breakpoint
ALTER TABLE "job" DROP COLUMN "tile_type_id";--> statement-breakpoint
ALTER TABLE "job" DROP COLUMN "tile_profile_id";--> statement-breakpoint
ALTER TABLE "job" DROP COLUMN "tile_color_id";--> statement-breakpoint
ALTER TABLE "job" DROP COLUMN "top_coat_buckets";--> statement-breakpoint
ALTER TABLE "job" DROP COLUMN "primer";--> statement-breakpoint
ALTER TABLE "quote" DROP COLUMN "area_sq_mt";--> statement-breakpoint
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_tracking_number_unique" UNIQUE("tracking_number");