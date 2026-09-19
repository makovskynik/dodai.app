import { z } from "zod";
import {
  FREE_TAGLINE_MAX,
  FREE_TAGLINE_MIN,
  PASSPORT_BODY_MAX,
  PASSPORT_EXTRA_LINKS_MAX,
  PASSPORT_RELATED_MAX,
} from "@/lib/catalog/listing-tier";

const httpUrl = z
  .string()
  .trim()
  .url("Вкажіть коректний URL")
  .refine((value) => /^https?:\/\//i.test(value), {
    message: "Дозволені лише http та https",
  });

const optionalHttpUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || /^https?:\/\//i.test(value), {
    message: "Дозволені лише http та https",
  });

export const metadataRequestSchema = z.object({
  url: httpUrl,
});

export const platformSchema = z.enum([
  "web",
  "ios",
  "android",
  "macos",
  "desktop",
  "telegram",
  "extension",
]);

export const pricingModelSchema = z.enum([
  "free",
  "freemium",
  "paid",
  "subscription",
  "unknown",
]);

export const listingTierSchema = z.enum(["free", "passport"]);

export const extraLinkSchema = z.object({
  label: z.string().trim().max(40),
  url: httpUrl,
});

export const submissionSchema = z
  .object({
    url: httpUrl,
    name: z.string().trim().min(2).max(80),
    tagline: z
      .string()
      .trim()
      .min(FREE_TAGLINE_MIN, "Опис має пояснювати продукт")
      .max(FREE_TAGLINE_MAX, `До ${FREE_TAGLINE_MAX} символів`),
    description: z.string().trim().max(PASSPORT_BODY_MAX).optional().or(z.literal("")),
    categorySlug: z.string().trim().min(2).max(80),
    platforms: z.array(platformSchema).min(1, "Оберіть хоча б одну платформу"),
    pricingModel: pricingModelSchema,
    hasUkrainianUi: z.enum(["yes", "no", "unknown"]),
    cityLabel: z.string().trim().max(120).optional().or(z.literal("")),
    ukraineNote: z
      .string()
      .trim()
      .min(20, "Поясніть звʼязок з Україною")
      .max(500),
    ownerEmail: z.string().trim().email("Вкажіть робочий email"),
    ownerName: z.string().trim().max(120).optional().or(z.literal("")),
    seoTitle: z.string().trim().max(160).optional().or(z.literal("")),
    seoDescription: z.string().trim().max(320).optional().or(z.literal("")),
    faviconUrl: z.string().url().optional().or(z.literal("")).optional(),
    ogImageUrl: z.string().url().optional().or(z.literal("")).optional(),
    domain: z.string().trim().min(3).max(255),
    listingTier: listingTierSchema.default("free"),
    extraLinks: z.array(extraLinkSchema).max(PASSPORT_EXTRA_LINKS_MAX).default([]),
    creatorName: z.string().trim().max(120).optional().or(z.literal("")),
    creatorLinkedInUrl: optionalHttpUrl,
    promoCode: z.string().trim().max(40).optional().or(z.literal("")),
    promoUrl: optionalHttpUrl,
    relatedSlugs: z
      .array(z.string().trim().min(1).max(120))
      .max(PASSPORT_RELATED_MAX)
      .default([]),
  })
  .superRefine((value, ctx) => {
    if (value.listingTier === "passport") {
      const body = (value.description ?? "").trim();
      if (body.length < 40) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Для повної картки потрібен текст від 40 символів (до 1000)",
          path: ["description"],
        });
      }
      if (body.length > PASSPORT_BODY_MAX) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Текст повної картки — до ${PASSPORT_BODY_MAX} символів`,
          path: ["description"],
        });
      }
    } else if ((value.description ?? "").trim().length > 0) {
      // Free tier: ignore long body; keep tagline only.
    }
  });

export type SubmissionInput = z.infer<typeof submissionSchema>;
export type Platform = z.infer<typeof platformSchema>;
export type PricingModel = z.infer<typeof pricingModelSchema>;
export type ListingTierInput = z.infer<typeof listingTierSchema>;

export type FetchedMetadata = {
  url: string;
  finalUrl: string;
  domain: string;
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
  faviconUrl: string | null;
};

export const CATEGORY_OPTIONS = [
  { slug: "crm", nameUk: "CRM" },
  { slug: "seo", nameUk: "SEO" },
  { slug: "fintech", nameUk: "Fintech" },
  { slug: "payments", nameUk: "Платежі" },
  { slug: "sales", nameUk: "Продажі" },
  { slug: "ai", nameUk: "AI" },
  { slug: "edtech", nameUk: "EdTech" },
  { slug: "education", nameUk: "Освіта" },
  { slug: "jobs", nameUk: "Робота" },
  { slug: "mobile", nameUk: "Mobile" },
  { slug: "software", nameUk: "Software" },
  { slug: "social", nameUk: "Соцмережі" },
  { slug: "som", nameUk: "СОМ" },
  { slug: "pr", nameUk: "PR і моніторинг" },
  { slug: "adtech", nameUk: "Adtech" },
  { slug: "telephony", nameUk: "Телефонія" },
  { slug: "delivery", nameUk: "Доставка" },
  { slug: "business", nameUk: "Бізнес-софт" },
  { slug: "health", nameUk: "Здоров’я" },
  { slug: "games", nameUk: "Ігри" },
  { slug: "design", nameUk: "Дизайн" },
  { slug: "security", nameUk: "Безпека" },
  { slug: "food", nameUk: "Їжа" },
  { slug: "travel", nameUk: "Подорожі" },
  { slug: "tools", nameUk: "Інструменти" },
] as const;

export const PLATFORM_OPTIONS: Array<{ value: Platform; label: string }> = [
  { value: "web", label: "Web / сайт" },
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
  { value: "macos", label: "macOS" },
  { value: "desktop", label: "Desktop" },
  { value: "telegram", label: "Telegram" },
  { value: "extension", label: "Extension" },
];

export const PRICING_OPTIONS: Array<{ value: PricingModel; label: string }> = [
  { value: "free", label: "Безкоштовно" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "Платно" },
  { value: "subscription", label: "Підписка" },
  { value: "unknown", label: "Поки невідомо" },
];
