import { randomUUID } from "node:crypto";

export const VOTER_COOKIE = "dodai_vid";
const ONE_YEAR_S = 60 * 60 * 24 * 365;

export function isAnonymousVoterKey(key: string): boolean {
  return key.startsWith("anon:");
}

export function makeAnonymousVoterKey(id?: string): string {
  const clean = (id ?? randomUUID()).replace(/^anon:/i, "").trim().toLowerCase();
  return `anon:${clean || randomUUID()}`;
}

export function normalizeVoterKey(key: string): string {
  const trimmed = key.trim().toLowerCase();
  if (isAnonymousVoterKey(trimmed)) {
    return makeAnonymousVoterKey(trimmed);
  }
  return trimmed;
}

/** Read existing anonymous voter cookie (no create). */
export async function readVoterKeyFromCookie(): Promise<string | null> {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  const raw = jar.get(VOTER_COOKIE)?.value?.trim();
  if (!raw) return null;
  return makeAnonymousVoterKey(raw);
}

/**
 * Ensure a stable anonymous voter id cookie exists.
 * Returns `anon:<uuid>` for uniqueness in the votes table.
 */
export async function ensureAnonymousVoterKey(): Promise<string> {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  const existing = jar.get(VOTER_COOKIE)?.value?.trim();
  if (existing) {
    return makeAnonymousVoterKey(existing);
  }
  const id = randomUUID();
  jar.set(VOTER_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_S,
  });
  return makeAnonymousVoterKey(id);
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
