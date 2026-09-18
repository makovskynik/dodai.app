import assert from "node:assert/strict";
import test from "node:test";
import { assertPublishable } from "../../server/moderation/publish-gate";

test("publish gate accepts complete GEO fields", () => {
  const result = assertPublishable({
    name: "TestApp",
    tagline: "Короткий опис українського сервісу.",
    platforms: ["web"],
    ukraineNote: "Засновано в Україні, команда в Києві.",
    categorySlug: "tools",
  });
  assert.equal(result.ok, true);
});

test("publish gate blocks missing ukraine note", () => {
  const result = assertPublishable({
    name: "TestApp",
    tagline: "Короткий опис українського сервісу.",
    platforms: ["web"],
    ukraineNote: "short",
    categorySlug: "tools",
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.reasons.some((reason) => /Україн/i.test(reason)));
  }
});
