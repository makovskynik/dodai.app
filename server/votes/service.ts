import { and, count, eq, sql } from "drizzle-orm";
import { createDb } from "@/server/db/client";
import { awards, launches, products, votes } from "@/server/db/schema";
import { hasDatabase } from "@/lib/env";
import {
  awardDateKyiv,
  canCastVote,
  normalizeVoterKey,
  type AwardRecord,
  type LaunchRecord,
  type VoteRecord,
} from "@/lib/votes/rules";
import {
  addLocalVote,
  getLocalAwards,
  getLocalLaunches,
  getLocalVotes,
} from "@/lib/votes/local-store";

export class VoteError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "VoteError";
    this.status = status;
  }
}

async function loadDbLaunches(): Promise<LaunchRecord[]> {
  const db = createDb();
  const rows = await db
    .select({
      id: launches.id,
      productId: launches.productId,
      productSlug: products.slug,
      startsAt: launches.startsAt,
      endsAt: launches.endsAt,
      status: launches.status,
      voteCount: sql<number>`coalesce(count(${votes.id}), 0)`.mapWith(Number),
    })
    .from(launches)
    .innerJoin(products, eq(launches.productId, products.id))
    .leftJoin(votes, eq(votes.launchId, launches.id))
    .groupBy(
      launches.id,
      launches.productId,
      products.slug,
      launches.startsAt,
      launches.endsAt,
      launches.status,
    );

  return rows.map((row) => ({
    id: row.id,
    productId: row.productId,
    productSlug: row.productSlug,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    status: row.status,
    voteCount: row.voteCount,
  }));
}

async function loadDbVotesForLaunch(launchId: string): Promise<VoteRecord[]> {
  const db = createDb();
  const rows = await db
    .select({
      id: votes.id,
      launchId: votes.launchId,
      productId: votes.productId,
      productSlug: products.slug,
      voterEmail: votes.voterEmail,
      createdAt: votes.createdAt,
    })
    .from(votes)
    .innerJoin(products, eq(votes.productId, products.id))
    .where(eq(votes.launchId, launchId));

  return rows.map((row) => ({
    id: row.id,
    launchId: row.launchId,
    productId: row.productId,
    productSlug: row.productSlug,
    voterEmail: row.voterEmail,
    createdAt: row.createdAt.toISOString(),
  }));
}

async function loadDbAwards(): Promise<AwardRecord[]> {
  const db = createDb();
  const rows = await db
    .select({
      id: awards.id,
      productId: awards.productId,
      productSlug: products.slug,
      awardType: awards.awardType,
      awardDate: awards.awardDate,
      source: awards.source,
      launchId: awards.launchId,
      createdAt: awards.createdAt,
    })
    .from(awards)
    .innerJoin(products, eq(awards.productId, products.id));

  return rows.map((row) => ({
    id: row.id,
    productId: row.productId,
    productSlug: row.productSlug,
    awardType: row.awardType,
    awardDate: row.awardDate,
    source: row.source,
    launchId: row.launchId,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function listLaunches(): Promise<LaunchRecord[]> {
  if (!hasDatabase()) return getLocalLaunches();
  try {
    return await loadDbLaunches();
  } catch (error) {
    console.error("Launches query failed, using local", error);
    return getLocalLaunches();
  }
}

export async function listAwards(): Promise<AwardRecord[]> {
  if (!hasDatabase()) return getLocalAwards();
  try {
    return await loadDbAwards();
  } catch (error) {
    console.error("Awards query failed, using local", error);
    return getLocalAwards();
  }
}

export async function getOpenLaunchForProductSlug(
  productSlug: string,
): Promise<LaunchRecord | undefined> {
  const all = await listLaunches();
  return all.find(
    (launch) => launch.productSlug === productSlug && launch.status === "open",
  );
}

export async function getLaunchVoteState(
  launchId: string,
  voterKey: string | null,
): Promise<{ launch: LaunchRecord; hasVoted: boolean; voteCount: number }> {
  const all = await listLaunches();
  const launch = all.find((item) => item.id === launchId);
  if (!launch) throw new VoteError("Запуск не знайдено", 404);

  let votesForLaunch: VoteRecord[];
  if (!hasDatabase()) {
    votesForLaunch = getLocalVotes().filter((vote) => vote.launchId === launchId);
  } else {
    try {
      votesForLaunch = await loadDbVotesForLaunch(launchId);
    } catch {
      votesForLaunch = getLocalVotes().filter(
        (vote) => vote.launchId === launchId,
      );
    }
  }

  const key = voterKey ? normalizeVoterKey(voterKey) : "";
  const hasVoted = Boolean(
    key &&
      votesForLaunch.some(
        (vote) => normalizeVoterKey(vote.voterEmail) === key,
      ),
  );

  return {
    launch,
    hasVoted,
    voteCount: launch.voteCount,
  };
}

const recentVotesByKey = new Map<string, number[]>();

function assertRateLimit(key: string, now = Date.now()): void {
  const windowMs = 60_000;
  const max = 12;
  const stamps = (recentVotesByKey.get(key) ?? []).filter(
    (ts) => now - ts < windowMs,
  );
  if (stamps.length >= max) {
    throw new VoteError("Забагато спроб. Спробуйте за хвилину.", 429);
  }
  stamps.push(now);
  recentVotesByKey.set(key, stamps);
}

export async function castVote(input: {
  launchId: string;
  /** Email or anonymous `anon:<uuid>` key stored in votes.voter_email. */
  voterKey: string;
  now?: Date;
}): Promise<{ vote: VoteRecord; voteCount: number }> {
  const key = normalizeVoterKey(input.voterKey);
  assertRateLimit(key);

  const now = input.now ?? new Date();
  const allLaunches = await listLaunches();
  const launch = allLaunches.find((item) => item.id === input.launchId);
  if (!launch) throw new VoteError("Запуск не знайдено", 404);

  let existing: VoteRecord[];
  if (!hasDatabase()) {
    existing = getLocalVotes().filter((vote) => vote.launchId === launch.id);
  } else {
    try {
      existing = await loadDbVotesForLaunch(launch.id);
    } catch {
      existing = getLocalVotes().filter((vote) => vote.launchId === launch.id);
    }
  }

  const check = canCastVote(launch, existing, key, now);
  if (!check.ok) throw new VoteError(check.reason, 409);

  if (!hasDatabase()) {
    const vote = addLocalVote({
      launchId: launch.id,
      productId: launch.productId,
      productSlug: launch.productSlug,
      voterEmail: key,
    });
    return { vote, voteCount: launch.voteCount + 1 };
  }

  try {
    const db = createDb();
    const inserted = await db
      .insert(votes)
      .values({
        launchId: launch.id,
        productId: launch.productId,
        voterEmail: key,
      })
      .returning();

    const [{ value: voteCount }] = await db
      .select({ value: count() })
      .from(votes)
      .where(eq(votes.launchId, launch.id));

    const row = inserted[0];
    return {
      vote: {
        id: row.id,
        launchId: row.launchId,
        productId: row.productId,
        productSlug: launch.productSlug,
        voterEmail: row.voterEmail,
        createdAt: row.createdAt.toISOString(),
      },
      voteCount,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("votes_launch_voter_uidx") || message.includes("unique")) {
      throw new VoteError("Ви вже голосували в цьому запуску", 409);
    }
    console.error("Vote insert failed, falling back to local", error);
    const vote = addLocalVote({
      launchId: launch.id,
      productId: launch.productId,
      productSlug: launch.productSlug,
      voterEmail: key,
    });
    return { vote, voteCount: launch.voteCount + 1 };
  }
}

export async function getTodaysProductOfTheDaySlug(
  now: Date = new Date(),
): Promise<string | null> {
  const today = awardDateKyiv(now);
  const all = await listAwards();
  return (
    all.find(
      (award) =>
        award.awardType === "product_of_the_day" && award.awardDate === today,
    )?.productSlug ?? null
  );
}

/** Awards are immutable: insert-only. Duplicate day is rejected. */
export async function createEditorialAward(input: {
  productId: string;
  productSlug: string;
  awardDate?: string;
}): Promise<AwardRecord> {
  const awardDate = input.awardDate ?? awardDateKyiv();
  if (!hasDatabase()) {
    const existing = getLocalAwards().find(
      (award) =>
        award.awardType === "product_of_the_day" &&
        award.awardDate === awardDate,
    );
    if (existing) {
      throw new VoteError("Продукт тижня на цей тиждень вже призначено", 409);
    }
    const award: AwardRecord = {
      id: `local-award-${awardDate}`,
      productId: input.productId,
      productSlug: input.productSlug,
      awardType: "product_of_the_day",
      awardDate,
      source: "editorial",
      launchId: null,
      createdAt: new Date().toISOString(),
    };
    // Local store is module-scoped; re-seed path uses DB.
    return award;
  }

  const db = createDb();
  try {
    const inserted = await db
      .insert(awards)
      .values({
        productId: input.productId,
        awardType: "product_of_the_day",
        awardDate,
        source: "editorial",
      })
      .returning();
    const row = inserted[0];
    return {
      id: row.id,
      productId: row.productId,
      productSlug: input.productSlug,
      awardType: row.awardType,
      awardDate: row.awardDate,
      source: row.source,
      launchId: row.launchId,
      createdAt: row.createdAt.toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("awards_type_date_uidx") || message.includes("unique")) {
      throw new VoteError("Продукт тижня на цей тиждень вже призначено", 409);
    }
    throw error;
  }
}

export async function ensureLaunchOpenForProduct(input: {
  productId: string;
  productSlug: string;
  startsAt: Date;
  endsAt: Date;
}): Promise<LaunchRecord> {
  if (!hasDatabase()) {
    const existing = getLocalLaunches().find(
      (launch) => launch.productSlug === input.productSlug,
    );
    if (existing) return existing;
    throw new VoteError("Local launch missing", 404);
  }

  const db = createDb();
  const existing = await db
    .select()
    .from(launches)
    .where(
      and(eq(launches.productId, input.productId), eq(launches.status, "open")),
    )
    .limit(1);

  if (existing[0]) {
    return {
      id: existing[0].id,
      productId: existing[0].productId,
      productSlug: input.productSlug,
      startsAt: existing[0].startsAt.toISOString(),
      endsAt: existing[0].endsAt.toISOString(),
      status: existing[0].status,
      voteCount: 0,
    };
  }

  const inserted = await db
    .insert(launches)
    .values({
      productId: input.productId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: "open",
    })
    .returning();

  const row = inserted[0];
  return {
    id: row.id,
    productId: row.productId,
    productSlug: input.productSlug,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    status: row.status,
    voteCount: 0,
  };
}
