import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { PLATFORM_FAQ } from "@/lib/geo/faq";
import { breadcrumbJsonLd, faqJsonLd, organizationJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Про dodai.app",
  description:
    "Що таке dodai.app, як працюють голоси, Продукт тижня та безкоштовне базове розміщення.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-[720px] px-4 py-16 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Головна", path: "/" },
            { name: "Про dodai", path: "/about" },
          ]),
          faqJsonLd(PLATFORM_FAQ),
        ]}
      />

      <p className="font-mono-meta mb-3 text-[10px] uppercase text-ink/50">
        /about
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Про dodai.app</h1>
      <p className="mt-4 text-ink/70">
        Каталог українських цифрових продуктів. Головне — discovery за задачею.
        Мапа, голоси й платні місця підтримують каталог, а не замінюють його.
      </p>

      <section className="mt-10 space-y-4 text-[15px] leading-relaxed text-ink/80">
        <h2 className="text-xl font-semibold text-ink">Принципи</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Органічні голоси й рейтинг не продаються.</li>
          <li>Продукт тижня не можна купити.</li>
          <li>Спонсоровані місця завжди окремо й явно позначені.</li>
          <li>Dofollow-посилання не продаються.</li>
        </ul>
      </section>

      <section className="mt-12" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-xl font-semibold text-ink">
          Часті запитання
        </h2>
        <dl className="mt-6 space-y-5">
          {PLATFORM_FAQ.map((item) => (
            <div
              key={item.question}
              className="rounded-card border border-line bg-surface p-5"
            >
              <dt className="font-semibold text-ink">{item.question}</dt>
              <dd className="mt-2 text-sm text-ink/75">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link href="/collections" className="text-copper-dark underline">
          Підбірки за задачею →
        </Link>
        <Link href="/legal/offer" className="text-copper-dark underline">
          Оферта →
        </Link>
      </p>
    </article>
  );
}
