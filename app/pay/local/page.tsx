import type { Metadata } from "next";
import { Suspense } from "react";
import { LocalCheckoutClient } from "@/features/payments/LocalCheckoutClient";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Тестова оплата",
  path: "/pay/local",
  noIndex: true,
  description: "Локальний mock-провайдер оплати dodai.app",
});

export default function LocalPayPage() {
  return (
    <Suspense fallback={<div className="p-8">Завантаження…</div>}>
      <LocalCheckoutClient />
    </Suspense>
  );
}
