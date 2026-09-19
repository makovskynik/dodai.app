import { DodaiLogo } from "@/components/domain/DodaiLogo";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div className="space-y-3">
          <DodaiLogo />
          <p className="max-w-md text-sm text-ink/70">
            Каталог українських цифрових продуктів. Знайди сервіс під задачу або
            додай свій.
          </p>
          <p className="font-mono-meta text-[10px] uppercase tracking-[0.04em] text-ink/45">
            © 2024–2026 dodai.app
          </p>
        </div>
        <nav aria-label="Юридичні посилання" className="space-y-2">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink/70">
            <li>
              <Link
                href="/about"
                className="min-h-11 inline-flex items-center hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
              >
                Про dodai
              </Link>
            </li>
            <li>
              <Link
                href="/collections"
                className="min-h-11 inline-flex items-center hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
              >
                Підбірки
              </Link>
            </li>
            <li>
              <Link
                href="/legal/offer"
                className="min-h-11 inline-flex items-center hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
              >
                Оферта
              </Link>
            </li>
            <li>
              <Link
                href="/legal/privacy"
                className="min-h-11 inline-flex items-center hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
              >
                Конфіденційність
              </Link>
            </li>
            <li>
              <Link
                href="/pricing"
                className="min-h-11 inline-flex items-center hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
              >
                Тарифи
              </Link>
            </li>
            <li>
              <Link
                href="/product-of-the-week"
                className="min-h-11 inline-flex items-center hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
              >
                Продукт тижня
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
