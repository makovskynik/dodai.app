import {
  domainFromUrl,
  isBlockedHostname,
  isPrivateOrReservedIp,
  normalizeHttpUrl,
} from "@/lib/submit/url-safety";
import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

export type RedirectCheckResult =
  | { ok: true; url: URL; domain: string }
  | { ok: false; reason: string };

/**
 * Allow outbound redirect only when destination matches the product's
 * registered website domain (and optional sameAs hosts).
 */
export function isDestinationAllowed(
  destination: string,
  allowedDomains: string[],
): RedirectCheckResult {
  let url: URL;
  try {
    url = normalizeHttpUrl(destination);
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Некоректний URL",
    };
  }

  if (isBlockedHostname(url.hostname)) {
    return { ok: false, reason: "Заблокований хост" };
  }

  const destDomain = domainFromUrl(url);
  const normalizedAllowed = allowedDomains
    .map((domain) => domain.replace(/^www\./i, "").toLowerCase())
    .filter(Boolean);

  const allowed = normalizedAllowed.some(
    (domain) => destDomain === domain || destDomain.endsWith(`.${domain}`),
  );

  if (!allowed) {
    return { ok: false, reason: "Домен не в allowlist продукту" };
  }

  return { ok: true, url, domain: destDomain };
}

export async function assertSafeRedirectHost(
  hostname: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (isBlockedHostname(hostname)) {
    return { ok: false, reason: "Заблокований хост" };
  }

  if (isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      return { ok: false, reason: "Приватна IP-адреса" };
    }
    return { ok: true };
  }

  try {
    const results = await lookup(hostname, { all: true });
    for (const result of results) {
      if (isPrivateOrReservedIp(result.address)) {
        return { ok: false, reason: "Хост резолвиться в приватну мережу" };
      }
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "Не вдалося перевірити хост" };
  }
}

export function collectAllowedDomains(input: {
  website: string;
  domain: string | null;
  sameAs?: string[];
}): string[] {
  const domains = new Set<string>();
  if (input.domain) domains.add(input.domain.toLowerCase());
  try {
    domains.add(domainFromUrl(input.website));
  } catch {
    // ignore invalid website
  }
  for (const item of input.sameAs ?? []) {
    try {
      domains.add(domainFromUrl(item));
    } catch {
      // ignore
    }
  }
  return [...domains];
}
