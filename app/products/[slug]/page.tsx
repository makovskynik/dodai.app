import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductFacts } from "@/components/domain/ProductFacts";
import { ProductLogo } from "@/components/domain/ProductLogo";
import { RelatedProducts } from "@/components/domain/RelatedProducts";
import { VoteControl } from "@/components/domain/VoteControl";
import { TrackOnMount } from "@/components/analytics/TrackOnMount";
import { Badge, PlacementBadge, ProductDayBadge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ProductJsonLd } from "@/components/seo/JsonLd";
import { ClaimForm } from "@/features/claim/ClaimForm";
import {
  findSimilarProducts,
  resolveRelatedProducts,
} from "@/lib/catalog/related";
import { getCatalog, getProductBySlug } from "@/lib/catalog/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getTurnstileSiteKey } from "@/lib/security/turnstile";
import { readVoterKeyFromCookie } from "@/lib/votes/anonymous";
import { readSessionUser } from "@/server/auth/session";
import { getLaunchVoteState } from "@/server/votes/service";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const catalog = await getCatalog({});
  return [...catalog.organic, ...catalog.promoted].map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Продукт" };

  return buildPageMetadata({
    title: product.seoTitle ?? `${product.name} — ${product.categoryName}`,
    description: product.seoDescription ?? product.tagline,
    path: `/products/${product.slug}`,
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const catalog = await getCatalog({});
  const allProducts = [...catalog.organic, ...catalog.promoted];
  const curated = resolveRelatedProducts(product, allProducts);
  const similar = findSimilarProducts(product, allProducts);
  const isPassport = product.listingTier === "passport";

  const user = await readSessionUser();
  const anonKey = await readVoterKeyFromCookie();
  const voterKey = user?.email ?? anonKey;
  let voteState: {
    launchId: string;
    voteCount: number;
    hasVoted: boolean;
  } | null = null;

  if (product.activeLaunchId) {
    try {
      const state = await getLaunchVoteState(product.activeLaunchId, voterKey);
      voteState = {
        launchId: state.launch.id,
        voteCount: state.voteCount,
        hasVoted: state.hasVoted,
      };
    } catch {
      voteState = {
        launchId: product.activeLaunchId,
        voteCount: product.voteCount ?? 0,
        hasVoted: false,
      };
    }
  }

  return (
    <div className="mx-auto max-w-[880px] px-4 py-12 sm:px-6 lg:px-8">
      <ProductJsonLd product={product} />
      <TrackOnMount
        event="product_opened"
        payload={{
          productId: product.id,
          productSlug: product.slug,
          attribution: "product_page",
        }}
      />

      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="font-mono-meta flex flex-wrap gap-2 text-[10px] uppercase text-ink/50">
          <li>
            <Link href="/" className="hover:text-ink">
              Головна
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/products" className="hover:text-ink">
              Каталог
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/categories/${product.categorySlug}`}
              className="hover:text-ink"
            >
              {product.categoryName}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink/70">{product.name}</li>
        </ol>
      </nav>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <ProductLogo
          name={product.name}
          initials={product.initials}
          logoUrl={product.logoUrl}
          surface={product.surface}
          size="lg"
        />
        {product.badge === "product-of-the-day" ? <ProductDayBadge /> : null}
        {product.badge === "promoted" ? <PlacementBadge /> : null}
        {isPassport ? <Badge tone="editorial">Passport</Badge> : null}
        {product.sourceType === "editorial" ? (
          <Badge>Додано редакцією</Badge>
        ) : null}
        <Badge>{product.categoryName}</Badge>
        {product.platforms.map((platform) => (
          <Badge key={platform}>{platform}</Badge>
        ))}
        {voteState ? (
          <VoteControl
            launchId={voteState.launchId}
            voteCount={voteState.voteCount}
            hasVoted={voteState.hasVoted}
            turnstileSiteKey={getTurnstileSiteKey() ?? null}
          />
        ) : null}
      </div>

      <h1 className="text-4xl font-semibold tracking-tight text-ink">
        {product.name}
      </h1>
      <p className="mt-4 text-lg text-ink/75">{product.tagline}</p>

      {isPassport && product.description ? (
        <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-ink/70">
          {product.description}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton
          href={`/go/${product.slug}?surface=product_page`}
          rel="sponsored nofollow noopener"
        >
          Відкрити сайт ↗
        </LinkButton>
        <LinkButton href="/products" variant="secondary">
          Назад до каталогу
        </LinkButton>
      </div>

      {isPassport && product.extraLinks.length > 0 ? (
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Додаткові лінки">
          {product.extraLinks.slice(0, 5).map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                rel="sponsored nofollow noopener"
                target="_blank"
                className="inline-flex min-h-10 items-center rounded-pill border border-line bg-surface px-3 text-sm text-copper-dark hover:bg-copper-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
              >
                {link.label || "Лінк"} ↗
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {isPassport && (product.creatorName || product.creatorLinkedInUrl) ? (
        <div className="mt-8 rounded-card border border-line bg-surface p-5">
          <p className="font-mono-meta text-[10px] uppercase text-ink/45">
            Хто створив
          </p>
          <p className="mt-2 font-medium text-ink">
            {product.creatorName || "Команда продукту"}
          </p>
          {product.creatorLinkedInUrl ? (
            <a
              href={product.creatorLinkedInUrl}
              rel="sponsored nofollow noopener"
              target="_blank"
              className="mt-2 inline-flex min-h-10 items-center text-sm text-copper-dark underline-offset-2 hover:underline"
            >
              LinkedIn ↗
            </a>
          ) : null}
        </div>
      ) : null}

      {isPassport && (product.promoCode || product.promoUrl) ? (
        <div className="mt-6 rounded-card border border-peach bg-peach/40 p-5">
          <p className="font-mono-meta text-[10px] uppercase text-ink/45">
            Промо від продукту
          </p>
          {product.promoCode ? (
            <p className="mt-2 text-lg font-semibold tabular-nums text-ink">
              {product.promoCode}
            </p>
          ) : null}
          {product.promoUrl ? (
            <a
              href={product.promoUrl}
              rel="sponsored nofollow noopener"
              target="_blank"
              className="mt-2 inline-flex min-h-10 items-center text-sm text-copper-dark underline-offset-2 hover:underline"
            >
              Акційна пропозиція ↗
            </a>
          ) : null}
        </div>
      ) : null}

      <ProductFacts product={product} />

      <RelatedProducts
        curated={curated}
        similar={similar}
        showCuratedFirst={isPassport}
      />

      {product.claimable ? (
        <div className="mt-8">
          <ClaimForm productSlug={product.slug} productName={product.name} />
        </div>
      ) : product.lastVerifiedAt ? (
        <p className="mt-8 rounded-card border border-line bg-surface px-4 py-3 text-sm text-ink/75">
          Остання редакційна перевірка фактів:{" "}
          <time dateTime={product.lastVerifiedAt}>
            {new Intl.DateTimeFormat("uk-UA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }).format(new Date(product.lastVerifiedAt))}
          </time>
          .
        </p>
      ) : null}
    </div>
  );
}
