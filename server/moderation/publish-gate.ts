import type { SubmissionInput } from "@/lib/submit/schema";

export type PublishGateResult =
  | { ok: true }
  | { ok: false; reasons: string[] };

/** GEO + product rules required before status can become approved/active. */
export function assertPublishable(
  input: Pick<
    SubmissionInput,
    "name" | "tagline" | "platforms" | "ukraineNote" | "categorySlug"
  >,
): PublishGateResult {
  const reasons: string[] = [];

  if (!input.name?.trim() || input.name.trim().length < 2) {
    reasons.push("Потрібна назва продукту");
  }
  if (!input.tagline?.trim() || input.tagline.trim().length < 12) {
    reasons.push("Потрібен tagline від 12 символів");
  }
  if (input.tagline && input.tagline.length > 120) {
    reasons.push("Опис має бути до 120 символів");
  }
  if (!input.platforms?.length) {
    reasons.push("Потрібна хоча б одна платформа");
  }
  if (!input.ukraineNote?.trim() || input.ukraineNote.trim().length < 20) {
    reasons.push("Потрібне пояснення звʼязку з Україною");
  }
  if (!input.categorySlug?.trim()) {
    reasons.push("Потрібна категорія");
  }

  return reasons.length ? { ok: false, reasons } : { ok: true };
}
