import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog/queries";
import {
  assertSafeRedirectHost,
  collectAllowedDomains,
  isDestinationAllowed,
} from "@/lib/redirect/allowlist";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ to?: string; surface?: string }>;
};

export const metadata: Metadata = {
  title: "Перехід",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function OutboundRedirectPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const product = await getProductBySlug(id);
  if (!product) notFound();

  const destination = query.to?.trim() || product.website;
  const allowedDomains = collectAllowedDomains({
    website: product.website,
    domain: product.domain,
    sameAs: product.sameAs,
  });

  const check = isDestinationAllowed(destination, allowedDomains);
  if (!check.ok) {
    notFound();
  }

  const hostSafe = await assertSafeRedirectHost(check.url.hostname);
  if (!hostSafe.ok) {
    notFound();
  }

  // Server log stands in for outbound_clicked when PostHog key is absent.
  console.info("outbound_clicked", {
    productId: product.id,
    productSlug: product.slug,
    surface: query.surface ?? "product_page",
    domain: check.domain,
  });

  redirect(check.url.toString());
}
