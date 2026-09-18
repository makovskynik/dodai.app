import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CatalogProduct } from "@/lib/catalog/types";
import { slugify } from "@/lib/catalog/local-seed";
import type { StoredSubmission } from "@/server/submissions/store";

const DATA_DIR = path.join(process.cwd(), ".data");
const PUBLISHED_FILE = path.join(DATA_DIR, "published.json");

async function readPublished(): Promise<CatalogProduct[]> {
  try {
    return JSON.parse(await readFile(PUBLISHED_FILE, "utf8")) as CatalogProduct[];
  } catch {
    return [];
  }
}

async function writePublished(products: CatalogProduct[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(PUBLISHED_FILE, JSON.stringify(products, null, 2), "utf8");
}

export async function listPublishedProducts(): Promise<CatalogProduct[]> {
  return readPublished();
}

export async function publishSubmissionToCatalog(
  submission: StoredSubmission,
): Promise<CatalogProduct> {
  const products = await readPublished();
  const slugBase = slugify(submission.name);
  let slug = slugBase;
  let suffix = 2;
  while (
    products.some((product) => product.slug === slug) ||
    submission.domain === products.find((p) => p.slug === slug)?.domain
  ) {
    // Avoid collisions with existing published overlay slugs.
    if (!products.some((product) => product.slug === slug)) break;
    slug = `${slugBase}-${suffix}`;
    suffix += 1;
  }

  const now = new Date().toISOString();
  const product: CatalogProduct = {
    id: submission.id,
    slug,
    name: submission.name,
    tagline: submission.tagline,
    description:
      submission.listingTier === "passport"
        ? submission.description || null
        : null,
    seoTitle: submission.seoTitle || `${submission.name} — український цифровий продукт`,
    seoDescription: submission.seoDescription || submission.tagline,
    categorySlug: submission.categorySlug,
    categoryName: submission.categorySlug,
    platforms: submission.platforms,
    website: submission.url,
    domain: submission.domain,
    initials: submission.name.slice(0, 2),
    surface: "mint",
    badge: null,
    sourceType: "owner",
    claimable: false,
    pricingModel: submission.pricingModel,
    hasUkrainianUi:
      submission.hasUkrainianUi === "yes"
        ? true
        : submission.hasUkrainianUi === "no"
          ? false
          : null,
    cityLabel: submission.cityLabel || null,
    ukraineNote: submission.ukraineNote,
    sameAs: [submission.url],
    lastVerifiedAt: now,
    publishedAt: now,
    listingTier: submission.listingTier ?? "free",
    extraLinks:
      submission.listingTier === "passport" ? submission.extraLinks ?? [] : [],
    creatorName:
      submission.listingTier === "passport"
        ? submission.creatorName || null
        : null,
    creatorLinkedInUrl:
      submission.listingTier === "passport"
        ? submission.creatorLinkedInUrl || null
        : null,
    promoCode:
      submission.listingTier === "passport"
        ? submission.promoCode || null
        : null,
    promoUrl:
      submission.listingTier === "passport" ? submission.promoUrl || null : null,
    relatedSlugs:
      submission.listingTier === "passport" ? submission.relatedSlugs ?? [] : [],
  };

  const withoutSameDomain = products.filter(
    (item) => item.domain !== product.domain && item.slug !== product.slug,
  );
  withoutSameDomain.unshift(product);
  await writePublished(withoutSameDomain);
  return product;
}
