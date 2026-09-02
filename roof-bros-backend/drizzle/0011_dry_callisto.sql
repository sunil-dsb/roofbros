ALTER TABLE "job" ALTER COLUMN "job_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."job_type_enum";--> statement-breakpoint
CREATE TYPE "public"."job_type_enum" AS ENUM('Roof Replacement', 'New Roof Installation');--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "job_type" SET DATA TYPE "public"."job_type_enum" USING "job_type"::"public"."job_type_enum";