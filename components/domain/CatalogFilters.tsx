"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics/client";
import { platformLabel } from "@/lib/catalog/platforms";
import type { CatalogCategory, CatalogQuery } from "@/lib/catalog/types";

type CatalogFiltersProps = {
  query: CatalogQuery;
  categories: CatalogCategory[];
  platforms: string[];
};

const TOP_CATEGORY_COUNT = 8;

function hrefFor(next: CatalogQuery): string {
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.category) params.set("category", next.category);
  if (next.platform) params.set("platform", next.platform);
  if (next.sort && next.sort !== "new") params.set("sort", next.sort);
  // Filter changes always reset to page 1 — omit page param.
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

const chip =
  "inline-flex min-h-10 items-center rounded-pill border px-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

const selectClass =
  "min-h-10 rounded-card border border-line bg-surface px-3 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

function trackFilter(next: CatalogQuery) {
  trackEvent("filter_applied", {
    q: next.q ?? null,
    category: next.category ?? null,
    platform: next.platform ?? null,
  });
}

function splitCategories(
  categories: CatalogCategory[],
  activeSlug: string | undefined,
) {
  const ranked = categories
    .slice()
    .sort((a, b) => b.count - a.count || a.nameUk.localeCompare(b.nameUk, "uk"));

  const top: CatalogCategory[] = [];
  const rest: CatalogCategory[] = [];
  const seen = new Set<string>();

  for (const category of ranked) {
    if (top.length < TOP_CATEGORY_COUNT) {
      top.push(category);
      seen.add(category.slug);
    } else {
      rest.push(category);
    }
  }

  if (activeSlug && !seen.has(activeSlug)) {
    const active = categories.find((category) => category.slug === activeSlug);
    if (active) {
      const dropped = top.pop();
      top.push(active);
      if (dropped) {
        rest.unshift(dropped);
        rest.sort(
          (a, b) => b.count - a.count || a.nameUk.localeCompare(b.nameUk, "uk"),
        );
      }
    }
  }

  return { top, rest };
}

export function CatalogFilters({
  query,
  categories,
  platforms,
}: CatalogFiltersProps) {
  const router = useRouter();
  const hasFilters = Boolean(query.q || query.category || query.platform);
  const activeCategory = categories.find(
    (category) => category.slug === query.category,
  );
  const { top, rest } = splitCategories(categories, query.category);

  function navigate(next: CatalogQuery) {
    trackFilter(next);
    router.push(hrefFor(next));
  }

  return (
    <div className="space-y-4">
      {hasFilters ? (
        <ul className="flex flex-wrap gap-2" aria-label="Активні фільтри">
          {query.q ? (
            <li>
              <Link
                href={hrefFor({ ...query, q: undefined })}
                onClick={() => trackFilter({ ...query, q: undefined })}
                className={`${chip} border-ink/15 bg-canvas text-ink`}
              >
                «{query.q}»
                <span className="ml-2 text-ink/45" aria-hidden="true">
                  ×
                </span>
                <span className="sr-only">Прибрати пошук</span>
              </Link>
            </li>
          ) : null}
          {activeCategory ? (
            <li>
              <Link
                href={hrefFor({ ...query, category: undefined })}
                onClick={() => trackFilter({ ...query, category: undefined })}
                className={`${chip} border-ink/15 bg-canvas text-ink`}
              >
                {activeCategory.nameUk}
                <span className="ml-2 text-ink/45" aria-hidden="true">
                  ×
                </span>
                <span className="sr-only">Прибрати категорію</span>
              </Link>
            </li>
          ) : null}
          {query.platform ? (
            <li>
              <Link
                href={hrefFor({ ...query, platform: undefined })}
                onClick={() => trackFilter({ ...query, platform: undefined })}
                className={`${chip} border-ink/15 bg-canvas text-ink`}
              >
                {platformLabel(query.platform)}
                <span className="ml-2 text-ink/45" aria-hidden="true">
                  ×
                </span>
                <span className="sr-only">Прибрати платформу</span>
              </Link>
            </li>
          ) : null}
          <li>
            <Link
              href="/products"
              onClick={() => trackFilter({})}
              className={`${chip} border-line bg-surface text-ink/70 hover:bg-copper-soft`}
            >
              Скинути
            </Link>
          </li>
        </ul>
      ) : null}

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2" aria-label="Категорії">
          <Link
            href={hrefFor({ ...query, category: undefined })}
            onClick={() => trackFilter({ ...query, category: undefined })}
            className={`${chip} ${
              !query.category
                ? "border-ink bg-ink text-surface"
                : "border-line bg-surface text-ink hover:bg-copper-soft"
            }`}
          >
            Усі
          </Link>
          {top.map((category) => {
            const active = query.category === category.slug;
            const next = {
              ...query,
              category: active ? undefined : category.slug,
            };
            return (
              <Link
                key={category.slug}
                href={hrefFor(next)}
                onClick={() => trackFilter(next)}
                className={`${chip} ${
                  active
                    ? "border-ink bg-ink text-surface"
                    : "border-line bg-surface text-ink hover:bg-copper-soft"
                }`}
              >
                {category.nameUk}
                <span className="font-mono-meta ml-1.5 text-[10px] opacity-70">
                  {category.count}
                </span>
              </Link>
            );
          })}
          {rest.length > 0 ? (
            <label className="inline-flex min-h-10 items-center gap-2">
              <span className="sr-only">Ще категорії</span>
              <select
                className={selectClass}
                value=""
                aria-label="Ще категорії"
                onChange={(event) => {
                  const slug = event.target.value;
                  if (!slug) return;
                  navigate({ ...query, category: slug });
                }}
              >
                <option value="">Ще…</option>
                {rest.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.nameUk} ({category.count})
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-ink/70">
            <span className="font-mono-meta text-[10px] uppercase text-ink/45">
              Платформа
            </span>
            <select
              className={selectClass}
              value={query.platform ?? ""}
              aria-label="Платформа"
              onChange={(event) => {
                const value = event.target.value;
                navigate({
                  ...query,
                  platform: value || undefined,
                });
              }}
            >
              <option value="">Усі</option>
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platformLabel(platform)}
                </option>
              ))}
            </select>
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-ink/70">
            <span className="font-mono-meta text-[10px] uppercase text-ink/45">
              Сортування
            </span>
            <select
              className={selectClass}
              value={query.sort ?? "new"}
              aria-label="Сортування"
              onChange={(event) => {
                const value = event.target.value === "name" ? "name" : "new";
                navigate({ ...query, sort: value });
              }}
            >
              <option value="new">Нові</option>
              <option value="name">Назва</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
