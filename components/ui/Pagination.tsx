import Link from "next/link";
import { paginationWindow } from "@/lib/catalog/pagination";

type PaginationProps = {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
  /** Accessible name for the nav landmark. */
  label?: string;
};

export function Pagination({
  page,
  totalPages,
  hrefForPage,
  label = "Сторінки",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const window = paginationWindow(page, totalPages);
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  const itemClass =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill border px-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label={label}>
      {prevPage ? (
        <Link
          href={hrefForPage(prevPage)}
          className={`${itemClass} border-line bg-surface text-ink hover:bg-copper-soft`}
          rel="prev"
        >
          Назад
        </Link>
      ) : (
        <span
          className={`${itemClass} cursor-not-allowed border-line bg-canvas text-ink/35`}
          aria-disabled="true"
        >
          Назад
        </span>
      )}

      <ul className="flex flex-wrap items-center gap-1.5">
        {window.map((entry, index) =>
          entry === "ellipsis" ? (
            <li
              key={`ellipsis-${index}`}
              className="px-1 font-mono-meta text-ink/40"
              aria-hidden
            >
              …
            </li>
          ) : (
            <li key={entry}>
              {entry === page ? (
                <span
                  className={`${itemClass} border-ink bg-ink text-surface`}
                  aria-current="page"
                >
                  {entry}
                </span>
              ) : (
                <Link
                  href={hrefForPage(entry)}
                  className={`${itemClass} border-line bg-surface text-ink hover:bg-copper-soft`}
                >
                  {entry}
                </Link>
              )}
            </li>
          ),
        )}
      </ul>

      {nextPage ? (
        <Link
          href={hrefForPage(nextPage)}
          className={`${itemClass} border-line bg-surface text-ink hover:bg-copper-soft`}
          rel="next"
        >
          Далі
        </Link>
      ) : (
        <span
          className={`${itemClass} cursor-not-allowed border-line bg-canvas text-ink/35`}
          aria-disabled="true"
        >
          Далі
        </span>
      )}
    </nav>
  );
}
