import assert from "node:assert/strict";
import test from "node:test";
import {
  ANALYTICS_EVENTS,
  isAnalyticsEventName,
} from "./events";

test("approved vocabulary includes core discovery events", () => {
  assert.ok(ANALYTICS_EVENTS.includes("search_submitted"));
  assert.ok(ANALYTICS_EVENTS.includes("outbound_clicked"));
  assert.ok(ANALYTICS_EVENTS.includes("vote_cast"));
  assert.equal(isAnalyticsEventName("search_submitted"), true);
  assert.equal(isAnalyticsEventName("fake_event"), false);
});
