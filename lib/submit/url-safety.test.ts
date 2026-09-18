import assert from "node:assert/strict";
import test from "node:test";
import {
  isPrivateOrReservedIp,
  isBlockedHostname,
  normalizeHttpUrl,
  domainFromUrl,
} from "./url-safety";

test("normalizes bare domains to https", () => {
  const url = normalizeHttpUrl("example.com/path");
  assert.equal(url.protocol, "https:");
  assert.equal(url.hostname, "example.com");
});

test("rejects non-http schemes", () => {
  assert.throws(() => normalizeHttpUrl("ftp://example.com"), /http/);
});

test("blocks localhost hostnames", () => {
  assert.equal(isBlockedHostname("localhost"), true);
  assert.equal(isBlockedHostname("foo.localhost"), true);
  assert.equal(isBlockedHostname("serpstat.com"), false);
});

test("detects private IPv4", () => {
  assert.equal(isPrivateOrReservedIp("127.0.0.1"), true);
  assert.equal(isPrivateOrReservedIp("10.0.0.8"), true);
  assert.equal(isPrivateOrReservedIp("192.168.1.1"), true);
  assert.equal(isPrivateOrReservedIp("169.254.169.254"), true);
  assert.equal(isPrivateOrReservedIp("8.8.8.8"), false);
});

test("domainFromUrl strips www", () => {
  assert.equal(domainFromUrl("https://www.Work.ua/jobs"), "work.ua");
});
