"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/client";
import type { AnalyticsEventName, AnalyticsPayload } from "@/lib/analytics/events";

type TrackOnMountProps = {
  event: AnalyticsEventName;
  payload?: AnalyticsPayload;
};

export function TrackOnMount({ event, payload }: TrackOnMountProps) {
  useEffect(() => {
    trackEvent(event, payload);
    // Intentional once-per-mount for impression/open events.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
