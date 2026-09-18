import assert from "node:assert/strict";
import test from "node:test";
import {
  collectAllowedDomains,
  isDestinationAllowed,
} from "./allowlist";

test("allows destination on product domain", () => {
  const result = isDestinationAllowed("https://serpstat.com/pricing", [
    "serpstat.com",
  ]);
  assert.equal(result.ok, true);
});

test("rejects open redirect to foreign domain", () => {
  const result = isDestinationAllowed("https://evil.example/phish", [
    "serpstat.com",
  ]);
  assert.equal(result.ok, false);
});

test("rejects non-http schemes", () => {
  const result = isDestinationAllowed("javascript:alert(1)", ["serpstat.com"]);
  assert.equal(result.ok, false);
});

test("collectAllowedDomains includes website and sameAs", () => {
  const domains = collectAllowedDomains({
    website: "https://www.example.com/app",
    domain: "example.com",
    sameAs: ["https://apps.apple.com/app/id1"],
  });
  assert.ok(domains.includes("example.com"));
  assert.ok(domains.includes("apps.apple.com"));
});
