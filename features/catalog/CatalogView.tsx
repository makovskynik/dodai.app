import Link from "next/link";
import { ProductCard } from "@/components/domain/ProductCard";
import { CatalogFilters } from "@/components/domain/CatalogFilters";
import { Pagination } from "@/components/ui/Pagination";
import { SearchField } from "@/components/ui/SearchField";
import {
  EDITORIAL_COLLECTIONS,
  getCollectionBySlug,
  suggestCollectionsForQuery,
} from "@/lib/geo/collections";
import { paginateItems } from "@/lib/catalog/pagination";
import type { CatalogQuery, CatalogResult } from "@/lib/catalog/types";

type CatalogViewProps = {
  catalog: CatalogResult;
};

function formatFoundLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 14) return `Знайдено ${count} продуктів`;
  if (mod10 === 1) return `Знайдено ${count} продукт`;
  if (mod10 >= 2 && mod10 <= 4) return `Знайдено ${count} продукти`;
  return `Знайдено ${count} продуктів`;
}

function productsHrefForPage(query: CatalogQuery, page: number): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.category) params.set("category", query.category);
  if (query.platform) params.set("platform", query.platform);
  if (query.sort && query.sort !== "new") params.set("sort", query.sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

export function CatalogView({ catalog }: CatalogViewProps) {
  const { organic, promoted, categories, platforms, query, total, zeroResult } =
    catalog;

  const organicPage = paginateItems(organic, query.page ?? 1);

  const suggested = query.q
    ? suggestCollectionsForQuery(query.q)
        .map((slug) => getCollectionBySlug(slug))
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <SearchField defaultValue={query.q ?? ""} />

      <CatalogFilters
        query={query}
        categories={categories}
        platforms={platforms}
      />

      <p className="text-sm text-ink/65">{formatFoundLabel(total)}</p>

      {zeroResult ? (
        <div className="rounded-card border border-line bg-surface p-8">
          <h2 className="text-xl font-semibold">Нічого не знайдено</h2>
          <p className="mt-2 text-ink/70">
            Спробуйте інший запит або скиньте фільтри. Нульові пошуки ми
            зберігаємо, щоб планувати нові підбірки.
          </p>
          {suggested.length > 0 ? (
            <div className="mt-6">
              <p className="font-mono-meta text-[10px] uppercase text-ink/45">
                Можливі підбірки
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {suggested.map((collection) =>
                  collection ? (
                    <li key={collection.slug}>
                      <Link
                        href={`/collections/${collection.slug}`}
                        className="inline-flex min-h-11 items-center rounded-pill border border-line bg-canvas px-3 text-sm hover:bg-copper-soft"
                      >
                        {collection.titleUk}
                      </Link>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink/60">
              Перегляньте{" "}
              <Link href="/collections" className="underline">
                редакційні підбірки
              </Link>{" "}
              ({EDITORIAL_COLLECTIONS.length}).
            </p>
          )}
        </div>
      ) : (
        <>
          {promoted.length > 0 ? (
            <section aria-labelledby="promoted-heading">
              <h2 id="promoted-heading" className="mb-4 text-lg font-semibold">
                Спонсоровані
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {promoted.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ) : null}

          <section
            aria-labelledby={
              promoted.length > 0 ? "organic-heading" : undefined
            }
          >
            {promoted.length > 0 ? (
              <h2 id="organic-heading" className="mb-4 text-lg font-semibold">
                Результати
              </h2>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {organicPage.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {organicPage.totalPages > 1 ? (
              <div className="mt-10">
                <Pagination
                  page={organicPage.page}
                  totalPages={organicPage.totalPages}
                  hrefForPage={(page) => productsHrefForPage(query, page)}
                  label="Сторінки каталогу"
                />
              </div>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
