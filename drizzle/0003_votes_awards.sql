CREATE TYPE "public"."launch_status" AS ENUM('scheduled', 'open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."award_type" AS ENUM('product_of_the_day');--> statement-breakpoint
CREATE TYPE "public"."award_source" AS ENUM('editorial', 'votes');--> statement-breakpoint
CREATE TABLE "launches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" "launch_status" DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"launch_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"voter_email" varchar(320) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "awards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"award_type" "award_type" NOT NULL,
	"award_date" varchar(10) NOT NULL,
	"source" "award_source" DEFAULT 'editorial' NOT NULL,
	"launch_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "launches" ADD CONSTRAINT "launches_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_launch_id_launches_id_fk" FOREIGN KEY ("launch_id") REFERENCES "public"."launches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "awards" ADD CONSTRAINT "awards_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "awards" ADD CONSTRAINT "awards_launch_id_launches_id_fk" FOREIGN KEY ("launch_id") REFERENCES "public"."launches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "launches_product_idx" ON "launches" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "launches_status_idx" ON "launches" USING btree ("status");--> statement-breakpoint
CREATE INDEX "launches_ends_at_idx" ON "launches" USING btree ("ends_at");--> statement-breakpoint
CREATE UNIQUE INDEX "votes_launch_voter_uidx" ON "votes" USING btree ("launch_id","voter_email");--> statement-breakpoint
CREATE INDEX "votes_product_idx" ON "votes" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "votes_launch_idx" ON "votes" USING btree ("launch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "awards_type_date_uidx" ON "awards" USING btree ("award_type","award_date");--> statement-breakpoint
CREATE INDEX "awards_product_idx" ON "awards" USING btree ("product_id");
