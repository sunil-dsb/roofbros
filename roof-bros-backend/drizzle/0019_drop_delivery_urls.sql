ALTER TABLE "tile_profile" ALTER COLUMN "profile_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tile_profile" ALTER COLUMN "profile_type" SET DEFAULT 'general'::text;--> statement-breakpoint
DROP TYPE "public"."profile_type_enum";--> statement-breakpoint
CREATE TYPE "public"."profile_type_enum" AS ENUM('general', 'restore');--> statement-breakpoint
ALTER TABLE "tile_profile" ALTER COLUMN "profile_type" SET DEFAULT 'general'::"public"."profile_type_enum";--> statement-breakpoint
ALTER TABLE "tile_profile" ALTER COLUMN "profile_type" SET DATA TYPE "public"."profile_type_enum" USING "profile_type"::"public"."profile_type_enum";--> statement-breakpoint
ALTER TABLE "delivery" DROP COLUMN "drop_zone_photo_url";--> statement-breakpoint
ALTER TABLE "delivery" DROP COLUMN "proof_of_delivery_photo_url";