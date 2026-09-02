CREATE TABLE "tile_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"tile_type_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tile_profile" ADD CONSTRAINT "tile_profile_tile_type_id_tile_type_id_fk" FOREIGN KEY ("tile_type_id") REFERENCES "public"."tile_type"("id") ON DELETE cascade ON UPDATE no action;