import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq } from "drizzle-orm";
import {
  KIND_TO_CATEGORY,
  localCatalogProducts,
  EDITORIAL_DAY,
} from "../lib/catalog/local-seed";
import { LOCAL_DEMO_PLACEMENTS } from "../lib/placements/local-inventory";
import { awardDateKyiv } from "../lib/votes/rules";
import {
  awards,
  categories,
  launches,
  placements,
  productLinks,
  products,
} from "../server/db/schema";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required. Copy .env.example to .env.local and set your Neon connection string.",
    );
  }

  const db = drizzle(neon(databaseUrl), {
    schema: { categories, products, productLinks, placements, launches, awards },
  });

  const categoryRows = Object.values(
    Object.fromEntries(
      Object.values(KIND_TO_CATEGORY).map((category) => [
        category.slug,
        category,
      ]),
    ),
  );

  const categoryIds = new Map<string, string>();

  for (const category of categoryRows) {
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, category.slug))
      .limit(1);

    if (existing[0]) {
      categoryIds.set(category.slug, existing[0].id);
      await db
        .update(categories)
        .set({
          nameUk: category.nameUk,
          introUk: category.introUk,
          seoTitle: `${category.nameUk} — українські продукти`,
          seoDescription: category.introUk,
          indexable: true,
        })
        .where(eq(categories.id, existing[0].id));
      continue;
    }

    const inserted = await db
      .insert(categories)
      .values({
        nameUk: category.nameUk,
        slug: category.slug,
        introUk: category.introUk,
        seoTitle: `${category.nameUk} — українські продукти`,
        seoDescription: category.introUk,
        indexable: true,
        status: "active",
      })
      .returning({ id: categories.id });

    categoryIds.set(category.slug, inserted[0].id);
  }

  let upserted = 0;
  const productIdsBySlug = new Map<string, string>();

  for (const product of localCatalogProducts) {
    const categoryId = categoryIds.get(product.categorySlug);
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.slug, product.slug))
      .limit(1);

    let productId = existing[0]?.id;

    if (existing[0]) {
      await db
        .update(products)
        .set({
          name: product.name,
          tagline: product.tagline,
          description: product.description,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          domain: product.domain,
          categoryId,
          platforms: product.platforms,
          cityLabel: product.cityLabel,
          ukraineNote: product.ukraineNote,
          sameAs: product.sameAs,
          lastVerifiedAt: product.lastVerifiedAt
            ? new Date(product.lastVerifiedAt)
            : new Date(),
          status: "active",
          sourceType: "editorial",
          claimable: product.claimable,
          surface: product.surface,
          publishedAt: product.publishedAt
            ? new Date(product.publishedAt)
            : new Date(),
          updatedAt: new Date(),
        })
        .where(eq(products.id, existing[0].id));
    } else {
      const inserted = await db
        .insert(products)
        .values({
          slug: product.slug,
          name: product.name,
          tagline: product.tagline,
          description: product.description,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          domain: product.domain,
          categoryId,
          platforms: product.platforms,
          cityLabel: product.cityLabel,
          ukraineNote: product.ukraineNote,
          sameAs: product.sameAs,
          lastVerifiedAt: product.lastVerifiedAt
            ? new Date(product.lastVerifiedAt)
            : new Date(),
          status: "active",
          sourceType: "editorial",
          claimable: product.claimable,
          surface: product.surface,
          publishedAt: product.publishedAt
            ? new Date(product.publishedAt)
            : new Date(),
        })
        .returning({ id: products.id });
      productId = inserted[0].id;
    }

    if (!productId) continue;
    productIdsBySlug.set(product.slug, productId);

    const links = await db
      .select()
      .from(productLinks)
      .where(eq(productLinks.productId, productId));

    const primary = links.find((link) => link.isPrimary);

    if (primary) {
      await db
        .update(productLinks)
        .set({ url: product.website, type: "website" })
        .where(eq(productLinks.id, primary.id));
    } else {
      await db.insert(productLinks).values({
        productId,
        type: "website",
        url: product.website,
        isPrimary: true,
      });
    }

    upserted += 1;
  }

  let placementCount = 0;
  for (const demo of LOCAL_DEMO_PLACEMENTS) {
    const productId = productIdsBySlug.get(demo.productSlug);
    if (!productId) continue;

    const existing = await db
      .select()
      .from(placements)
      .where(
        and(
          eq(placements.productId, productId),
          eq(placements.surface, demo.surface),
          eq(placements.slotKey, demo.slotKey),
        ),
      )
      .limit(1);

    if (existing[0]) {
      await db
        .update(placements)
        .set({
          startsAt: new Date(demo.startsAt),
          endsAt: new Date(demo.endsAt),
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(placements.id, existing[0].id));
    } else {
      await db.insert(placements).values({
        productId,
        surface: demo.surface,
        slotKey: demo.slotKey,
        startsAt: new Date(demo.startsAt),
        endsAt: new Date(demo.endsAt),
        status: "active",
      });
    }
    placementCount += 1;
  }

  const launchSlugs = [EDITORIAL_DAY, "macpaw"];
  let launchCount = 0;
  const startsAt = new Date(Date.UTC(2026, 8, 1));
  const endsAt = new Date(Date.UTC(2027, 8, 1));

  for (const slug of launchSlugs) {
    const productId = productIdsBySlug.get(slug);
    if (!productId) continue;

    const existing = await db
      .select()
      .from(launches)
      .where(and(eq(launches.productId, productId), eq(launches.status, "open")))
      .limit(1);

    if (existing[0]) {
      await db
        .update(launches)
        .set({ startsAt, endsAt, updatedAt: new Date() })
        .where(eq(launches.id, existing[0].id));
    } else {
      await db.insert(launches).values({
        productId,
        startsAt,
        endsAt,
        status: "open",
      });
    }
    launchCount += 1;
  }

  let awardCount = 0;
  const potdProductId = productIdsBySlug.get(EDITORIAL_DAY);
  if (potdProductId) {
    const awardDate = awardDateKyiv();
    const existingAward = await db
      .select()
      .from(awards)
      .where(
        and(
          eq(awards.awardType, "product_of_the_day"),
          eq(awards.awardDate, awardDate),
        ),
      )
      .limit(1);

    if (!existingAward[0]) {
      await db.insert(awards).values({
        productId: potdProductId,
        awardType: "product_of_the_day",
        awardDate,
        source: "editorial",
      });
      awardCount = 1;
    } else {
      awardCount = 1;
    }
  }

  console.log(
    `Seed complete: ${upserted} products, ${categoryRows.length} categories, ${placementCount} placements, ${launchCount} launches, ${awardCount} awards`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
