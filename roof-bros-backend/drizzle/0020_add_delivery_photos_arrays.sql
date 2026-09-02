ALTER TABLE "delivery" ADD COLUMN "drop_zone_photos" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "delivery" ADD COLUMN "proof_of_delivery_photos" jsonb DEFAULT '[]'::jsonb;