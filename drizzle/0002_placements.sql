CREATE TYPE "public"."placement_surface" AS ENUM('catalog_home', 'catalog_category', 'map_highlight');--> statement-breakpoint
CREATE TYPE "public"."placement_status" AS ENUM('reserved', 'active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TABLE "placements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"surface" "placement_surface" NOT NULL,
	"slot_key" varchar(40) NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" "placement_status" DEFAULT 'reserved' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "placements" ADD CONSTRAINT "placements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "placements_surface_status_idx" ON "placements" USING btree ("surface","status");--> statement-breakpoint
CREATE INDEX "placements_product_idx" ON "placements" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "placements_ends_at_idx" ON "placements" USING btree ("ends_at");
