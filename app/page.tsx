import Link from "next/link";
import type { Metadata } from "next";
import { DodaiLogo } from "@/components/domain/DodaiLogo";
import { LinkButton } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { HomeJsonLd } from "@/components/seo/JsonLd";
import { CompactProductOfDay } from "@/features/home/CompactProductOfDay";
import { HomeTaskSearch } from "@/features/home/HomeTaskSearch";
import { ProductCard } from "@/components/domain/ProductCard";
import { getCatalog, getProductOfTheDay } from "@/lib/catalog/queries";
import {
  paginateItems,
  parsePageParam,
} from "@/lib/catalog/pagination";
import { EDITORIAL_COLLECTIONS } from "@/lib/geo/collections";
import { buildPageMetadata, homeMetadata } from "@/lib/seo/metadata";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const page = parsePageParam((await searchParams).page);
  if (page > 1) {
    return buildPageMetadata({
      title: "dodai.app — каталог українських цифрових продуктів",
      description:
        "Каталог українських сервісів і застосунків. Пошук за задачею, голоси незалежні від оплати.",
      path: "/",
      noIndex: true,
    });
  }
  return homeMetadata();
}

function homeHrefForPage(page: number): string {
  if (page <= 1) return "/#catalog";
  return `/?page=${page}#catalog`;
}

export default async function HomePage({ searchParams }: PageProps) {
  const pageParam = parsePageParam((await searchParams).page);
  const [catalog, productOfDay] = await Promise.all([
    getCatalog({ sort: "new" }),
    getProductOfTheDay(),
  ]);

  const organicPage = paginateItems(catalog.organic, pageParam);
  const organic = organicPage.items;
  const promoted = catalog.promoted;
  const jsonLdProducts =
    organicPage.page === 1
      ? [...organic, ...promoted]
      : [...organic];
  const bridgeCategories = catalog.categories
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const newestPublishedAt = organic
    .map((product) => product.publishedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);
  const newestLabel = newestPublishedAt
    ? new Intl.DateTimeFormat("uk-UA", {
        day: "numeric",
        month: "long",
      }).format(new Date(newestPublishedAt))
    : null;

  return (
    <>
      <HomeJsonLd products={jsonLdProducts} />

      <section className="relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,var(--peach)_0%,transparent_42%),radial-gradient(circle_at_12%_88%,var(--mint)_0%,transparent_36%)] opacity-70"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:items-start lg:gap-12">
            <div className="max-w-2xl">
              <div className="mb-6 sm:mb-8">
                <DodaiLogo className="!text-[2rem] sm:!text-[2.5rem]" href={null} />
              </div>

              <p className="font-mono-meta mb-3 text-[10px] uppercase tracking-[0.04em] text-ink/50">
                Каталог · голоси · без pay-to-rank
              </p>

              <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-[3.25rem] lg:leading-[1.06]">
                Знайди український продукт для своєї задачі.
              </h1>

              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink/70 sm:text-base">
                {catalog.total} сервісів і застосунків. Короткі картки з фактами.
                Голоси незалежні від оплати.
              </p>

              <div className="mt-7">
                <HomeTaskSearch />
              </div>
            </div>

            <div className="lg:pt-14">
              {productOfDay ? (
                <CompactProductOfDay product={productOfDay} />
              ) : (
                <div className="rounded-card border border-dashed border-line bg-surface/70 p-5 text-sm text-ink/60">
                  Продукт тижня з’явиться після редакційного відбору.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        id="catalog"
        className="mx-auto max-w-[1440px] scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Нові в каталозі
            </h2>
            {newestLabel ? (
              <p className="mt-2 text-sm text-ink/65">Оновлено {newestLabel}</p>
            ) : null}
          </div>
          <LinkButton href="/products" variant="ghost" size="sm">
            Увесь каталог
          </LinkButton>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {organic.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {organicPage.totalPages > 1 ? (
          <div className="mt-10">
            <Pagination
              page={organicPage.page}
              totalPages={organicPage.totalPages}
              hrefForPage={homeHrefForPage}
              label="Сторінки нових у каталозі"
            />
          </div>
        ) : null}

        {bridgeCategories.length > 0 ? (
          <div className="mt-10 border-t border-line pt-8">
            <p className="mb-3 text-sm font-medium text-ink">Далі за категорією</p>
            <ul className="flex flex-wrap gap-2" aria-label="Категорії каталогу">
              {bridgeCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/products?category=${encodeURIComponent(category.slug)}`}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-pill border border-line bg-surface px-3.5 text-sm text-ink hover:bg-copper-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
                  >
                    {category.nameUk}
                    <span className="font-mono-meta text-[10px] text-ink/45">
                      {category.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {promoted.length > 0 ? (
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                Спонсоровані
              </h2>
              {promoted.length === 1 ? (
                <p className="font-mono-meta text-[10px] uppercase tracking-[0.04em] text-ink/45">
                  1 місце в інвентарі
                </p>
              ) : null}
            </div>
            <div
              className={
                promoted.length === 1
                  ? "max-w-xl"
                  : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              }
            >
              {promoted.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-line">
        <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Підбірки за задачею
              </h2>
              <p className="mt-2 text-sm text-ink/65">
                Готові відповіді на типові запити.
              </p>
            </div>
            <LinkButton href="/collections" variant="ghost" size="sm">
              Усі підбірки
            </LinkButton>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EDITORIAL_COLLECTIONS.slice(0, 3).map((collection) => (
              <li key={collection.slug}>
                <a
                  href={`/collections/${collection.slug}`}
                  className="block h-full rounded-card border border-line bg-surface p-5 hover:bg-copper-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
                >
                  <p className="font-mono-meta text-[10px] uppercase text-ink/45">
                    {collection.taskQueryUk}
                  </p>
                  <h3 className="mt-2 font-semibold">{collection.titleUk}</h3>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
