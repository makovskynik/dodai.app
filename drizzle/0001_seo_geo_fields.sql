-- SEO/GEO fields (ADR 003). Apply after 0000_init.
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "intro_uk" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "seo_title" varchar(160);--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "seo_description" varchar(320);--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "indexable" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "seo_title" varchar(160);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "seo_description" varchar(320);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "same_as" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "last_verified_at" timestamp with time zone;
