import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CatalogQuery } from "@/lib/catalog/types";
import { suggestCollectionsForQuery } from "@/lib/geo/collections";

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "zero-result-searches.json");

export type ZeroResultRecord = {
  q: string;
  category: string | null;
  platform: string | null;
  at: string;
  suggestedCollectionSlugs: string[];
};

async function ensure() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readAll(): Promise<ZeroResultRecord[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    return JSON.parse(raw) as ZeroResultRecord[];
  } catch {
    return [];
  }
}

export async function recordZeroResult(query: CatalogQuery): Promise<void> {
  const q = query.q?.trim();
  if (!q) return;

  await ensure();
  const rows = await readAll();
  const record: ZeroResultRecord = {
    q,
    category: query.category ?? null,
    platform: query.platform ?? null,
    at: new Date().toISOString(),
    suggestedCollectionSlugs: suggestCollectionsForQuery(q),
  };
  rows.unshift(record);
  await writeFile(FILE, JSON.stringify(rows.slice(0, 500), null, 2), "utf8");
  console.info("zero_result_search", record);
}

export async function listZeroResults(
  limit = 50,
): Promise<ZeroResultRecord[]> {
  const rows = await readAll();
  return rows.slice(0, limit);
}
