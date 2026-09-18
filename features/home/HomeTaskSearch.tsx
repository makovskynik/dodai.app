"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { trackEvent } from "@/lib/analytics/client";

const TASK_CHIPS = [
  { label: "CRM для продажів", q: "CRM" },
  { label: "SEO", q: "SEO" },
  { label: "Платежі", q: "платежі" },
  { label: "Робота", q: "робота" },
  { label: "AI", q: "AI" },
  { label: "EdTech", q: "EdTech" },
] as const;

type HomeTaskSearchProps = {
  inputId?: string;
};

export function HomeTaskSearch({ inputId = "home-task-search" }: HomeTaskSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();

  function goToCatalog(q: string) {
    const trimmed = q.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);

    trackEvent("search_submitted", {
      q: trimmed || null,
      category: null,
      platform: null,
    });

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `/products?${qs}` : "/products");
    });
  }

  return (
    <div className="space-y-3">
      <form
        role="search"
        className="flex w-full flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          goToCatalog(value);
        }}
      >
        <label className="sr-only" htmlFor={inputId}>
          Пошук продукту за задачею
        </label>
        <input
          id={inputId}
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Наприклад: CRM для продажів"
          autoComplete="off"
          className="min-h-12 w-full flex-1 rounded-card border border-line bg-surface px-4 text-[15px] text-ink placeholder:text-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
        />
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-pill bg-copper px-6 text-sm font-medium text-surface hover:bg-copper-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper disabled:opacity-50"
          disabled={isPending}
          aria-busy={isPending || undefined}
        >
          {isPending ? "Шукаємо…" : "Знайти"}
        </button>
      </form>

      <ul className="flex flex-wrap gap-2" aria-label="Типові задачі">
        {TASK_CHIPS.map((chip) => (
          <li key={chip.q}>
            <button
              type="button"
              onClick={() => goToCatalog(chip.q)}
              className="inline-flex min-h-10 items-center rounded-pill border border-line bg-surface px-3.5 text-sm text-ink hover:bg-copper-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
            >
              {chip.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-ink/55">
        <p>Оплата не піднімає в органіці.</p>
        <p>
          Власник?{" "}
          <Link
            href="/submit"
            className="font-medium text-copper-dark underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
          >
            Додати свій
          </Link>
        </p>
      </div>
    </div>
  );
}
