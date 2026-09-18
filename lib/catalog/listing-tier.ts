/** Freemium listing tiers for product passports. */

export const LISTING_TIERS = ["free", "passport"] as const;
export type ListingTier = (typeof LISTING_TIERS)[number];

/** Free card: short one-liner. */
export const FREE_TAGLINE_MAX = 120;
export const FREE_TAGLINE_MIN = 12;

/** Passport: long body text. */
export const PASSPORT_BODY_MAX = 1000;
export const PASSPORT_EXTRA_LINKS_MAX = 5;
export const PASSPORT_RELATED_MAX = 6;

/** One-time unlock for passport fields (not organic rank, not dofollow). */
export const PASSPORT_LISTING_PRICE_UAH = 300;

export type ProductExtraLink = {
  label: string;
  url: string;
};

export type PassportFields = {
  /** Long description (passport only), ≤ 1000 chars. */
  body: string;
  extraLinks: ProductExtraLink[];
  creatorName: string;
  creatorLinkedInUrl: string;
  promoCode: string;
  promoUrl: string;
  /** Owner-picked related product slugs (shown before auto-similar). */
  relatedSlugs: string[];
};

export function emptyPassportFields(): PassportFields {
  return {
    body: "",
    extraLinks: [],
    creatorName: "",
    creatorLinkedInUrl: "",
    promoCode: "",
    promoUrl: "",
    relatedSlugs: [],
  };
}

export function isPassportTier(tier: ListingTier | null | undefined): boolean {
  return tier === "passport";
}
