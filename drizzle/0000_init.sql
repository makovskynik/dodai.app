CREATE TYPE "public"."product_status" AS ENUM('draft', 'pending_payment', 'moderation', 'active', 'rejected', 'suspended', 'archived');--> statement-breakpoint
CREATE TYPE "public"."product_source" AS ENUM('owner', 'editorial');--> statement-breakpoint
CREATE TYPE "public"."product_link_type" AS ENUM('website', 'app_store', 'google_play', 'telegram', 'other');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_uk" varchar(80) NOT NULL,
	"slug" varchar(80) NOT NULL,
	"parent_id" uuid,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(120) NOT NULL,
	"tagline" varchar(120) NOT NULL,
	"description" text,
	"domain" varchar(255),
	"category_id" uuid,
	"platforms" text[] DEFAULT '{}' NOT NULL,
	"pricing_model" varchar(40),
	"has_ukrainian_ui" boolean,
	"city_label" varchar(120),
	"ukraine_note" text,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"source_type" "product_source" DEFAULT 'owner' NOT NULL,
	"claimable" boolean DEFAULT false NOT NULL,
	"surface" varchar(20) DEFAULT 'surface' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"type" "product_link_type" DEFAULT 'website' NOT NULL,
	"url" text NOT NULL,
	"store_id" varchar(120),
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_links" ADD CONSTRAINT "product_links_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_uidx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_uidx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "products_active_domain_uidx" ON "products" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "product_links_product_idx" ON "product_links" USING btree ("product_id");
