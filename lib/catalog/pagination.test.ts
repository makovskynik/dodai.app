import assert from "node:assert/strict";
import test from "node:test";
import {
  CATALOG_PAGE_SIZE,
  paginateItems,
  paginationWindow,
  parsePageParam,
} from "./pagination";

test("parsePageParam defaults and clamps invalid values", () => {
  assert.equal(parsePageParam(undefined), 1);
  assert.equal(parsePageParam("0"), 1);
  assert.equal(parsePageParam("-2"), 1);
  assert.equal(parsePageParam("abc"), 1);
  assert.equal(parsePageParam("3"), 3);
});

test("paginateItems returns nine items per page by default", () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);
  const first = paginateItems(items, 1);
  assert.equal(first.pageSize, CATALOG_PAGE_SIZE);
  assert.deepEqual(first.items, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(first.totalPages, 3);

  const second = paginateItems(items, 2);
  assert.deepEqual(second.items, [10, 11, 12, 13, 14, 15, 16, 17, 18]);

  const third = paginateItems(items, 3);
  assert.deepEqual(third.items, [19, 20, 21, 22, 23, 24, 25]);

  const overflow = paginateItems(items, 99);
  assert.equal(overflow.page, 3);
  assert.deepEqual(overflow.items, third.items);
});

test("paginationWindow collapses long ranges", () => {
  assert.deepEqual(paginationWindow(1, 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(paginationWindow(5, 20), [
    1,
    "ellipsis",
    4,
    5,
    6,
    "ellipsis",
    20,
  ]);
});
