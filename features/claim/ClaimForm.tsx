"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/FormField";

type ClaimFormProps = {
  productSlug: string;
  productName: string;
};

export function ClaimForm({ productSlug, productName }: ClaimFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug, email, note }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Не вдалося надіслати заявку");
        return;
      }
      setDone(true);
      router.refresh();
    });
  }

  if (done) {
    return (
      <p className="rounded-card border border-line bg-mint/50 px-4 py-3 text-sm text-ink/80">
        Заявку на claim «{productName}» прийнято. Редакція перевірить звʼязок з
        продуктом і дату верифікації.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-card border border-line bg-surface p-5 shadow-soft"
    >
      <h2 className="text-lg font-semibold">Claim картки</h2>
      <p className="text-sm text-ink/70">
        Картку додано редакцією. Підтвердіть, що ви власник або представник
        команди — після перевірки зʼявиться дата верифікації.
      </p>
      <FormField label="Email власника" htmlFor="claim-email">
        <Input
          id="claim-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
        />
      </FormField>
      <FormField
        label="Коротко про звʼязок з продуктом"
        htmlFor="claim-note"
        hint="Не обовʼязково. Без приватних коментарів у аналітику."
      >
        <Textarea
          id="claim-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          maxLength={500}
        />
      </FormField>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" loading={isPending}>
        Надіслати claim
      </Button>
    </form>
  );
}
