import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubmitPayClient } from "@/features/payments/SubmitPayClient";
import { listingTierPriceUah, formatUah } from "@/lib/pricing/catalog";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getSubmission } from "@/server/submissions/store";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Підтвердження заявки",
  path: "/submit/pay",
  noIndex: true,
  description: "Безкоштовна картка або Passport 300 грн на dodai.app",
});

export default async function SubmitPayPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const submission = await getSubmission(id);
  if (!submission) notFound();

  const alreadyPaid = query.paid === "1" || query.free === "1";
  const tier = submission.listingTier ?? "free";
  const amountUah = listingTierPriceUah(tier);

  return (
    <div className="mx-auto max-w-[720px] px-4 py-12 sm:px-6 lg:px-8">
      <p className="font-mono-meta mb-3 text-[10px] uppercase text-ink/50">
        /submit/pay/{id}
      </p>
      <SubmitPayClient
        submissionId={submission.id}
        name={submission.name}
        status={submission.status}
        alreadyPaid={alreadyPaid}
        listingTier={tier}
        amountLabel={formatUah(amountUah)}
        amountUah={amountUah}
      />
    </div>
  );
}
