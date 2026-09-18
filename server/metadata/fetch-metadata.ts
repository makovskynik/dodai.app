import { lookup } from "node:dns/promises";
import type { FetchedMetadata } from "@/lib/submit/schema";
import {
  domainFromUrl,
  isBlockedHostname,
  isPrivateOrReservedIp,
  normalizeHttpUrl,
} from "@/lib/submit/url-safety";

const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 8000;
const MAX_BYTES = 1_000_000;

async function assertSafeHostname(hostname: string): Promise<void> {
  if (isBlockedHostname(hostname)) {
    throw new Error("Цей хост заборонений для завантаження метаданих");
  }

  const results = await lookup(hostname, { all: true, verbatim: true });
  if (!results.length) {
    throw new Error("Не вдалося резолвнути домен");
  }

  for (const result of results) {
    if (isPrivateOrReservedIp(result.address)) {
      throw new Error("Заборонено звертатись до приватних або reserved IP");
    }
  }
}

function pickMeta(html: string, keys: string[]): string | null {
  for (const key of keys) {
    const patterns = [
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
        "i",
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
        "i",
      ),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return decodeHtml(match[1].trim());
    }
  }
  return null;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteFrom(base: string, maybeRelative: string | null): string | null {
  if (!maybeRelative) return null;
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return null;
  }
}

export async function fetchPageMetadata(rawUrl: string): Promise<FetchedMetadata> {
  let current = normalizeHttpUrl(rawUrl);

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    await assertSafeHostname(current.hostname);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(current.toString(), {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "dodai-metadata-bot/1.0 (+https://dodai.app)",
          Accept: "text/html,application/xhtml+xml",
        },
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) throw new Error("Redirect без Location");
        current = normalizeHttpUrl(new URL(location, current).toString());
        continue;
      }

      if (!response.ok) {
        throw new Error(`Сайт відповів статусом ${response.status}`);
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
        throw new Error("Очікувався HTML для читання метаданих");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Порожня відповідь");

      const chunks: Uint8Array[] = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;
        total += value.byteLength;
        if (total > MAX_BYTES) {
          throw new Error("Занадто великий HTML для метаданих");
        }
        chunks.push(value);
      }

      const html = Buffer.concat(chunks).toString("utf8");
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      const title =
        pickMeta(html, ["og:title", "twitter:title"]) ??
        (titleMatch?.[1] ? decodeHtml(titleMatch[1]) : null);
      const description = pickMeta(html, [
        "og:description",
        "description",
        "twitter:description",
      ]);
      const ogImage = absoluteFrom(
        current.toString(),
        pickMeta(html, ["og:image", "twitter:image"]),
      );
      const iconMatch = html.match(
        /<link[^>]+rel=["'](?:shortcut icon|icon)["'][^>]+href=["']([^"']+)["']/i,
      );
      const favicon = absoluteFrom(
        current.toString(),
        iconMatch?.[1] ?? "/favicon.ico",
      );

      return {
        url: rawUrl,
        finalUrl: current.toString(),
        domain: domainFromUrl(current),
        title,
        description,
        ogImageUrl: ogImage,
        faviconUrl: favicon,
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Таймаут завантаження метаданих");
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error("Забагато redirect");
}
