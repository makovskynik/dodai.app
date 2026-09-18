export type LaunchStatus = "scheduled" | "open" | "closed";
export type AwardSource = "editorial" | "votes";
/** DB/enum key kept for schema stability; product surface is «Продукт тижня». */
export type AwardType = "product_of_the_day";

export type LaunchRecord = {
  id: string;
  productId: string;
  productSlug: string;
  startsAt: string;
  endsAt: string;
  status: LaunchStatus;
  voteCount: number;
};

export type VoteRecord = {
  id: string;
  launchId: string;
  productId: string;
  productSlug: string;
  voterEmail: string;
  createdAt: string;
};

export type AwardRecord = {
  id: string;
  productId: string;
  productSlug: string;
  awardType: AwardType;
  /** Monday of the award week in Europe/Kyiv, YYYY-MM-DD. */
  awardDate: string;
  source: AwardSource;
  launchId: string | null;
  createdAt: string;
};

export type CastVoteInput = {
  launchId: string;
  voterEmail: string;
  now?: Date;
};

/** Kyiv calendar day YYYY-MM-DD. */
export function kyivCalendarDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Monday (ISO week start) for the Kyiv calendar week containing `now`.
 * Stored as awards.award_date for weekly «Продукт тижня».
 */
export function awardWeekStartKyiv(now: Date = new Date()): string {
  const dayStr = kyivCalendarDate(now);
  const [year, month, day] = dayStr.split("-").map(Number);
  const noonUtc = Date.UTC(year, month - 1, day, 12, 0, 0);
  const weekday = new Date(noonUtc).getUTCDay(); // 0 Sun … 6 Sat
  const daysFromMonday = (weekday + 6) % 7;
  const monday = new Date(noonUtc - daysFromMonday * 86_400_000);
  const y = monday.getUTCFullYear();
  const m = String(monday.getUTCMonth() + 1).padStart(2, "0");
  const d = String(monday.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** @deprecated Use awardWeekStartKyiv — awards are weekly. */
export function awardDateKyiv(now: Date = new Date()): string {
  return awardWeekStartKyiv(now);
}

export function normalizeVoterEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Email or anonymous key (`anon:<uuid>`). */
export function normalizeVoterKey(key: string): string {
  const trimmed = key.trim().toLowerCase();
  if (trimmed.startsWith("anon:")) return trimmed;
  return normalizeVoterEmail(trimmed);
}

export function isValidVoterKey(key: string): boolean {
  const normalized = normalizeVoterKey(key);
  if (normalized.startsWith("anon:") && normalized.length > 10) return true;
  return normalized.includes("@") && normalized.length >= 5;
}

export function isLaunchOpen(
  launch: Pick<LaunchRecord, "status" | "startsAt" | "endsAt">,
  now: Date = new Date(),
): boolean {
  if (launch.status !== "open") return false;
  const startsAt = new Date(launch.startsAt);
  const endsAt = new Date(launch.endsAt);
  return startsAt <= now && now < endsAt;
}

export function canCastVote(
  launch: LaunchRecord,
  existingVotes: VoteRecord[],
  voterKey: string,
  now: Date = new Date(),
): { ok: true } | { ok: false; reason: string } {
  if (!isLaunchOpen(launch, now)) {
    return { ok: false, reason: "Голосування закрите" };
  }
  const key = normalizeVoterKey(voterKey);
  if (!isValidVoterKey(key)) {
    return { ok: false, reason: "Некоректний ідентифікатор голосу" };
  }
  const already = existingVotes.some(
    (vote) =>
      vote.launchId === launch.id &&
      normalizeVoterKey(vote.voterEmail) === key,
  );
  if (already) {
    return { ok: false, reason: "Ви вже голосували в цьому запуску" };
  }
  return { ok: true };
}

/**
 * Product of the Week from votes is gated: threshold to switch from editorial remains open.
 * This helper only picks a winner when explicitly requested.
 */
export function pickLaunchWinner(
  launches: LaunchRecord[],
): LaunchRecord | undefined {
  const openOrClosed = launches.filter(
    (launch) => launch.status === "open" || launch.status === "closed",
  );
  if (!openOrClosed.length) return undefined;
  return [...openOrClosed].sort((a, b) => {
    if (b.voteCount !== a.voteCount) return b.voteCount - a.voteCount;
    return a.productSlug.localeCompare(b.productSlug, "uk");
  })[0];
}
