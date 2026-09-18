import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "claims.json");

export type ClaimRequest = {
  id: string;
  productSlug: string;
  email: string;
  note: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

async function ensure() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readAll(): Promise<ClaimRequest[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    return JSON.parse(raw) as ClaimRequest[];
  } catch {
    return [];
  }
}

export async function createClaimRequest(input: {
  productSlug: string;
  email: string;
  note?: string;
}): Promise<ClaimRequest> {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) {
    throw new Error("Вкажіть коректний email");
  }

  await ensure();
  const rows = await readAll();
  const claim: ClaimRequest = {
    id: randomUUID(),
    productSlug: input.productSlug,
    email,
    note: (input.note ?? "").trim().slice(0, 500),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  rows.unshift(claim);
  await writeFile(FILE, JSON.stringify(rows.slice(0, 500), null, 2), "utf8");
  return claim;
}

export async function listClaimRequests(
  limit = 50,
): Promise<ClaimRequest[]> {
  return (await readAll()).slice(0, limit);
}
