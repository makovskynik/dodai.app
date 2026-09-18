import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { hasDatabase } from "@/lib/env";
import type { SubmissionInput } from "@/lib/submit/schema";
import { domainFromUrl } from "@/lib/submit/url-safety";
import { localCatalogProducts } from "@/lib/catalog/local-seed";
import { assertPublishable } from "@/server/moderation/publish-gate";

export type SubmissionStatus =
  | "draft"
  | "pending_payment"
  | "paid"
  | "moderation"
  | "approved"
  | "rejected";

export type StoredSubmission = SubmissionInput & {
  id: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
  source: "local-file" | "neon";
  paymentId?: string;
  moderationReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  publishedSlug?: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");

async function readLocalSubmissions(): Promise<StoredSubmission[]> {
  try {
    const raw = await readFile(SUBMISSIONS_FILE, "utf8");
    return JSON.parse(raw) as StoredSubmission[];
  } catch {
    return [];
  }
}

async function writeLocalSubmissions(
  submissions: StoredSubmission[],
): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), "utf8");
}

export function findDuplicateDomain(domain: string): string | null {
  const normalized = domain.replace(/^www\./i, "").toLowerCase();
  const hit = localCatalogProducts.find(
    (product) => product.domain?.toLowerCase() === normalized,
  );
  return hit?.slug ?? null;
}

export async function listSubmissions(): Promise<StoredSubmission[]> {
  return readLocalSubmissions();
}

export async function getSubmission(
  id: string,
): Promise<StoredSubmission | undefined> {
  const submissions = await readLocalSubmissions();
  return submissions.find((item) => item.id === id);
}

export async function createSubmission(
  input: SubmissionInput,
): Promise<StoredSubmission> {
  const domain = domainFromUrl(input.url);
  const duplicate = findDuplicateDomain(domain);
  if (duplicate) {
    throw new Error(
      `Продукт з доменом ${domain} уже є в каталозі (/${duplicate}).`,
    );
  }

  const now = new Date().toISOString();
  const record: StoredSubmission = {
    ...input,
    domain,
    id: randomUUID(),
    status: "pending_payment",
    createdAt: now,
    updatedAt: now,
    source: hasDatabase() ? "neon" : "local-file",
  };

  const existing = await readLocalSubmissions();
  existing.unshift(record);
  await writeLocalSubmissions(existing.slice(0, 500));
  return record;
}

export async function updateSubmission(
  id: string,
  patch: Partial<StoredSubmission>,
): Promise<StoredSubmission> {
  const submissions = await readLocalSubmissions();
  const index = submissions.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Заявку не знайдено");

  submissions[index] = {
    ...submissions[index],
    ...patch,
    id: submissions[index].id,
    updatedAt: new Date().toISOString(),
  };
  await writeLocalSubmissions(submissions);
  return submissions[index];
}

export async function markSubmissionPaid(
  id: string,
  paymentId: string,
): Promise<StoredSubmission> {
  return updateSubmission(id, {
    status: "moderation",
    paymentId,
  });
}

export async function approveSubmission(
  id: string,
  reviewerEmail: string,
): Promise<StoredSubmission> {
  const submission = await getSubmission(id);
  if (!submission) throw new Error("Заявку не знайдено");
  if (submission.status !== "moderation" && submission.status !== "paid") {
    throw new Error("До модерації допускаються лише оплачені заявки");
  }

  const gate = assertPublishable(submission);
  if (!gate.ok) {
    throw new Error(`Не можна опублікувати: ${gate.reasons.join("; ")}`);
  }

  return updateSubmission(id, {
    status: "approved",
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewerEmail,
    moderationReason: undefined,
  });
}

export async function rejectSubmission(
  id: string,
  reviewerEmail: string,
  reason: string,
): Promise<StoredSubmission> {
  if (!reason.trim()) throw new Error("Вкажіть причину відхилення");
  return updateSubmission(id, {
    status: "rejected",
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewerEmail,
    moderationReason: reason.trim(),
  });
}
