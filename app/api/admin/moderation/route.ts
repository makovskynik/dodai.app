import { NextResponse } from "next/server";
import { z } from "zod";
import { readSessionUser } from "@/server/auth/session";
import { publishSubmissionToCatalog } from "@/server/catalog/published-store";
import {
  approveSubmission,
  rejectSubmission,
  updateSubmission,
} from "@/server/submissions/store";

export const runtime = "nodejs";

const bodySchema = z.object({
  submissionId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  reason: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const user = await readSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Невалідний запит" }, { status: 400 });
    }

    if (parsed.data.action === "reject") {
      const rejected = await rejectSubmission(
        parsed.data.submissionId,
        user.email,
        parsed.data.reason ?? "Відхилено модератором",
      );
      return NextResponse.json({ ok: true, submission: rejected });
    }

    const approved = await approveSubmission(
      parsed.data.submissionId,
      user.email,
    );
    const product = await publishSubmissionToCatalog(approved);
    const withSlug = await updateSubmission(approved.id, {
      publishedSlug: product.slug,
    });

    return NextResponse.json({
      ok: true,
      submission: withSlug,
      product: { slug: product.slug },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Помилка модерації";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
