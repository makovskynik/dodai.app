import type {
  CatalogCategory,
  CatalogProduct,
  ProductBadge,
  ProductSurface,
} from "@/lib/catalog/types";
import { logoUrlForSlug } from "@/lib/catalog/logos";
import { normalizePlatforms } from "@/lib/catalog/platforms";
import marketerSeed from "@/data/marketer-products-seed.json";
import osyoSeed from "@/data/osyo-products-seed.json";

type MarketerSeedItem = {
  name: string;
  website: string;
  description: string | null;
  kind: string;
  short_uk?: string;
  claimable?: boolean;
  seed_for_dodai?: boolean;
};

type OsyoSeedItem = {
  name: string;
  slug: string;
  website: string;
  domain: string | null;
  tagline: string;
  description: string | null;
  categorySlug: string;
  categoryName: string;
  platforms: string[];
  logoUrl?: string | null;
  claimable?: boolean;
  seed_for_dodai?: boolean;
  missingWebsite?: boolean;
  sourceUrl?: string;
  authorName?: string | null;
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
  health: {
    slug: "health",
    nameUk: "Здоров’я",
    introUk: "Здоров’я, фітнес і wellbeing-продукти українських команд.",
  },
  games: {
    slug: "games",
    nameUk: "Ігри",
    introUk: "Ігри та розважальні застосунки від українських розробників.",
  },
  design: {
    slug: "design",
    nameUk: "Дизайн",
    introUk: "Дизайн, креатив і візуальні інструменти.",
  },
  security: {
    slug: "security",
    nameUk: "Безпека",
    introUk: "Безпека, батьківський контроль і захист пристроїв.",
  },
  food: {
    slug: "food",
    nameUk: "Їжа",
    introUk: "Рецепти, meal-planning і foodtech-продукти.",
  },
  travel: {
    slug: "travel",
    nameUk: "Подорожі",
    introUk: "Подорожі, туризм і локальні travel-сервіси.",
  },
};

const SURFACES: ProductSurface[] = ["mint", "sky", "lilac", "peach", "surface"];

const PLATFORM_OVERRIDES: Record<string, string[]> = {
  macpaw: ["macos", "ios"],
  headway: ["ios", "android", "web"],
  happ: ["web"],
  keyapp: ["ios", "android", "web"],
  som: ["web", "ios", "android"],
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
  SOM: "Рандомайзер для розіграшів у Instagram, TikTok, Facebook, YouTube та Threads.",
  TrendHERO: "Пошук і перевірка блогерів в Instagram.",
  WayForPay: "Прийом платежів для українського бізнесу.",
  "Work.ua": "Сайт пошуку роботи №1 в Україні.",
};

const EDITORIAL_DAY = "serpstat";

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

function scrubImportedCopy(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let text = raw
    .replace(/\s*Explore\b[\s\S]*?\bon Osyo!\s*/gi, " ")
    .replace(/\s*Explore\b[\s\S]*$/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return null;
  if (/osyo\.app|імпортовано з каталогу|claim відкритий/i.test(text)) {
    return null;
  }

  if (text.endsWith("…") || text.endsWith("...")) {
    const withoutEllipsis = text.replace(/(\.\.\.|…)+$/u, "").trim();
    // Truncated marketing copy — leave blank for the owner to fill.
    if (!/[.!?)»”"]$/u.test(withoutEllipsis)) {
      return null;
    }
    text = withoutEllipsis;
  }

  if (text.length < 24) return null;
  return text;
}

function minimalTagline(
  cleanedTagline: string | null,
  cleanedDescription: string | null,
  categoryName: string,
  name: string,
): string {
  const source = cleanedTagline ?? cleanedDescription;
  if (source) {
    const firstSentence = source.split(/(?<=[.!?])\s+/u)[0] ?? source;
    return firstSentence.slice(0, 120);
  }
  return (categoryName || name).slice(0, 120);
}

function sameAsForWebsite(website: string | null | undefined): string[] {
  if (!website) return [];
  try {
    const host = new URL(website).hostname.replace(/^www\./, "").toLowerCase();
    if (host === "osyo.app" || host.endsWith(".osyo.app")) return [];
    return [website];
  } catch {
    return [];
  }
}

function shortTagline(item: MarketerSeedItem): string {
  const mapped = TAGLINE_UK[item.name];
  if (mapped) return mapped.slice(0, 120);
  const fromShort = scrubImportedCopy(item.short_uk);
  if (fromShort) return fromShort.slice(0, 120);
  const fromDesc = scrubImportedCopy(item.description);
  if (fromDesc) return fromDesc.slice(0, 120);
  return "Український цифровий продукт";
}

function buildMarketerProducts(): CatalogProduct[] {
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
      const description = scrubImportedCopy(item.description);
      const tagline = shortTagline(item);

      return {
        id: slug,
        slug,
        name: item.name,
        tagline,
        description,
        seoTitle: `${item.name} — український цифровий продукт`,
        seoDescription: tagline,
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
        cityLabel: null,
        ukraineNote: null,
        sameAs: sameAsForWebsite(item.website),
        lastVerifiedAt: null,
        publishedAt: new Date(Date.UTC(2026, 8, 18 - (index % 10))).toISOString(),
        listingTier: "free" as const,
        extraLinks: [],
        creatorName: null,
        creatorLinkedInUrl: null,
        promoCode: null,
        promoUrl: null,
        relatedSlugs: [],
      };
    });
}

function buildOsyoProducts(): CatalogProduct[] {
  const items = osyoSeed as OsyoSeedItem[];
  return items
    .filter((item) => item.seed_for_dodai !== false && !item.missingWebsite)
    .map((item, index) => {
      const slug = item.slug || slugify(item.name);
      const description = scrubImportedCopy(item.description);
      const cleanedTagline = scrubImportedCopy(item.tagline);
      const tagline = minimalTagline(
        cleanedTagline,
        description,
        item.categoryName || "Інструменти",
        item.name,
      );
      const website = item.website;

      return {
        id: slug,
        slug,
        name: item.name,
        tagline,
        description,
        seoTitle: `${item.name} — український цифровий продукт`,
        seoDescription: tagline.slice(0, 160),
        categorySlug: item.categorySlug || "tools",
        categoryName: item.categoryName || "Інструменти",
        platforms: normalizePlatforms(item.platforms ?? ["web"]),
        website,
        domain: item.domain ?? domainFromUrl(website),
        initials: initialsFromName(item.name),
        logoUrl: item.logoUrl ?? logoUrlForSlug(slug),
        surface: SURFACES[index % SURFACES.length],
        badge: null as ProductBadge,
        sourceType: "editorial" as const,
        claimable: item.claimable !== false,
        pricingModel: null,
        hasUkrainianUi: null,
        cityLabel: null,
        ukraineNote: null,
        sameAs: sameAsForWebsite(website),
        lastVerifiedAt: null,
        publishedAt: new Date(
          Date.UTC(2026, 8, 19 - (index % 14)),
        ).toISOString(),
        listingTier: "free" as const,
        extraLinks: [],
        creatorName: item.authorName ?? null,
        creatorLinkedInUrl: null,
        promoCode: null,
        promoUrl: null,
        relatedSlugs: [],
      };
    });
}

function mergeCatalogProducts(
  primary: CatalogProduct[],
  secondary: CatalogProduct[],
): CatalogProduct[] {
  const bySlug = new Map<string, CatalogProduct>();
  const byDomain = new Map<string, string>();

  for (const product of primary) {
    bySlug.set(product.slug, product);
    if (product.domain) byDomain.set(product.domain.toLowerCase(), product.slug);
  }

  for (const product of secondary) {
    if (bySlug.has(product.slug)) continue;
    if (product.domain && byDomain.has(product.domain.toLowerCase())) continue;
    bySlug.set(product.slug, product);
    if (product.domain) byDomain.set(product.domain.toLowerCase(), product.slug);
  }

  return [...bySlug.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "uk"),
  );
}

function buildLocalCatalog(): CatalogProduct[] {
  const marketer = buildMarketerProducts();
  const osyo = buildOsyoProducts();
  return mergeCatalogProducts(marketer, osyo);
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
        { label: "Тарифи", url: "https://serpstat.com/pricing/" },
      ],
      creatorName: "Команда Serpstat",
      creatorLinkedInUrl: "https://www.linkedin.com/company/serpstat/",
      promoCode: "DODAI",
      promoUrl: "https://serpstat.com/",
      relatedSlugs: seRanking ? ["se-ranking"] : [],
    });
  }

  // Owner-confirmed product: newest by publishedAt (not a hard pin).
  const som = bySlug.get("som");
  if (som) {
    const confirmedAt = new Date(Date.UTC(2026, 8, 19, 18, 0, 0)).toISOString();
    bySlug.set("som", {
      ...som,
      name: "СОМ",
      tagline: "Рандомайзер для розіграшів у Instagram, TikTok, Facebook, YouTube та Threads.",
      description:
        "СОМ — сервіс для чесних розіграшів у соцмережах: збір учасників, випадковий вибір переможця та прозорі результати для SMM і маркетологів.",
      categorySlug: "som",
      categoryName: "СОМ",
      platforms: normalizePlatforms(["web", "ios", "android"]),
      claimable: false,
      ukraineNote:
        "Український продукт. Власник підтвердив картку та звʼязок з командою.",
      lastVerifiedAt: confirmedAt,
      publishedAt: confirmedAt,
      listingTier: "passport",
      seoTitle: "СОМ — розіграші в соцмережах",
      seoDescription:
        "Рандомайзер для розіграшів у Instagram, TikTok, Facebook, YouTube та Threads.",
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
    [
      ...Object.values(KIND_TO_CATEGORY).map((category) => [
        category.slug,
        category.introUk,
      ] as const),
      ["health", "Здоров’я, фітнес і wellbeing-продукти українських команд."] as const,
      ["games", "Ігри та розважальні застосунки від українських розробників."] as const,
      ["design", "Дизайн, креатив і візуальні інструменти."] as const,
      ["security", "Безпека, батьківський контроль і захист пристроїв."] as const,
      ["food", "Рецепти, meal-planning і foodtech-продукти."] as const,
      ["travel", "Подорожі, туризм і локальні travel-сервіси."] as const,
      ["tools", "Українські цифрові інструменти та сервіси."] as const,
    ],
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
