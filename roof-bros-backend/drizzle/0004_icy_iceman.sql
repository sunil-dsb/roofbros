CREATE TABLE "tile_profile_color" (
	"profile_id" uuid NOT NULL,
	"color_id" uuid NOT NULL,
	CONSTRAINT "tile_profile_color_profile_id_color_id_pk" PRIMARY KEY("profile_id","color_id")
);
--> statement-breakpoint
ALTER TABLE "tile_profile_color" ADD CONSTRAINT "tile_profile_color_profile_id_tile_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."tile_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tile_profile_color" ADD CONSTRAINT "tile_profile_color_color_id_tile_color_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."tile_color"("id") ON DELETE cascade ON UPDATE no action;