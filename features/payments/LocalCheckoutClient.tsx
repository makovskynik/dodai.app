"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";

export function LocalCheckoutClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const paymentId = params.get("paymentId");
  const referenceId = params.get("referenceId");
  const amount = params.get("amount") ?? "100";
  const idempotencyKey = params.get("idempotencyKey") ?? undefined;

  function simulatePaid() {
    if (!paymentId || !referenceId) {
      setError("Немає параметрів платежу");
      return;
    }
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/payments/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerPaymentId: paymentId,
          referenceId,
          amountUah: Number(amount),
          idempotencyKey,
          status: "paid",
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Webhook failed");
        return;
      }
      router.push(`/submit/pay/${referenceId}?paid=1`);
    });
  }

  return (
    <div className="mx-auto max-w-[520px] px-4 py-16">
      <p className="font-mono-meta mb-3 text-[10px] uppercase text-ink/50">
        local payment provider
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Тестова оплата</h1>
      <p className="mt-3 text-ink/70">
        Сума: <strong>{amount} грн</strong>. Це mock-провайдер для розробки без
        Monobank / WayForPay ключів.
      </p>
      {error ? (
        <p className="mt-4 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-8">
        <Button type="button" onClick={simulatePaid} loading={isPending}>
          Симулювати успішну оплату
        </Button>
      </div>
    </div>
  );
}
