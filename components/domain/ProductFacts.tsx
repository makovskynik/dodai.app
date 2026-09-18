import type { CatalogProduct } from "@/lib/catalog/types";

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}

type ProductFactsProps = {
  product: CatalogProduct;
};

/** Short factual block optimized for human scanning and AI citation. */
export function ProductFacts({ product }: ProductFactsProps) {
  const facts = [
    { label: "Категорія", value: product.categoryName },
    { label: "Платформи", value: product.platforms.join(", ") },
    {
      label: "Модель оплати",
      value: product.pricingModel ?? "Не вказано",
    },
    {
      label: "Український інтерфейс",
      value:
        product.hasUkrainianUi === true
          ? "Так"
          : product.hasUkrainianUi === false
            ? "Ні / частково"
            : "Не вказано",
    },
    { label: "Місто / команда", value: product.cityLabel ?? "Не вказано" },
    {
      label: "Звʼязок з Україною",
      value: product.ukraineNote ?? "Українська команда або засновники (редакційна перевірка).",
    },
    {
      label: "Перевірено",
      value: formatDate(product.lastVerifiedAt ?? product.publishedAt),
    },
    { label: "Домен", value: product.domain ?? "—" },
  ];

  return (
    <section
      aria-labelledby="product-facts-heading"
      className="mt-10 rounded-card border border-line bg-surface p-6"
    >
      <h2
        id="product-facts-heading"
        className="text-lg font-semibold tracking-tight text-ink"
      >
        Факти про продукт
      </h2>
      <p className="mt-2 text-sm text-ink/65">
        Короткі перевірювані дані для каталогу. Не рекламний слоган.
      </p>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="font-mono-meta text-[10px] uppercase text-ink/45">
              {fact.label}
            </dt>
            <dd className="mt-1 text-[15px] text-ink">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
