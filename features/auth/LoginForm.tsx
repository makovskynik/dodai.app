"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/FormField";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setPreviewUrl(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as {
        error?: string;
        message?: string;
        previewUrl?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Помилка");
        return;
      }
      setMessage(data.message ?? "Перевірте пошту");
      if (data.previewUrl) setPreviewUrl(data.previewUrl);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-card border border-line bg-surface p-6 shadow-soft">
      <FormField
        label="Email"
        htmlFor="email"
        hint="Надішлемо magic link. Без пароля."
      >
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
        />
      </FormField>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-sm text-ink/70">{message}</p> : null}
      {previewUrl ? (
        <p className="rounded-card border border-line bg-mint/40 px-3 py-2 text-sm">
          Dev preview:{" "}
          <button
            type="button"
            className="underline"
            onClick={() => router.push(previewUrl.replace(/^https?:\/\/[^/]+/, ""))}
          >
            відкрити magic link
          </button>
        </p>
      ) : null}

      <Button type="submit" loading={isPending}>
        Надіслати посилання
      </Button>
    </form>
  );
}
