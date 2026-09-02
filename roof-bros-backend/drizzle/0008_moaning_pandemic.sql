CREATE TYPE "public"."job_status_enum" AS ENUM('Quoted', 'Requested', 'Delivered');--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "job_status" SET DEFAULT 'Requested'::"public"."job_status_enum";--> statement-breakpoint
ALTER TABLE "job" ALTER COLUMN "job_status" SET DATA TYPE "public"."job_status_enum" USING "job_status"::"public"."job_status_enum";