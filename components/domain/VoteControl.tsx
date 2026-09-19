"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { TurnstileWidget } from "@/components/domain/TurnstileWidget";
import { trackEvent } from "@/lib/analytics/client";

type VoteControlProps = {
  launchId: string;
  voteCount: number;
  hasVoted: boolean;
  /** When set, Cloudflare Turnstile is shown before first vote. */
  turnstileSiteKey?: string | null;
  /** Catalog density: ↑ N only; full label stays in aria-label. */
  compact?: boolean;
};

export function VoteControl({
  launchId,
  voteCount: initialCount,
  hasVoted: initialVoted,
  turnstileSiteKey = null,
  compact = false,
}: VoteControlProps) {
  const router = useRouter();
  const [voteCount, setVoteCount] = useState(initialCount);
  const [hasVoted, setHasVoted] = useState(initialVoted);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onToken = useCallback((token: string) => {
    setCaptchaToken(token);
    setError(null);
  }, []);

  const onExpire = useCallback(() => {
    setCaptchaToken(null);
  }, []);

  function submitVote(token: string | null) {
    setError(null);
    trackEvent("vote_started", { launchId });

    startTransition(async () => {
      try {
        const response = await fetch("/api/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            launchId,
            turnstileToken: token ?? undefined,
          }),
        });
        const data = (await response.json()) as {
          error?: string;
          voteCount?: number;
          hasVoted?: boolean;
          captchaRequired?: boolean;
        };
        if (!response.ok) {
          if (data.captchaRequired) {
            setShowCaptcha(true);
          }
          setError(data.error ?? "Не вдалося проголосувати");
          return;
        }
        setVoteCount(data.voteCount ?? voteCount + 1);
        setHasVoted(true);
        setShowCaptcha(false);
        trackEvent("vote_cast", { launchId, productSlug: undefined });
        router.refresh();
      } catch {
        setError("Мережева помилка. Спробуйте ще раз.");
      }
    });
  }

  function onVote() {
    if (hasVoted || isPending) return;
    if (turnstileSiteKey && !captchaToken) {
      setShowCaptcha(true);
      setError(null);
      return;
    }
    submitVote(captchaToken);
  }

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={onVote}
        disabled={isPending || hasVoted}
        aria-pressed={hasVoted}
        aria-label={
          hasVoted
            ? `Ви вже проголосували. Зараз ${voteCount} голосів`
            : `Проголосувати. Зараз ${voteCount} голосів`
        }
        className={`relative z-20 inline-flex min-h-11 items-center gap-1.5 rounded-pill border px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper disabled:cursor-not-allowed ${
          hasVoted
            ? "border-mint bg-mint/50 text-ink"
            : "border-line bg-surface text-ink hover:bg-copper-soft active:bg-copper-soft disabled:opacity-60"
        }`}
      >
        <span aria-hidden="true">↑</span>
        <b className="font-semibold tabular-nums">{voteCount}</b>
        {compact ? null : (
          <span className="font-mono-meta text-[10px] uppercase tracking-[0.04em] text-ink/55">
            {hasVoted ? "Ваш голос" : isPending ? "…" : "Голос"}
          </span>
        )}
      </button>
      {showCaptcha && turnstileSiteKey && !hasVoted ? (
        <div className="relative z-20 space-y-2">
          <TurnstileWidget
            siteKey={turnstileSiteKey}
            onToken={(token) => {
              onToken(token);
              submitVote(token);
            }}
            onExpire={onExpire}
          />
          <p className="font-mono-meta text-[10px] uppercase text-ink/45">
            Підтвердіть, що ви не бот
          </p>
        </div>
      ) : null}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
