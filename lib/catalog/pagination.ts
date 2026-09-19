export const CATALOG_PAGE_SIZE = 9;

export type PageSlice<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
};

export function parsePageParam(value: string | string[] | undefined): number {
  const raw = typeof value === "string" ? value : undefined;
  const parsed = raw ? Number.parseInt(raw, 10) : 1;
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number = CATALOG_PAGE_SIZE,
): PageSlice<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    totalPages,
    total,
  };
}

/** Compact page list: 1 … 4 5 6 … 20 */
export function paginationWindow(
  page: number,
  totalPages: number,
  radius = 1,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let i = page - radius; i <= page + radius; i += 1) {
    if (i >= 1 && i <= totalPages) pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const current = sorted[i]!;
    const prev = sorted[i - 1];
    if (prev !== undefined && current - prev > 1) {
      result.push("ellipsis");
    }
    result.push(current);
  }
  return result;
}
