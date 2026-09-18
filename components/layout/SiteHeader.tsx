import Link from "next/link";
import { DodaiLogo } from "@/components/domain/DodaiLogo";
import { LinkButton } from "@/components/ui/Button";

const nav = [
  { href: "/products", label: "Каталог" },
  { href: "/collections", label: "Підбірки" },
  { href: "/map", label: "Мапа" },
  { href: "/pricing", label: "Тарифи" },
  { href: "/product-of-the-week", label: "Продукт тижня" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-canvas/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <DodaiLogo />
          <nav aria-label="Головна навігація" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center rounded-pill px-3 text-sm text-ink/80 hover:bg-copper-soft hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LinkButton href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Вхід
          </LinkButton>
          <LinkButton href="/submit" size="sm">
            Додати продукт
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
