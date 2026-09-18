import type {
  CatalogCategory,
  CatalogProduct,
  ProductBadge,
  ProductSurface,
} from "@/lib/catalog/types";
import { logoUrlForSlug } from "@/lib/catalog/logos";
import { normalizePlatforms } from "@/lib/catalog/platforms";
import marketerSeed from "@/data/marketer-products-seed.json";

type MarketerSeedItem = {
  name: string;
  website: string;
  description: string | null;
  kind: string;
  short_uk?: string;
  claimable?: boolean;
  seed_for_dodai?: boolean;
};

const KIND_TO_CATEGORY: Record<
  string,
  { slug: string; nameUk: string; introUk: string }
> = {
  affiliate: {
    slug: "affiliate",
    nameUk: "Партнерські мережі",
    introUk: "Українські та локально доступні affiliate / CPA платформи.",
  },
  adtech: {
    slug: "adtech",
    nameUk: "Adtech",
    introUk: "Рекламні технології та programmatic від українських команд.",
  },
  education: {
    slug: "education",
    nameUk: "Освіта",
    introUk: "Освітні портали та школи для навчання в Україні.",
  },
  fintech: {
    slug: "fintech",
    nameUk: "Fintech",
    introUk: "Фінансовий облік і fintech-сервіси для бізнесу.",
  },
  sales_tools: {
    slug: "sales",
    nameUk: "Продажі",
    introUk: "Інструменти для продажів, outreach і lead generation.",
  },
  research: {
    slug: "research",
    nameUk: "Дослідження",
    introUk: "Дослідницькі платформи та панелі аудиторії.",
  },
  hrtech: {
    slug: "jobs",
    nameUk: "Робота",
    introUk: "Job-борди та HR-сервіси українського ринку.",
  },
  ai_assistant: {
    slug: "ai",
    nameUk: "AI",
    introUk: "AI-асистенти та продукти з штучним інтелектом.",
  },
  edtech: {
    slug: "edtech",
    nameUk: "EdTech",
    introUk: "Цифрові продукти для навчання та мікроосвіти.",
  },
  aso: {
    slug: "mobile",
    nameUk: "Mobile",
    introUk: "Мобільні продукти та інструменти для App Store / Google Play.",
  },
  product_studio: {
    slug: "studios",
    nameUk: "Студії",
    introUk: "Продуктові студії та платформи запуску digital-бізнесів.",
  },
  media_monitoring: {
    slug: "pr",
    nameUk: "PR і моніторинг",
    introUk: "Моніторинг ЗМІ, PR-дистрибуція та репутаційні інструменти.",
  },
  crm: {
    slug: "crm",
    nameUk: "CRM",
    introUk: "CRM-системи для українського бізнесу та команд продажів.",
  },
  software: {
    slug: "software",
    nameUk: "Software",
    introUk: "Десктопні та кросплатформені софт-продукти.",
  },
  localization: {
    slug: "localization",
    nameUk: "Локалізація",
    introUk: "Переклади та локалізація продуктів і контенту.",
  },
  pr_distribution: {
    slug: "pr",
    nameUk: "PR і моніторинг",
    introUk: "Моніторинг ЗМІ, PR-дистрибуція та репутаційні інструменти.",
  },
  telephony: {
    slug: "telephony",
    nameUk: "Телефонія",
    introUk: "Колтрекінг, телефонія та аналітика дзвінків.",
  },
  delivery: {
    slug: "delivery",
    nameUk: "Доставка",
    introUk: "Сервіси доставки та логістики для користувачів в Україні.",
  },
  seo: {
    slug: "seo",
    nameUk: "SEO",
    introUk: "SEO-платформи та інструменти пошукового маркетингу.",
  },
  giveaways: {
    slug: "som",
    nameUk: "СОМ",
    introUk: "Розіграші, giveaways і сервіси для соцмереж у категорії СОМ.",
  },
  influencer: {
    slug: "influencer",
    nameUk: "Influencer",
    introUk: "Аналітика блогерів і influencer-маркетинг.",
  },
  payments: {
    slug: "payments",
    nameUk: "Платежі",
    introUk: "Платіжні шлюзи та прийом оплат для українського бізнесу.",
  },
  business_software: {
    slug: "business",
    nameUk: "Бізнес-софт",
    introUk: "Автоматизація та бізнес-софт для компаній.",
  },
};

const SURFACES: ProductSurface[] = ["mint", "sky", "lilac", "peach", "surface"];

const PLATFORM_OVERRIDES: Record<string, string[]> = {
  macpaw: ["macos", "ios"],
  headway: ["ios", "android", "web"],
  happ: ["web"],
  keyapp: ["ios", "android", "web"],
  som: ["web"],
};

const TAGLINE_UK: Record<string, string> = {
  Admitad: "Партнерська мережа для зростання продажів.",
  ADMIXER: "Adtech-платформа для цифрової реклами.",
  "Education.ua": "Каталог освіти та навчальних програм в Україні.",
  finmap: "Облік грошей для сучасного бізнесу.",
  GetProspect: "Пошук B2B-контактів і email у LinkedIn.",
  "Gradus Research": "Швидкі дослідження аудиторії зі смартфона.",
  GRC: "Пошук роботи та вакансій в Україні.",
  HAPP: "AI voice assistant для бізнесу 24/7.",
  "Headway Inc": "EdTech-продукти для навчання щодня.",
  "I-PM.Education": "Онлайн-школа менеджменту й процесів.",
  keyapp: "ASO та просування застосунків у сторах.",
  "Kiss My Apps": "Продуктова платформа мобільних бізнесів.",
  "Linkos Group": "Рішення для автоматизації бізнесу.",
  LOOQME: "Моніторинг ЗМІ та соцмереж для PR.",
  "LP-CRM": "CRM для товарного бізнесу й маркетплейсів.",
  MacPaw: "Софт для macOS і iOS від української команди.",
  MGID: "Платформа нативної реклами.",
  "MK:translations": "Переклади та локалізація для бізнесу.",
  "NetHunt CRM": "CRM для команд у Gmail і пошті.",
  "On News": "Розміщення пресрелізів і новин у медіа.",
  "PRNEWS.IO": "Дистрибуція PR-контенту в онлайн-медіа.",
  Ringostat: "Колтрекінг, телефонія та аналітика дзвінків.",
  Rocket: "Сервіс доставки їжі та замовлень.",
  SalesDoubler: "CPA-платформа партнерського маркетингу.",
  "SE Ranking": "SEO-платформа для просування сайтів.",
  Serpstat: "SEO-інструменти для пошукового маркетингу.",
  "Snov.io": "Cold outreach і sales engagement.",
  SOM: "Розіграші та результати для соцмереж.",
  TrendHERO: "Пошук і перевірка блогерів в Instagram.",
  WayForPay: "Прийом платежів для українського бізнесу.",
  "Work.ua": "Сайт пошуку роботи №1 в Україні.",
};

const EDITORIAL_DAY = "serpstat";

/** Demo city rotation for map clusters (seed only; owners set city later). */
const SEED_CITIES = [
  "Київ",
  "Львів",
  "Харків",
  "Одеса",
  "Дніпро",
  "Вінниця",
  "Івано-Франківськ",
  null,
] as const;

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function domainFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function initialsFromName(name: string): string {
  const parts = name.replace(/[.:]/g, " ").split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.slice(0, 2);
}

function shortTagline(item: MarketerSeedItem): string {
  const mapped = TAGLINE_UK[item.name];
  if (mapped) return mapped.slice(0, 120);
  const fromShort = item.short_uk?.trim();
  if (fromShort) return fromShort.slice(0, 120);
  const fromDesc = (item.description ?? "").replace(/\s+/g, " ").trim();
  if (!fromDesc) return "Український цифровий продукт.";
  return fromDesc.length > 120 ? `${fromDesc.slice(0, 117)}…` : fromDesc;
}

function buildLocalCatalog(): CatalogProduct[] {
  const items = marketerSeed as MarketerSeedItem[];
  return items
    .filter((item) => item.seed_for_dodai !== false)
    .map((item, index) => {
      const slug = slugify(item.name);
      const category = KIND_TO_CATEGORY[item.kind] ?? {
        slug: "tools",
        nameUk: "Інструменти",
        introUk: "Українські цифрові інструменти та сервіси.",
      };
      const platforms = normalizePlatforms(PLATFORM_OVERRIDES[slug] ?? ["web"]);
      const badge: ProductBadge = null;
      const cityLabel = SEED_CITIES[index % SEED_CITIES.length] ?? null;

      return {
        id: slug,
        slug,
        name: item.name,
        tagline: shortTagline(item),
        description: item.description,
        seoTitle: `${item.name} — український цифровий продукт`,
        seoDescription: shortTagline(item),
        categorySlug: category.slug,
        categoryName: category.nameUk,
        platforms,
        website: item.website,
        domain: domainFromUrl(item.website),
        initials: initialsFromName(item.name),
        logoUrl: logoUrlForSlug(slug),
        surface: SURFACES[index % SURFACES.length],
        badge,
        sourceType: "editorial" as const,
        claimable: Boolean(item.claimable),
        pricingModel: null,
        hasUkrainianUi: null,
        cityLabel,
        ukraineNote:
          "Українські засновники або значуща українська команда (редакційний seed; claim відкритий).",
        sameAs: [item.website],
        lastVerifiedAt: new Date(Date.UTC(2026, 8, 18)).toISOString(),
        publishedAt: new Date(Date.UTC(2026, 8, 18 - (index % 10))).toISOString(),
        listingTier: "free" as const,
        extraLinks: [],
        creatorName: null,
        creatorLinkedInUrl: null,
        promoCode: null,
        promoUrl: null,
        relatedSlugs: [],
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "uk"));
}

export const localCatalogProducts: CatalogProduct[] = enhancePassportDemos(
  buildLocalCatalog(),
);

function enhancePassportDemos(products: CatalogProduct[]): CatalogProduct[] {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const serpstat = bySlug.get("serpstat");
  const seRanking = bySlug.get("se-ranking");
  if (serpstat) {
    bySlug.set("serpstat", {
      ...serpstat,
      listingTier: "passport",
      description:
        "Serpstat — SEO-платформа для пошукового маркетингу: дослідження ключових слів, аудит сайту, відстеження позицій і аналіз конкурентів. Команда з України розвиває продукт для маркетологів і агенцій.",
      extraLinks: [
        { label: "Блог", url: "https://serpstat.com/blog/" },
        { label: "Pricing", url: "https://serpstat.com/pricing/" },
      ],
      creatorName: "Команда Serpstat",
      creatorLinkedInUrl: "https://www.linkedin.com/company/serpstat/",
      promoCode: "DODAI",
      promoUrl: "https://serpstat.com/",
      relatedSlugs: seRanking ? ["se-ranking"] : [],
    });
  }
  return [...bySlug.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "uk"),
  );
}

export function listLocalCategories(
  products: CatalogProduct[] = localCatalogProducts,
): CatalogCategory[] {
  const introBySlug = new Map(
    Object.values(KIND_TO_CATEGORY).map((category) => [
      category.slug,
      category.introUk,
    ]),
  );
  const map = new Map<string, CatalogCategory>();
  for (const product of products) {
    const current = map.get(product.categorySlug);
    if (current) {
      current.count += 1;
    } else {
      map.set(product.categorySlug, {
        slug: product.categorySlug,
        nameUk: product.categoryName,
        count: 1,
        introUk: introBySlug.get(product.categorySlug) ?? null,
        seoTitle: `${product.categoryName} — українські продукти`,
        seoDescription:
          introBySlug.get(product.categorySlug) ??
          `Підбірка українських цифрових продуктів: ${product.categoryName}.`,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.nameUk.localeCompare(b.nameUk, "uk"));
}

export function listLocalPlatforms(
  products: CatalogProduct[] = localCatalogProducts,
): string[] {
  return [...new Set(products.flatMap((product) => product.platforms))].sort();
}

export { KIND_TO_CATEGORY, slugify, domainFromUrl, EDITORIAL_DAY };
