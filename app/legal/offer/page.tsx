import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Публічна оферта",
  description:
    "Безкоштовна картка або Passport 300 грн, модерація, голоси та спонсоровані місця на dodai.app.",
  path: "/legal/offer",
});

export default function OfferPage() {
  return (
    <article className="mx-auto max-w-[720px] px-4 py-16 sm:px-6 lg:px-8">
      <p className="font-mono-meta mb-3 text-[10px] uppercase text-ink/50">
        /legal/offer
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Публічна оферта</h1>
      <p className="mt-4 text-sm text-ink/60">Оновлено: 18 вересня 2026</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink/80">
        <section>
          <h2 className="text-xl font-semibold text-ink">1. Предмет</h2>
          <p className="mt-2">
            dodai.app надає послугу розміщення картки українського цифрового
            продукту в каталозі: публічна сторінка, модерація та базове
            відображення в пошуку.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">2. Базове розміщення</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Безкоштовна картка: назва, лого, 1 лінк, платформи, опис до 120
              символів, схожі проєкти.
            </li>
            <li>
              Passport (повна картка): 300 грн разово — текст до 1000 символів, до
              5 лінків, хто створив + LinkedIn, промо, власні пов’язані проєкти.
            </li>
            <li>
              Публікація — лише після схвалення модерацією. Passport оплачується
              до модерації; безкоштовна картка — без оплати.
            </li>
            <li>
              Оплата не змінює органічні голоси, органічний рейтинг і не купує
              статус «Продукт тижня».
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">3. Додаткові опції</h2>
          <p className="mt-2">
            Місце на мапі та спонсоровані блоки — окремий інвентар із явним
            маркуванням «Спонсорований». Актуальні тарифи:{" "}
            <Link href="/pricing" className="text-copper-dark underline-offset-2 hover:underline">
              /pricing
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">4. Посилання</h2>
          <p className="mt-2">
            Платні outbound-посилання мають атрибути{" "}
            <code className="font-mono-meta text-[12px]">
              rel=&quot;sponsored nofollow noopener&quot;
            </code>
            . Dofollow не продається.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">5. Відмова / повернення</h2>
          <p className="mt-2">
            Якщо модерація відхиляє заявку після оплати, застосовується
            задокументований шлях повернення. Клієнтський success-екран не
            активує продукт.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">6. Обмеження</h2>
          <p className="mt-2">
            Ми не гарантуємо трафік, продажі, позиції в пошуку чи AI-цитування.
            Каталог залишається корисним без обовʼязкового кліку назовні.
          </p>
        </section>

        <p className="rounded-card border border-line bg-peach/40 px-4 py-3 text-sm text-ink/75">
          Перед прийомом live-платежів потрібен окремий юридичний review
          (фіскалізація, реквізити оператора, повний текст оферти).
        </p>

        <p>
          <Link href="/legal/privacy" className="text-copper-dark underline">
            Політика конфіденційності →
          </Link>
        </p>
      </div>
    </article>
  );
}
