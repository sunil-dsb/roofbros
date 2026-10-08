ALTER TABLE "job" ADD COLUMN "tilesize" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "top_coat_buckets" integer;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "primer_type" text;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "primer" integer;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "total_tiles" integer;--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "top_coat_buckets" integer;--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "primer_type" text;--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "primer" integer;--> statement-breakpoint
ALTER TABLE "quote" ADD COLUMN "total_tiles" integer;