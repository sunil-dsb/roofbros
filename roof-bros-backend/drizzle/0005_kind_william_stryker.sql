ALTER TABLE "user" ADD COLUMN "is_business" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "abn" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "business_name" text;