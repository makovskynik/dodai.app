import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "pending_payment",
  "moderation",
  "active",
  "rejected",
  "suspended",
  "archived",
]);

export const productSourceEnum = pgEnum("product_source", [
  "owner",
  "editorial",
]);

export const linkTypeEnum = pgEnum("product_link_type", [
  "website",
  "app_store",
  "google_play",
  "telegram",
  "other",
]);

export const placementSurfaceEnum = pgEnum("placement_surface", [
  "catalog_home",
  "catalog_category",
  "map_highlight",
]);

export const placementStatusEnum = pgEnum("placement_status", [
  "reserved",
  "active",
  "expired",
  "cancelled",
]);

export const launchStatusEnum = pgEnum("launch_status", [
  "scheduled",
  "open",
  "closed",
]);

export const awardTypeEnum = pgEnum("award_type", ["product_of_the_day"]);

export const awardSourceEnum = pgEnum("award_source", ["editorial", "votes"]);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nameUk: varchar("name_uk", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 80 }).notNull(),
    parentId: uuid("parent_id"),
    introUk: text("intro_uk"),
    seoTitle: varchar("seo_title", { length: 160 }),
    seoDescription: varchar("seo_description", { length: 320 }),
    indexable: boolean("indexable").notNull().default(false),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("categories_slug_uidx").on(table.slug)],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    tagline: varchar("tagline", { length: 120 }).notNull(),
    description: text("description"),
    seoTitle: varchar("seo_title", { length: 160 }),
    seoDescription: varchar("seo_description", { length: 320 }),
    domain: varchar("domain", { length: 255 }),
    categoryId: uuid("category_id").references(() => categories.id),
    platforms: text("platforms").array().notNull().default([]),
    pricingModel: varchar("pricing_model", { length: 40 }),
    hasUkrainianUi: boolean("has_ukrainian_ui"),
    cityLabel: varchar("city_label", { length: 120 }),
    ukraineNote: text("ukraine_note"),
    sameAs: text("same_as").array().notNull().default([]),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    status: productStatusEnum("status").notNull().default("draft"),
    sourceType: productSourceEnum("source_type").notNull().default("owner"),
    claimable: boolean("claimable").notNull().default(false),
    surface: varchar("surface", { length: 20 }).notNull().default("surface"),
    listingTier: varchar("listing_tier", { length: 20 }).notNull().default("free"),
    extraLinks: text("extra_links"),
    creatorName: varchar("creator_name", { length: 120 }),
    creatorLinkedInUrl: text("creator_linkedin_url"),
    promoCode: varchar("promo_code", { length: 40 }),
    promoUrl: text("promo_url"),
    relatedSlugs: text("related_slugs").array().notNull().default([]),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("products_slug_uidx").on(table.slug),
    uniqueIndex("products_active_domain_uidx").on(table.domain),
    index("products_status_idx").on(table.status),
    index("products_category_idx").on(table.categoryId),
  ],
);

export const productLinks = pgTable(
  "product_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    type: linkTypeEnum("type").notNull().default("website"),
    url: text("url").notNull(),
    storeId: varchar("store_id", { length: 120 }),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("product_links_product_idx").on(table.productId)],
);

export const placements = pgTable(
  "placements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    surface: placementSurfaceEnum("surface").notNull(),
    slotKey: varchar("slot_key", { length: 40 }).notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: placementStatusEnum("status").notNull().default("reserved"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("placements_surface_status_idx").on(table.surface, table.status),
    index("placements_product_idx").on(table.productId),
    index("placements_ends_at_idx").on(table.endsAt),
  ],
);

export const launches = pgTable(
  "launches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: launchStatusEnum("status").notNull().default("scheduled"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("launches_product_idx").on(table.productId),
    index("launches_status_idx").on(table.status),
    index("launches_ends_at_idx").on(table.endsAt),
  ],
);

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    launchId: uuid("launch_id")
      .notNull()
      .references(() => launches.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    voterEmail: varchar("voter_email", { length: 320 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("votes_launch_voter_uidx").on(table.launchId, table.voterEmail),
    index("votes_product_idx").on(table.productId),
    index("votes_launch_idx").on(table.launchId),
  ],
);

export const awards = pgTable(
  "awards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    awardType: awardTypeEnum("award_type").notNull(),
    /** Calendar day in Europe/Kyiv as YYYY-MM-DD */
    awardDate: varchar("award_date", { length: 10 }).notNull(),
    source: awardSourceEnum("source").notNull().default("editorial"),
    launchId: uuid("launch_id").references(() => launches.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("awards_type_date_uidx").on(table.awardType, table.awardDate),
    index("awards_product_idx").on(table.productId),
  ],
);

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductLink = typeof productLinks.$inferSelect;
export type Placement = typeof placements.$inferSelect;
export type Launch = typeof launches.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type Award = typeof awards.$inferSelect;
