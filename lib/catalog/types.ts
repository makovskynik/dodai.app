export type ProductSurface = "peach" | "mint" | "lilac" | "sky" | "surface";

export type ProductBadge = "product-of-the-day" | "promoted" | null;

export type ListingTier = "free" | "passport";

export type ProductExtraLink = {
  label: string;
  url: string;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  categorySlug: string;
  categoryName: string;
  platforms: string[];
  website: string;
  domain: string | null;
  initials: string;
  surface: ProductSurface;
  badge: ProductBadge;
  sourceType: "owner" | "editorial";
  claimable: boolean;
  pricingModel: string | null;
  hasUkrainianUi: boolean | null;
  cityLabel: string | null;
  ukraineNote: string | null;
  sameAs: string[];
  lastVerifiedAt: string | null;
  publishedAt: string | null;
  /** Local or remote product mark; falls back to initials in UI. */
  logoUrl?: string | null;
  /** Present when product has an open launch. */
  activeLaunchId?: string | null;
  voteCount?: number;
  /** free = short card; passport = paid full passport. */
  listingTier: ListingTier;
  extraLinks: ProductExtraLink[];
  creatorName: string | null;
  creatorLinkedInUrl: string | null;
  promoCode: string | null;
  promoUrl: string | null;
  relatedSlugs: string[];
};

export type CatalogCategory = {
  slug: string;
  nameUk: string;
  count: number;
  introUk?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type CatalogQuery = {
  q?: string;
  category?: string;
  platform?: string;
  sort?: "new" | "name";
  page?: number;
};

export type CatalogResult = {
  organic: CatalogProduct[];
  promoted: CatalogProduct[];
  categories: CatalogCategory[];
  platforms: string[];
  total: number;
  query: CatalogQuery;
  zeroResult: boolean;
};
