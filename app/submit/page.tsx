import type { Metadata } from "next";
import { Suspense } from "react";
import { SubmitFlow } from "@/features/submit/SubmitFlow";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Додати продукт",
  description:
    "Додайте український цифровий продукт до dodai.app: URL, метадані, категорія та звʼязок з Україною.",
  path: "/submit",
  noIndex: true,
});

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <p className="font-mono-meta mb-3 text-[10px] uppercase text-ink/50">
          /submit · етап 2
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Додати продукт
        </h1>
        <p className="mt-3 text-ink/70">
          Почніть з URL. Безкоштовна картка або Passport за 300 грн. Спонсор і
          мапа — окремо (/pricing).
        </p>
      </header>

      <Suspense
        fallback={
          <div className="rounded-card border border-line bg-surface p-6 text-ink/60">
            Завантаження форми…
          </div>
        }
      >
        <SubmitFlow />
      </Suspense>
    </div>
  );
}
