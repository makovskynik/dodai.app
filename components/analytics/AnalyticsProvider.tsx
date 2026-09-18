"use client";

import { useEffect } from "react";
import {
  getPostHogHost,
  getPostHogKey,
} from "@/lib/analytics/client";

/**
 * Loads PostHog only when NEXT_PUBLIC_POSTHOG_KEY is set.
 * Keeps the client bundle free of the SDK until configured.
 */
export function AnalyticsProvider() {
  useEffect(() => {
    const key = getPostHogKey();
    if (!key) return;
    if (window.__dodaiPosthog) return;

    let cancelled = false;

    async function load() {
      try {
        const posthog = (await import("posthog-js")).default;
        if (cancelled) return;
        posthog.init(key!, {
          api_host: getPostHogHost(),
          capture_pageview: true,
          capture_pageleave: true,
          persistence: "localStorage+cookie",
          person_profiles: "identified_only",
        });
        window.__dodaiPosthog = posthog;
      } catch (error) {
        console.warn("[analytics] PostHog failed to load", error);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
