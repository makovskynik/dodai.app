import assert from "node:assert/strict";
import test from "node:test";
import {
  awardWeekStartKyiv,
  canCastVote,
  isLaunchOpen,
  pickLaunchWinner,
  type LaunchRecord,
  type VoteRecord,
} from "./rules";
import { applyProductOfTheDayAward } from "./apply";
import {
  getLocalAwards,
  resetLocalVotingStoreForTests,
} from "./local-store";
import type { CatalogProduct } from "@/lib/catalog/types";

const openLaunch: LaunchRecord = {
  id: "launch-1",
  productId: "p1",
  productSlug: "alpha",
  startsAt: "2026-09-01T00:00:00.000Z",
  endsAt: "2027-01-01T00:00:00.000Z",
  status: "open",
  voteCount: 2,
};

test("isLaunchOpen respects window and status", () => {
  assert.equal(isLaunchOpen(openLaunch, new Date("2026-09-18")), true);
  assert.equal(
    isLaunchOpen({ ...openLaunch, status: "closed" }, new Date("2026-09-18")),
    false,
  );
});

test("one vote per user per launch", () => {
  const votes: VoteRecord[] = [
    {
      id: "v1",
      launchId: "launch-1",
      productId: "p1",
      productSlug: "alpha",
      voterEmail: "user@example.com",
      createdAt: "2026-09-18T10:00:00.000Z",
    },
  ];
  const blocked = canCastVote(openLaunch, votes, "User@Example.com");
  assert.equal(blocked.ok, false);

  const allowed = canCastVote(openLaunch, votes, "other@example.com");
  assert.equal(allowed.ok, true);
});

test("anonymous voter key can cast without email", () => {
  const allowed = canCastVote(openLaunch, [], "anon:11111111-2222-3333-4444-555555555555");
  assert.equal(allowed.ok, true);

  const blocked = canCastVote(openLaunch, [], "anon:");
  assert.equal(blocked.ok, false);
});

test("pickLaunchWinner ranks by vote count", () => {
  const winner = pickLaunchWinner([
    { ...openLaunch, productSlug: "a", voteCount: 1 },
    { ...openLaunch, id: "2", productSlug: "b", voteCount: 5 },
  ]);
  assert.equal(winner?.productSlug, "b");
});

test("award week starts on Monday Kyiv", () => {
  // Friday 2026-09-18 Kyiv → week of Monday 2026-09-14
  assert.equal(
    awardWeekStartKyiv(new Date("2026-09-18T12:00:00Z")),
    "2026-09-14",
  );
});

test("weekly award is applied and never on promoted", () => {
  resetLocalVotingStoreForTests();
  const awards = getLocalAwards();
  const products = [
    {
      slug: "serpstat",
      badge: null,
    } as CatalogProduct,
    {
      slug: "wayforpay",
      badge: "promoted",
    } as CatalogProduct,
  ];
  const withAward = applyProductOfTheDayAward(products, [
    { ...awards[0], productSlug: "serpstat", awardDate: awards[0].awardDate },
  ]);
  assert.equal(withAward[0].badge, "product-of-the-day");
  assert.equal(withAward[1].badge, "promoted");
});
