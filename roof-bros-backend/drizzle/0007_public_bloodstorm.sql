CREATE TABLE "job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"job_type" text NOT NULL,
	"address" text NOT NULL,
	"area_sqmt" numeric(10, 2),
	"confidence" numeric(5, 2),
	"area_square" numeric(10, 2),
	"tile_type_id" uuid,
	"tile_profile_id" uuid,
	"tile_color_id" uuid,
	"top_coat_buckets" numeric(10, 2),
	"primer" numeric(10, 2),
	"job_status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_tile_type_id_tile_type_id_fk" FOREIGN KEY ("tile_type_id") REFERENCES "public"."tile_type"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_tile_profile_id_tile_profile_id_fk" FOREIGN KEY ("tile_profile_id") REFERENCES "public"."tile_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_tile_color_id_tile_color_id_fk" FOREIGN KEY ("tile_color_id") REFERENCES "public"."tile_color"("id") ON DELETE set null ON UPDATE no action;