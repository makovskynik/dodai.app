import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import {
  BASE_LISTING_SKU,
  BUNDLE_SKUS,
  formatUah,
  NOT_FOR_SALE,
  PASSPORT_LISTING_SKU,
  PLACEMENT_SKUS,
  PRICING_STATUS,
  PRICING_VERSION,
  SERVICE_SKUS,
} from "@/lib/pricing/catalog";
import { getSurfaceAvailability } from "@/lib/placements/availability";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPlacementInventory } from "@/server/placements/queries";

export const metadata: Metadata = buildPageMetadata({
  title: "Тарифи розміщення",
  description:
    "Безкоштовна картка або Passport за 300 грн. Спонсорські місця окремо. Органіка, голоси й dofollow не продаються.",
  path: "/pricing",
});

export default async function PricingPage() {
  const inventory = await getPlacementInventory();
  const now = new Date();
  const availabilityBySurface = {
    catalog_home: getSurfaceAvailability(inventory, "catalog_home", now),
    catalog_category: getSurfaceAvailability(
      inventory,
      "catalog_category",
      now,
    ),
    map_logo: getSurfaceAvailability(inventory, "map_logo", now),
    map_highlight: getSurfaceAvailability(inventory, "map_highlight", now),
  };

  return (
    <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="max-w-2xl">
        <p className="font-mono-meta mb-3 text-[10px] uppercase tracking-[0.04em] text-ink/50">
          /pricing · {PRICING_VERSION}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Тарифи
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink/70 sm:text-base">
          Безкоштовна картка або повний Passport. Платите за глибшу інформацію —
          не за місце в органіці і не за dofollow.
        </p>
        {PRICING_STATUS === "proposed" ? (
          <p
            className="mt-5 rounded-card border border-warning/30 bg-peach px-4 py-3 text-sm text-ink"
            role="status"
          >
            Модель v3: free vs Passport 300 грн разово. Спонсорські слоти —
            founding-ціни окремо.
          </p>
        ) : null}
      </header>

      <section className="mt-12 grid gap-4 lg:grid-cols-2">
        <article className="flex flex-col rounded-card border border-line bg-surface p-6 shadow-soft">
          <h2 className="text-xl font-semibold">{BASE_LISTING_SKU.nameUk}</h2>
          <p className="mt-2 flex-1 text-sm text-ink/65">
            {BASE_LISTING_SKU.summaryUk}
          </p>
          <ul className="mt-4 space-y-1 text-sm text-ink/80">
            {BASE_LISTING_SKU.includesUk.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
          <p className="mt-6 text-3xl font-semibold tabular-nums">
            {formatUah(BASE_LISTING_SKU.priceUah)}
          </p>
          <p className="font-mono-meta mt-1 text-[10px] uppercase text-ink/45">
            {BASE_LISTING_SKU.billingUk}
          </p>
          <div className="mt-6">
            <LinkButton href="/submit" size="sm">
              Додати безкоштовно
            </LinkButton>
          </div>
        </article>

        <article className="flex flex-col rounded-card border border-ink bg-surface p-6 shadow-soft">
          <h2 className="text-xl font-semibold">{PASSPORT_LISTING_SKU.nameUk}</h2>
          <p className="mt-2 flex-1 text-sm text-ink/65">
            {PASSPORT_LISTING_SKU.summaryUk}
          </p>
          <ul className="mt-4 space-y-1 text-sm text-ink/80">
            {PASSPORT_LISTING_SKU.includesUk.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
          <p className="mt-6 text-3xl font-semibold tabular-nums">
            {formatUah(PASSPORT_LISTING_SKU.priceUah)}
          </p>
          <p className="font-mono-meta mt-1 text-[10px] uppercase text-ink/45">
            {PASSPORT_LISTING_SKU.billingUk}
          </p>
          <p className="mt-3 text-sm text-ink/55">{PASSPORT_LISTING_SKU.noteUk}</p>
          <div className="mt-6">
            <LinkButton href="/submit" size="sm">
              Passport · 300 грн
            </LinkButton>
          </div>
        </article>
      </section>

      <section className="mt-14" aria-labelledby="placements-heading">
        <h2
          id="placements-heading"
          className="text-2xl font-semibold tracking-tight"
        >
          Спонсорські місця (окремо)
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/65">
          На мапі три рівні: малий логотип (безкоштовно), середній і великий —
          платні слоти з лімітом. Founding-ціни.
        </p>
        <div className="mt-6 overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-canvas/80">
              <tr>
                <th className="px-4 py-3 font-medium">Місце</th>
                <th className="px-4 py-3 font-medium">Хто «перший»</th>
                <th className="px-4 py-3 font-medium">Зараз</th>
                <th className="px-4 py-3 font-medium tabular-nums">30 днів</th>
              </tr>
            </thead>
            <tbody>
              {PLACEMENT_SKUS.map((sku) => {
                const availability = availabilityBySurface[sku.surface];
                return (
                  <tr key={sku.id} className="border-b border-line last:border-0">
                    <th className="px-4 py-4 align-top font-medium">
                      <span className="block">{sku.nameUk}</span>
                      <span className="mt-1 block font-normal text-ink/60">
                        {sku.summaryUk}
                      </span>
                      <span className="font-mono-meta mt-2 block text-[10px] uppercase text-ink/45">
                        {sku.inventoryNoteUk}
                      </span>
                    </th>
                    <td className="px-4 py-4 align-top text-ink/70">
                      {sku.rankingRuleUk}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={
                          availability.canBuyNow
                            ? "text-ink"
                            : "text-danger"
                        }
                      >
                        {availability.statusUk}
                      </span>
                      <span className="font-mono-meta mt-1 block text-[10px] uppercase text-ink/45">
                        {availability.canBuyNow
                          ? "Можна купити"
                          : "Чекайте вільного слота"}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top tabular-nums">
                      {formatUah(sku.pricesUah[30])}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight">Пакети</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {BUNDLE_SKUS.map((bundle) => (
            <li
              key={bundle.id}
              className="flex flex-col rounded-card border border-line bg-surface p-5"
            >
              <h3 className="text-lg font-semibold">{bundle.nameUk}</h3>
              <p className="mt-2 flex-1 text-sm text-ink/65">{bundle.summaryUk}</p>
              <ul className="mt-4 space-y-1 text-sm">
                {bundle.includesUk.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
              <p className="mt-5 text-2xl font-semibold tabular-nums">
                {formatUah(bundle.priceUah)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight">Сервіси</h2>
        <ul className="mt-6 divide-y divide-line rounded-card border border-line bg-surface">
          {SERVICE_SKUS.map((service) => (
            <li
              key={service.id}
              className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
            >
              <div>
                <h3 className="font-semibold">
                  {service.nameUk}
                  {service.status === "soon" ? (
                    <span className="font-mono-meta ml-2 text-[10px] uppercase text-ink/45">
                      скоро
                    </span>
                  ) : null}
                </h3>
                <p className="mt-1 text-sm text-ink/65">{service.summaryUk}</p>
              </div>
              <p className="font-mono-meta text-sm">{service.priceLabelUk}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight">Не продається</h2>
        <ul className="mt-6 space-y-4">
          {NOT_FOR_SALE.map((item) => (
            <li key={item.id} className="border-b border-line pb-4 last:border-0">
              <p className="font-semibold">{item.nameUk}</p>
              <p className="mt-1 text-sm text-ink/65">{item.reasonUk}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-14 flex flex-wrap gap-3">
        <LinkButton href="/submit">Додати продукт</LinkButton>
        <LinkButton href="/legal/offer" variant="ghost">
          Оферта
        </LinkButton>
        <Link
          href="/about"
          className="inline-flex min-h-11 items-center text-sm text-copper-dark underline-offset-2 hover:underline"
        >
          Принципи
        </Link>
      </div>
    </div>
  );
}
