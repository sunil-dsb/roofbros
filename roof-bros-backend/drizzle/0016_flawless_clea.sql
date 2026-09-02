ALTER TABLE IF EXISTS "drop_zone_photo" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE IF EXISTS "drop_zone_photo" CASCADE;--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "additional_notes" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "delivery" ADD COLUMN "quote_id" uuid;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "dropzone_photos" text[];--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "quote_number" text;--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "job_type" "job_type_enum";--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "tile_type_id" uuid;--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "tile_profile_id" uuid;--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "tile_color_id" uuid;--> statement-breakpoint
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_quote_id_quote_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_tile_type_id_tile_type_id_fk" FOREIGN KEY ("tile_type_id") REFERENCES "public"."tile_type"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_tile_profile_id_tile_profile_id_fk" FOREIGN KEY ("tile_profile_id") REFERENCES "public"."tile_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_tile_color_id_tile_color_id_fk" FOREIGN KEY ("tile_color_id") REFERENCES "public"."tile_color"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_quote_number_unique" UNIQUE("quote_number");