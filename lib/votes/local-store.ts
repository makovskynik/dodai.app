import { awardDateKyiv } from "@/lib/votes/rules";
import type {
  AwardRecord,
  LaunchRecord,
  VoteRecord,
} from "@/lib/votes/rules";
import { localCatalogProducts } from "@/lib/catalog/local-seed";

const starts = new Date(Date.UTC(2026, 8, 18, 0, 0, 0));
const ends = new Date(Date.UTC(2027, 8, 18, 0, 0, 0));

/** Explicit demo ratings so the catalog shows varied vote UI. */
const DEMO_VOTE_COUNTS: Record<string, number> = {
  som: 142,
  serpstat: 87,
  macpaw: 64,
  "se-ranking": 51,
  "snov-io": 38,
  wayforpay: 29,
  "headway-inc": 22,
  "nethunt-crm": 18,
  ringostat: 14,
  admitad: 11,
  mgid: 9,
  "work-ua": 7,
  happ: 5,
  keyapp: 3,
  finmap: 1,
};

const VOTE_PATTERN = [0, 2, 4, 6, 8, 12, 16, 21, 27, 33, 41, 48];

function demoVotesForSlug(slug: string, index: number): number {
  if (DEMO_VOTE_COUNTS[slug] != null) return DEMO_VOTE_COUNTS[slug];
  return VOTE_PATTERN[index % VOTE_PATTERN.length]!;
}

function buildSeedLaunches(): LaunchRecord[] {
  return localCatalogProducts.map((product, index) => ({
    id: `local-launch-${product.slug}`,
    productId: product.id,
    productSlug: product.slug,
    startsAt: starts.toISOString(),
    endsAt: ends.toISOString(),
    status: "open" as const,
    voteCount: demoVotesForSlug(product.slug, index),
  }));
}

export const LOCAL_DEMO_LAUNCH: LaunchRecord = {
  id: "local-launch-serpstat",
  productId: "serpstat",
  productSlug: "serpstat",
  startsAt: starts.toISOString(),
  endsAt: ends.toISOString(),
  status: "open",
  voteCount: DEMO_VOTE_COUNTS.serpstat ?? 87,
};

export const LOCAL_DEMO_AWARD: AwardRecord = {
  id: "local-award-potd-today",
  productId: "serpstat",
  productSlug: "serpstat",
  awardType: "product_of_the_day",
  awardDate: awardDateKyiv(new Date("2026-09-18T12:00:00Z")),
  source: "editorial",
  launchId: null,
  createdAt: new Date("2026-09-18T08:00:00Z").toISOString(),
};

/** Mutable local store for offline/dev voting. */
let localLaunches: LaunchRecord[] = buildSeedLaunches();

let localVotes: VoteRecord[] = [];

let localAwards: AwardRecord[] = [
  {
    ...LOCAL_DEMO_AWARD,
    awardDate: awardDateKyiv(),
  },
];

export function getLocalLaunches(): LaunchRecord[] {
  return localLaunches.map((launch) => ({ ...launch }));
}

export function getLocalVotes(): VoteRecord[] {
  return localVotes.map((vote) => ({ ...vote }));
}

export function getLocalAwards(): AwardRecord[] {
  return localAwards.map((award) => ({ ...award }));
}

export function resetLocalVotingStoreForTests(): void {
  localLaunches = buildSeedLaunches();
  localVotes = [];
  localAwards = [{ ...LOCAL_DEMO_AWARD, awardDate: awardDateKyiv() }];
}

export function addLocalVote(input: {
  launchId: string;
  productId: string;
  productSlug: string;
  voterEmail: string;
}): VoteRecord {
  const vote: VoteRecord = {
    id: crypto.randomUUID(),
    launchId: input.launchId,
    productId: input.productId,
    productSlug: input.productSlug,
    voterEmail: input.voterEmail,
    createdAt: new Date().toISOString(),
  };
  localVotes = [...localVotes, vote];
  localLaunches = localLaunches.map((launch) =>
    launch.id === input.launchId
      ? { ...launch, voteCount: launch.voteCount + 1 }
      : launch,
  );
  return vote;
}
