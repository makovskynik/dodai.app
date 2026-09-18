"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/FormField";
import { trackEvent } from "@/lib/analytics/client";
import {
  CATEGORY_OPTIONS,
  PLATFORM_OPTIONS,
  PRICING_OPTIONS,
  type FetchedMetadata,
  type ListingTierInput,
  type Platform,
  type PricingModel,
} from "@/lib/submit/schema";
import { PASSPORT_LISTING_PRICE_UAH } from "@/lib/catalog/listing-tier";
import { formatUah } from "@/lib/pricing/catalog";

type Step = "url" | "profile" | "done";

type FormState = {
  url: string;
  name: string;
  tagline: string;
  description: string;
  categorySlug: string;
  platforms: Platform[];
  pricingModel: PricingModel;
  hasUkrainianUi: "yes" | "no" | "unknown";
  cityLabel: string;
  ukraineNote: string;
  ownerEmail: string;
  ownerName: string;
  seoTitle: string;
  seoDescription: string;
  domain: string;
  faviconUrl: string;
  ogImageUrl: string;
  listingTier: ListingTierInput;
  extraLink1: string;
  extraLink2: string;
  extraLink3: string;
  extraLink4: string;
  extraLink5: string;
  creatorName: string;
  creatorLinkedInUrl: string;
  promoCode: string;
  promoUrl: string;
  relatedSlugsRaw: string;
};

const initialState: FormState = {
  url: "",
  name: "",
  tagline: "",
  description: "",
  categorySlug: "tools",
  platforms: ["web"],
  pricingModel: "unknown",
  hasUkrainianUi: "unknown",
  cityLabel: "",
  ukraineNote: "",
  ownerEmail: "",
  ownerName: "",
  seoTitle: "",
  seoDescription: "",
  domain: "",
  faviconUrl: "",
  ogImageUrl: "",
  listingTier: "free",
  extraLink1: "",
  extraLink2: "",
  extraLink3: "",
  extraLink4: "",
  extraLink5: "",
  creatorName: "",
  creatorLinkedInUrl: "",
  promoCode: "",
  promoUrl: "",
  relatedSlugsRaw: "",
};

function clip(value: string, max: number) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned;
}

export function SubmitFlow() {
  const [step, setStep] = useState<Step>("url");
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [duplicateSlug, setDuplicateSlug] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    trackEvent("submit_started");
  }, []);

  const publicTitle = useMemo(
    () => form.seoTitle.trim() || `${form.name} — український цифровий продукт`,
    [form.seoTitle, form.name],
  );
  const publicDescription = useMemo(
    () => form.seoDescription.trim() || form.tagline,
    [form.seoDescription, form.tagline],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function togglePlatform(platform: Platform) {
    setForm((current) => {
      const exists = current.platforms.includes(platform);
      const platforms = exists
        ? current.platforms.filter((item) => item !== platform)
        : [...current.platforms, platform];
      return { ...current, platforms };
    });
  }

  function loadMetadata() {
    setError(null);
    setDuplicateSlug(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: form.url }),
        });
        const data = (await response.json()) as {
          error?: string;
          metadata?: FetchedMetadata;
          duplicateSlug?: string | null;
        };
        if (!response.ok || !data.metadata) {
          throw new Error(data.error ?? "Не вдалося прочитати метадані");
        }

        const meta = data.metadata;
        setDuplicateSlug(data.duplicateSlug ?? null);
        setForm((current) => ({
          ...current,
          url: meta.finalUrl || current.url,
          domain: meta.domain,
          name: current.name || clip(meta.title ?? meta.domain, 80),
          tagline: current.tagline || clip(meta.description ?? "", 120),
          description:
            current.listingTier === "passport"
              ? current.description || (meta.description ?? "")
              : "",
          faviconUrl: meta.faviconUrl ?? "",
          ogImageUrl: meta.ogImageUrl ?? "",
          seoTitle: current.seoTitle,
          seoDescription: current.seoDescription,
        }));
        trackEvent("metadata_loaded", { attribution: "submit" });
        setStep("profile");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Помилка метаданих");
      }
    });
  }

  function submitProfile() {
    setError(null);
    startTransition(async () => {
      try {
        const extraLinks = [
          form.extraLink1,
          form.extraLink2,
          form.extraLink3,
          form.extraLink4,
          form.extraLink5,
        ]
          .map((url) => url.trim())
          .filter(Boolean)
          .map((url) => ({ label: "Лінк", url }));

        const relatedSlugs = form.relatedSlugsRaw
          .split(/[\s,]+/)
          .map((slug) => slug.trim())
          .filter(Boolean);

        const response = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: form.url,
            name: form.name,
            tagline: form.tagline,
            description:
              form.listingTier === "passport" ? form.description : undefined,
            categorySlug: form.categorySlug,
            platforms: form.platforms,
            pricingModel: form.pricingModel,
            hasUkrainianUi: form.hasUkrainianUi,
            cityLabel: form.cityLabel || undefined,
            ukraineNote: form.ukraineNote,
            ownerEmail: form.ownerEmail,
            ownerName: form.ownerName || undefined,
            seoTitle: form.seoTitle || undefined,
            seoDescription: form.seoDescription || undefined,
            faviconUrl: form.faviconUrl || undefined,
            ogImageUrl: form.ogImageUrl || undefined,
            domain: form.domain,
            listingTier: form.listingTier,
            extraLinks: form.listingTier === "passport" ? extraLinks : [],
            creatorName:
              form.listingTier === "passport" ? form.creatorName : undefined,
            creatorLinkedInUrl:
              form.listingTier === "passport"
                ? form.creatorLinkedInUrl
                : undefined,
            promoCode:
              form.listingTier === "passport" ? form.promoCode : undefined,
            promoUrl:
              form.listingTier === "passport" ? form.promoUrl : undefined,
            relatedSlugs:
              form.listingTier === "passport" ? relatedSlugs : [],
          }),
        });
        const data = (await response.json()) as {
          error?: string;
          submission?: { id: string };
        };
        if (!response.ok || !data.submission) {
          throw new Error(data.error ?? "Не вдалося зберегти заявку");
        }
        setSubmissionId(data.submission.id);
        trackEvent("submit_completed", { attribution: "submit" });
        setStep("done");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Помилка збереження");
      }
    });
  }

  return (
    <div className="space-y-8">
      <ol className="font-mono-meta flex flex-wrap gap-3 text-[10px] uppercase text-ink/45">
        <li className={step === "url" ? "text-ink" : undefined}>01 URL</li>
        <li className={step === "profile" ? "text-ink" : undefined}>
          02 Профіль
        </li>
        <li className={step === "done" ? "text-ink" : undefined}>03 Заявка</li>
      </ol>

      {error ? (
        <div
          className="rounded-card border border-danger/30 bg-peach/40 px-4 py-3 text-sm text-ink"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {step === "url" ? (
        <section className="space-y-6 rounded-card border border-line bg-surface p-6 shadow-soft">
          <FormField
            label="URL сайту, App Store або Google Play"
            htmlFor="url"
            hint="Реєстрація на цьому кроці не потрібна. Ми безпечно прочитаємо title, description і OG."
          >
            <Input
              id="url"
              name="url"
              type="url"
              inputMode="url"
              placeholder="https://example.com"
              value={form.url}
              onChange={(event) => update("url", event.target.value)}
              disabled={isPending}
              required
            />
          </FormField>
          <Button
            type="button"
            onClick={loadMetadata}
            loading={isPending}
            disabled={!form.url.trim()}
          >
            Прочитати метадані →
          </Button>
        </section>
      ) : null}

      {step === "profile" ? (
        <section className="space-y-8">
          {duplicateSlug ? (
            <div className="rounded-card border border-warning/40 bg-peach/30 px-4 py-3 text-sm">
              Схоже, домен уже є в каталозі:{" "}
              <Link className="underline" href={`/products/${duplicateSlug}`}>
                /products/{duplicateSlug}
              </Link>
              . Нову заявку з цим доменом зберегти не вдасться.
            </div>
          ) : null}

          <div className="space-y-3 rounded-card border border-line bg-surface p-5">
            <p className="text-sm font-medium text-ink">Тип картки</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => update("listingTier", "free")}
                className={`rounded-card border p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
                  form.listingTier === "free"
                    ? "border-ink bg-ink text-surface"
                    : "border-line bg-canvas text-ink hover:bg-copper-soft"
                }`}
              >
                <span className="block font-semibold">Безкоштовна</span>
                <span className="mt-1 block text-sm opacity-80">
                  Назва, лого, 1 лінк, платформи, опис до 120 символів, схожі
                  проєкти.
                </span>
                <span className="mt-2 block font-mono-meta text-[10px] uppercase">
                  0 грн
                </span>
              </button>
              <button
                type="button"
                onClick={() => update("listingTier", "passport")}
                className={`rounded-card border p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
                  form.listingTier === "passport"
                    ? "border-ink bg-ink text-surface"
                    : "border-line bg-canvas text-ink hover:bg-copper-soft"
                }`}
              >
                <span className="block font-semibold">Passport</span>
                <span className="mt-1 block text-sm opacity-80">
                  До 1000 символів, до 5 лінків, хто створив, промо, свої
                  пов’язані проєкти.
                </span>
                <span className="mt-2 block font-mono-meta text-[10px] uppercase">
                  {formatUah(PASSPORT_LISTING_PRICE_UAH)} разово
                </span>
              </button>
            </div>
            <p className="text-sm text-ink/55">
              Лінки завжди sponsored/nofollow. Passport не купує органічний
              рейтинг.
            </p>
          </div>

          <div className="grid gap-6 rounded-card border border-line bg-surface p-6 shadow-soft lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <FormField label="Назва" htmlFor="name">
                <Input
                  id="name"
                  value={form.name}
                  maxLength={80}
                  onChange={(event) => update("name", event.target.value)}
                />
              </FormField>
              <FormField
                label="Короткий опис"
                htmlFor="tagline"
                hint={`${form.tagline.length}/120`}
              >
                <Input
                  id="tagline"
                  value={form.tagline}
                  maxLength={120}
                  onChange={(event) => update("tagline", event.target.value)}
                />
              </FormField>
              {form.listingTier === "passport" ? (
                <FormField
                  label="Повний текст (Passport)"
                  htmlFor="description"
                  hint={`${form.description.length}/1000`}
                >
                  <Textarea
                    id="description"
                    value={form.description}
                    maxLength={1000}
                    onChange={(event) =>
                      update("description", event.target.value)
                    }
                  />
                </FormField>
              ) : null}
              <FormField label="Категорія" htmlFor="category">
                <Select
                  id="category"
                  value={form.categorySlug}
                  onChange={(event) => update("categorySlug", event.target.value)}
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.nameUk}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="space-y-4 rounded-card border border-line bg-canvas p-4">
              <p className="font-mono-meta text-[10px] uppercase text-ink/45">
                Превʼю публічної сторінки
              </p>
              <p className="text-sm text-ink/55">{form.domain || "домен"}</p>
              <h2 className="text-2xl font-semibold tracking-tight">
                {form.name || "Назва продукту"}
              </h2>
              <p className="text-ink/75">
                {form.tagline || "Короткий опис зʼявиться тут."}
              </p>
              <div className="border-t border-line pt-4 text-sm text-ink/60">
                <p>
                  <span className="font-mono-meta text-[10px] uppercase">
                    title
                  </span>
                  <br />
                  {publicTitle}
                </p>
                <p className="mt-3">
                  <span className="font-mono-meta text-[10px] uppercase">
                    description
                  </span>
                  <br />
                  {publicDescription || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 rounded-card border border-line bg-surface p-6 shadow-soft">
            <fieldset>
              <legend className="mb-3 text-sm font-medium">Платформи</legend>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_OPTIONS.map((platform) => {
                  const active = form.platforms.includes(platform.value);
                  return (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => togglePlatform(platform.value)}
                      className={`inline-flex min-h-11 items-center rounded-pill border px-3 text-sm ${
                        active
                          ? "border-ink bg-ink text-surface"
                          : "border-line bg-canvas text-ink hover:bg-copper-soft"
                      }`}
                      aria-pressed={active}
                    >
                      {platform.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Модель оплати" htmlFor="pricing">
                <Select
                  id="pricing"
                  value={form.pricingModel}
                  onChange={(event) =>
                    update("pricingModel", event.target.value as PricingModel)
                  }
                >
                  {PRICING_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Український інтерфейс" htmlFor="ukUi">
                <Select
                  id="ukUi"
                  value={form.hasUkrainianUi}
                  onChange={(event) =>
                    update(
                      "hasUkrainianUi",
                      event.target.value as FormState["hasUkrainianUi"],
                    )
                  }
                >
                  <option value="yes">Так</option>
                  <option value="no">Ні / частково</option>
                  <option value="unknown">Не вказано</option>
                </Select>
              </FormField>
            </div>

            <FormField label="Місто команди (опційно)" htmlFor="city">
              <Input
                id="city"
                value={form.cityLabel}
                onChange={(event) => update("cityLabel", event.target.value)}
                placeholder="Київ / Львів / українці за кордоном"
              />
            </FormField>

            <FormField
              label="Звʼязок з Україною"
              htmlFor="ukraineNote"
              hint="Обовʼязково для GEO і модерації: засновники, команда, Diia City тощо."
            >
              <Textarea
                id="ukraineNote"
                value={form.ukraineNote}
                maxLength={500}
                onChange={(event) => update("ukraineNote", event.target.value)}
              />
            </FormField>

            {form.listingTier === "passport" ? (
              <div className="space-y-5 rounded-card border border-line bg-canvas p-4">
                <p className="text-sm font-medium text-ink">
                  Passport · додаткові поля
                </p>
                <FormField label="Хто створив" htmlFor="creatorName">
                  <Input
                    id="creatorName"
                    value={form.creatorName}
                    maxLength={120}
                    onChange={(event) =>
                      update("creatorName", event.target.value)
                    }
                  />
                </FormField>
                <FormField label="LinkedIn (1 лінк)" htmlFor="creatorLinkedIn">
                  <Input
                    id="creatorLinkedIn"
                    type="url"
                    value={form.creatorLinkedInUrl}
                    onChange={(event) =>
                      update("creatorLinkedInUrl", event.target.value)
                    }
                    placeholder="https://linkedin.com/in/…"
                  />
                </FormField>
                <FormField label="Промокод" htmlFor="promoCode">
                  <Input
                    id="promoCode"
                    value={form.promoCode}
                    maxLength={40}
                    onChange={(event) => update("promoCode", event.target.value)}
                  />
                </FormField>
                <FormField label="Акційний лінк" htmlFor="promoUrl">
                  <Input
                    id="promoUrl"
                    type="url"
                    value={form.promoUrl}
                    onChange={(event) => update("promoUrl", event.target.value)}
                  />
                </FormField>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      "extraLink1",
                      "extraLink2",
                      "extraLink3",
                      "extraLink4",
                      "extraLink5",
                    ] as const
                  ).map((key, index) => (
                    <FormField
                      key={key}
                      label={`Додатковий лінк ${index + 1}`}
                      htmlFor={key}
                    >
                      <Input
                        id={key}
                        type="url"
                        value={form[key]}
                        onChange={(event) => update(key, event.target.value)}
                      />
                    </FormField>
                  ))}
                </div>
                <FormField
                  label="Пов’язані продукти (slug через кому)"
                  htmlFor="relatedSlugs"
                  hint="Спочатку покажемо їх, нижче — автосхожі. Приклад: serpstat, se-ranking"
                >
                  <Input
                    id="relatedSlugs"
                    value={form.relatedSlugsRaw}
                    onChange={(event) =>
                      update("relatedSlugsRaw", event.target.value)
                    }
                  />
                </FormField>
              </div>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Email власника" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.ownerEmail}
                  onChange={(event) => update("ownerEmail", event.target.value)}
                />
              </FormField>
              <FormField label="Імʼя (опційно)" htmlFor="ownerName">
                <Input
                  id="ownerName"
                  value={form.ownerName}
                  onChange={(event) => update("ownerName", event.target.value)}
                />
              </FormField>
            </div>

            <details className="rounded-card border border-line bg-canvas p-4">
              <summary className="cursor-pointer text-sm font-medium">
                SEO override (опційно)
              </summary>
              <div className="mt-4 space-y-4">
                <FormField label="seoTitle" htmlFor="seoTitle">
                  <Input
                    id="seoTitle"
                    maxLength={160}
                    value={form.seoTitle}
                    onChange={(event) => update("seoTitle", event.target.value)}
                  />
                </FormField>
                <FormField label="seoDescription" htmlFor="seoDescription">
                  <Textarea
                    id="seoDescription"
                    maxLength={320}
                    value={form.seoDescription}
                    onChange={(event) =>
                      update("seoDescription", event.target.value)
                    }
                  />
                </FormField>
              </div>
            </details>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep("url")}
                disabled={isPending}
              >
                Назад
              </Button>
              <Button
                type="button"
                onClick={submitProfile}
                loading={isPending}
                disabled={Boolean(duplicateSlug)}
              >
                Зберегти заявку
              </Button>
            </div>
            <p className="text-sm text-ink/60">
              {form.listingTier === "passport"
                ? `Passport — ${formatUah(PASSPORT_LISTING_PRICE_UAH)} разово, далі модерація.`
                : "Безкоштовна картка — після заявки модерація без оплати."}{" "}
              Спонсорські місця окремо: /pricing.
            </p>
          </div>
        </section>
      ) : null}

      {step === "done" ? (
        <section className="rounded-card border border-line bg-mint/40 p-6 shadow-soft">
          <h2 className="text-2xl font-semibold tracking-tight">Заявку збережено</h2>
          <p className="mt-3 text-ink/75">
            ID: <span className="font-mono-meta text-xs">{submissionId}</span>
          </p>
          <p className="mt-3 text-ink/75">
            {form.listingTier === "passport"
              ? `Далі — оплата Passport ${formatUah(PASSPORT_LISTING_PRICE_UAH)}, потім модерація.`
              : "База безкоштовна. Підтвердіть заявку — вона потрапить у чергу модерації."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {submissionId ? (
              <Link
                href={`/submit/pay/${submissionId}`}
                className="inline-flex min-h-11 items-center justify-center rounded-pill bg-copper px-5 text-sm font-medium text-surface hover:bg-copper-dark"
              >
                {form.listingTier === "passport"
                  ? "Оплатити Passport"
                  : "До модерації"}
              </Link>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setForm(initialState);
                setSubmissionId(null);
                setStep("url");
              }}
            >
              Додати ще один
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
