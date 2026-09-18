/** Approved analytics vocabulary — do not invent event name variants. */
export const ANALYTICS_EVENTS = [
  "search_submitted",
  "filter_applied",
  "product_impression",
  "product_opened",
  "outbound_clicked",
  "submit_started",
  "metadata_loaded",
  "submit_completed",
  "payment_started",
  "payment_succeeded",
  "moderation_approved",
  "vote_started",
  "vote_cast",
  "placement_viewed",
  "placement_clicked",
  "badge_copied",
  "share_card_downloaded",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsPayload = {
  productId?: string;
  productSlug?: string;
  category?: string | null;
  platform?: string | null;
  q?: string | null;
  surface?: string | null;
  attribution?: string | null;
  launchId?: string | null;
  placementSurface?: string | null;
};

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return (ANALYTICS_EVENTS as readonly string[]).includes(value);
}
