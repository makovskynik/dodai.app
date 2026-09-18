"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import type { StoredSubmission } from "@/server/submissions/store";

type AdminModerationQueueProps = {
  items: StoredSubmission[];
};

export function AdminModerationQueue({ items }: AdminModerationQueueProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function act(submissionId: string, action: "approve" | "reject") {
    setError(null);
    const reason =
      action === "reject"
        ? window.prompt("Причина відхилення") ?? ""
        : undefined;
    if (action === "reject" && !(reason ?? "").trim()) return;

    startTransition(async () => {
      const response = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, action, reason }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Помилка");
        return;
      }
      router.refresh();
    });
  }

  if (!items.length) {
    return (
      <p className="rounded-card border border-line bg-surface p-6 text-ink/65">
        Черга модерації порожня.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-card border border-line bg-surface p-5 shadow-soft"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-ink/75">{item.tagline}</p>
              <p className="text-sm text-ink/60">{item.ukraineNote}</p>
              <p className="font-mono-meta text-[10px] uppercase text-ink/45">
                {item.domain} · {item.platforms.join(", ")} · {item.categorySlug}{" "}
                · {item.ownerEmail}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                loading={isPending}
                onClick={() => act(item.id, "approve")}
              >
                Схвалити
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                loading={isPending}
                onClick={() => act(item.id, "reject")}
              >
                Відхилити
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
