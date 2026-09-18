import type { PlacementSurface } from "@/lib/placements/types";
import {
  PASSPORT_LISTING_PRICE_UAH,
  type ListingTier,
} from "@/lib/catalog/listing-tier";

/** Free catalog entry — short passport only. */
export const BASE_LISTING_PRICE_UAH = 0;

/** Sponsored placements are sold in 30-day windows only. */
export type PricingDurationDays = 30;

export type PlacementSku = {
  id: string;
  surface: PlacementSurface;
  nameUk: string;
  summaryUk: string;
  rankingRuleUk: string;
  inventoryNoteUk: string;
  /** How many different products can hold this surface at once. */
  maxConcurrent: number;
  pricesUah: Record<PricingDurationDays, number>;
};

export type BundleSku = {
  id: string;
  nameUk: string;
  summaryUk: string;
  includesUk: string[];
  priceUah: number;
};

export type ServiceSku = {
  id: string;
  nameUk: string;
  summaryUk: string;
  priceUah: number | null;
  priceLabelUk: string;
  status: "available" | "soon";
};

export const PRICING_VERSION = "2026-09-v3";
export const PRICING_STATUS: "proposed" = "proposed";

export const BASE_LISTING_SKU = {
  id: "base_listing",
  nameUk: "Безкоштовна картка",
  summaryUk:
    "Назва, лого, 1 лінк на сайт, платформи, опис до 120 символів. Внизу — схожі продукти. Модерація обов’язкова.",
  priceUah: BASE_LISTING_PRICE_UAH,
  billingUk: "безкоштовно · після модерації",
  includesUk: [
    "Назва та лого",
    "1 лінк на сайт",
    "Платформи (сайт / застосунки)",
    "Опис до 120 символів",
    "Автопідбір схожих проєктів внизу",
  ],
  rationaleUk:
    "Вхід без бар’єра — каталог росте. Гроші лише за глибшу картку, не за органічний рейтинг і не за dofollow.",
} as const;

export const PASSPORT_LISTING_SKU = {
  id: "passport_listing",
  nameUk: "Повна картка (Passport)",
  summaryUk:
    "Розширений паспорт продукту: довгий текст, до 5 лінків, хто створив, промо, власні пов’язані проєкти. Разова оплата.",
  priceUah: PASSPORT_LISTING_PRICE_UAH,
  billingUk: "разово · 300 грн",
  includesUk: [
    "Усе з безкоштовної картки",
    "Текст до 1000 символів",
    "До 5 додаткових лінків",
    "Хто створив + 1 лінк LinkedIn",
    "Промокод або акційний лінк",
    "Спочатку ваші пов’язані проєкти, нижче — схожі",
  ],
  noteUk:
    "Усі outbound-лінки лишаються sponsored/nofollow. Passport не купує місце в органіці й не дає dofollow.",
} as const;

/**
 * Founding-rate attention inventory (separate from passport).
 * Low traffic early — keep tryable UAH prices.
 */
export const PLACEMENT_SKUS: PlacementSku[] = [
  {
    id: "catalog_home",
    surface: "catalog_home",
    nameUk: "Спонсор на головній",
    summaryUk: "Блок «Спонсоровані» — рівні картки, без рангу якості.",
    rankingRuleUk: "До 3 рівних місць. Порядок — за стартом слота (FIFO).",
    inventoryNoteUk: "До 3 · рівні · founding",
    maxConcurrent: 3,
    pricesUah: { 30: 1990 },
  },
  {
    id: "catalog_category",
    surface: "catalog_category",
    nameUk: "Спонсор категорії (ексклюзив)",
    summaryUk: "Єдиний спонсор категорії на період.",
    rankingRuleUk: "Строго 1 місце на категорію.",
    inventoryNoteUk: "1 / категорія · founding",
    maxConcurrent: 1,
    pricesUah: { 30: 1290 },
  },
  {
    id: "map_highlight",
    surface: "map_highlight",
    nameUk: "Збільшений маркер на мапі",
    summaryUk:
      "Маркер продукту ×3 відносно звичайного. Усі спонсори однакові за розміром — без рівнів 1–2–3.",
    rankingRuleUk:
      "До 5 одночасних слотів. Ціна — за 1 продукт на 30 днів. Коли всі зайняті — купити не можна, доки не звільниться місце.",
    inventoryNoteUk: "×3 · до 5 одночасно · founding",
    maxConcurrent: 5,
    pricesUah: { 30: 690 },
  },
];

export const BUNDLE_SKUS: BundleSku[] = [
  {
    id: "bundle_free",
    nameUk: "Старт",
    summaryUk: "Безкоштовна картка після модерації.",
    includesUk: ["Безкоштовна картка"],
    priceUah: 0,
  },
  {
    id: "bundle_passport",
    nameUk: "Passport",
    summaryUk: "Повна картка разово.",
    includesUk: ["Повна картка Passport"],
    priceUah: PASSPORT_LISTING_PRICE_UAH,
  },
  {
    id: "bundle_niche",
    nameUk: "Ніша",
    summaryUk: "Passport + ексклюзив категорії на 30 днів.",
    includesUk: ["Passport · 300 грн", "Спонсор категорії · 30 днів"],
    priceUah: PASSPORT_LISTING_PRICE_UAH + 1290,
  },
];

export const SERVICE_SKUS: ServiceSku[] = [
  {
    id: "claim",
    nameUk: "Claim редакційної картки",
    summaryUk: "Запит на володіння карткою. Модерація обов’язкова.",
    priceUah: 0,
    priceLabelUk: "0 грн",
    status: "available",
  },
  {
    id: "verified",
    nameUk: "Verified-перевірка",
    summaryUk: "Окрема перевірка команди / зв’язку з Україною.",
    priceUah: 500,
    priceLabelUk: "500 грн",
    status: "soon",
  },
];

export const NOT_FOR_SALE = [
  {
    id: "organic",
    nameUk: "Органічне місце / сортування",
    reasonUk: "Оплата не змінює органічний порядок.",
  },
  {
    id: "votes",
    nameUk: "Голоси",
    reasonUk: "Не продаються.",
  },
  {
    id: "potw",
    nameUk: "Продукт тижня",
    reasonUk: "Лише редакція / голосування.",
  },
  {
    id: "dofollow",
    nameUk: "Dofollow-посилання",
    reasonUk: "Усі платні й безкоштовні outbound — sponsored/nofollow.",
  },
] as const;

export function formatUah(amount: number): string {
  if (amount === 0) return "0 грн";
  return new Intl.NumberFormat("uk-UA").format(amount) + " грн";
}

export function getPlacementSku(surface: PlacementSurface): PlacementSku | undefined {
  return PLACEMENT_SKUS.find((sku) => sku.surface === surface);
}

export function listingTierPriceUah(tier: ListingTier): number {
  return tier === "passport" ? PASSPORT_LISTING_PRICE_UAH : BASE_LISTING_PRICE_UAH;
}
