import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Політика конфіденційності",
  description:
    "Як dodai.app обробляє дані користувачів, аналітику та заявки на розміщення.",
  path: "/legal/privacy",
});

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-[720px] px-4 py-16 sm:px-6 lg:px-8">
      <p className="font-mono-meta mb-3 text-[10px] uppercase text-ink/50">
        /legal/privacy
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Політика конфіденційності
      </h1>
      <p className="mt-4 text-sm text-ink/60">Оновлено: 18 вересня 2026</p>

      <div className="prose-legal mt-8 space-y-6 text-[15px] leading-relaxed text-ink/80">
        <section>
          <h2 className="text-xl font-semibold text-ink">1. Хто ми</h2>
          <p className="mt-2">
            dodai.app — каталог українських цифрових продуктів. Ця політика
            описує, які дані ми збираємо для роботи каталогу, модерації,
            оплати базового розміщення та аналітики продукту.
          </p>
          <p className="mt-2">
            Реквізити оператора платформи будуть уточнені перед публічним
            запуском платних послуг (юридичний review).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">2. Які дані збираємо</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Email власника продукту (magic link, модерація, статус заявки).</li>
            <li>Дані заявки: URL, опис, категорія, платформи, місто, звʼязок з Україною.</li>
            <li>Технічні логи платежів (статус, idempotency key) — без продажу голосів.</li>
            <li>
              Продуктова аналітика (PostHog): події на кшталт пошуку, відкриття
              картки, переходів на зовнішні сайти. Без приватних коментарів і зайвих
              персональних даних.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">3. Для чого</h2>
          <p className="mt-2">
            Щоб показати каталог, провести модерацію, підтвердити оплату базового
            розміщення, захистити голосування від зловживань і покращити пошук
            (зокрема нульові результати).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">4. Передача третім сторонам</h2>
          <p className="mt-2">
            Інфраструктура: Vercel (хостинг), Neon (база), платіжні провайдери
            (Monobank / WayForPay), email-провайдер (Resend), аналітика
            (PostHog). Ми не продаємо персональні дані.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">5. Ваші права</h2>
          <p className="mt-2">
            Ви можете запитати доступ, виправлення або видалення даних власника,
            написавши на контакт, який буде опубліковано в оферті перед live
            платежами.
          </p>
        </section>

        <p className="pt-4">
          <Link href="/legal/offer" className="text-copper-dark underline">
            Публічна оферта →
          </Link>
        </p>
      </div>
    </article>
  );
}
