"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { trackEvent } from "@/lib/analytics/client";

type SearchFieldProps = {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
};

export function SearchField({
  name = "q",
  defaultValue = "",
  placeholder = "Наприклад: crm для продажів",
}: SearchFieldProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const submitSearch = useCallback(
    (nextValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = nextValue.trim();
      if (trimmed) params.set(name, trimmed);
      else params.delete(name);
      params.delete("page");

      trackEvent("search_submitted", {
        q: trimmed || null,
        category: params.get("category"),
        platform: params.get("platform"),
      });

      startTransition(() => {
        const qs = params.toString();
        router.push(qs ? `/products?${qs}` : "/products");
      });
    },
    [name, router, searchParams],
  );

  return (
    <form
      role="search"
      className="flex w-full flex-col gap-2 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        submitSearch(value);
      }}
    >
      <label className="sr-only" htmlFor="catalog-search">
        Пошук продуктів
      </label>
      <input
        id="catalog-search"
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="min-h-11 w-full flex-1 rounded-card border border-line bg-surface px-4 text-[15px] text-ink placeholder:text-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
      />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-pill bg-copper px-5 text-sm font-medium text-surface hover:bg-copper-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper disabled:opacity-50"
        disabled={isPending}
        aria-busy={isPending || undefined}
      >
        {isPending ? "Шукаємо…" : "Знайти →"}
      </button>
    </form>
  );
}
