"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/Button";
import type { ListingTier } from "@/lib/catalog/listing-tier";

type PayClientProps = {
  submissionId: string;
  name: string;
  status: string;
  alreadyPaid: boolean;
  listingTier: ListingTier;
  amountLabel: string;
  amountUah: number;
};

export function SubmitPayClient({
  submissionId,
  name,
  status,
  alreadyPaid,
  listingTier,
  amountLabel,
  amountUah,
}: PayClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (alreadyPaid) router.refresh();
  }, [alreadyPaid, router]);

  function confirm() {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      const data = (await response.json()) as {
        error?: string;
        checkoutUrl?: string;
      };
      if (!response.ok || !data.checkoutUrl) {
        setError(data.error ?? "Не вдалося підтвердити заявку");
        return;
      }
      window.location.href = data.checkoutUrl;
    });
  }

  if (status === "moderation" || status === "paid" || alreadyPaid) {
    return (
      <div className="rounded-card border border-line bg-mint/40 p-6">
        <h2 className="text-2xl font-semibold">У черзі модерації</h2>
        <p className="mt-3 text-ink/75">
          Заявка <strong>{name}</strong> очікує перевірки. Після approve зʼявиться
          в каталозі.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton href="/account">До кабінету</LinkButton>
          <LinkButton href="/login" variant="secondary">
            Увійти
          </LinkButton>
        </div>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div className="rounded-card border border-line bg-mint/40 p-6">
        <h2 className="text-2xl font-semibold">Опубліковано</h2>
        <p className="mt-3 text-ink/75">Продукт уже в каталозі.</p>
        <div className="mt-6">
          <LinkButton href="/products">До каталогу</LinkButton>
        </div>
      </div>
    );
  }

  const isPassport = listingTier === "passport" && amountUah > 0;

  return (
    <div className="rounded-card border border-line bg-surface p-6 shadow-soft">
      <h2 className="text-2xl font-semibold">
        {isPassport ? "Оплата Passport" : "Підтвердити заявку"}
      </h2>
      <p className="mt-3 text-ink/75">
        <strong>{name}</strong> —{" "}
        {isPassport
          ? `повна картка Passport · ${amountLabel} разово.`
          : "безкоштовна картка · 0 грн."}{" "}
        Далі — модерація. Спонсорські місця окремо на /pricing.
      </p>
      {error ? (
        <p className="mt-4 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-6">
        <Button type="button" onClick={confirm} loading={isPending}>
          {isPassport ? "Перейти до оплати" : "Надіслати на модерацію"}
        </Button>
      </div>
    </div>
  );
}
