import type {
  AnalyticsEventName,
  AnalyticsPayload,
} from "@/lib/analytics/events";

type PostHogLike = {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify?: (id: string, props?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    __dodaiPosthog?: PostHogLike;
  }
}

function sanitizePayload(
  payload?: AnalyticsPayload,
): Record<string, unknown> | undefined {
  if (!payload) return undefined;
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    // Never send free-text emails, comments, or private user copy.
    if (typeof value === "string" && value.includes("@")) continue;
    clean[key] = value;
  }
  return Object.keys(clean).length ? clean : undefined;
}

/** Client-side capture. No-ops when PostHog key is absent. */
export function trackEvent(
  event: AnalyticsEventName,
  payload?: AnalyticsPayload,
): void {
  if (typeof window === "undefined") return;

  const properties = sanitizePayload(payload);

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", event, properties ?? {});
  }

  const ph = window.__dodaiPosthog;
  if (!ph) return;
  ph.capture(event, properties);
}

export function getPostHogKey(): string | undefined {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY || undefined;
}

export function getPostHogHost(): string {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com"
  );
}
