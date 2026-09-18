import { NextResponse } from "next/server";
import { submissionSchema } from "@/lib/submit/schema";
import { createSubmission } from "@/server/submissions/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = submissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Перевірте поля форми",
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const submission = await createSubmission(parsed.data);
    return NextResponse.json({
      ok: true,
      submission: {
        id: submission.id,
        status: submission.status,
        source: submission.source,
        domain: submission.domain,
      },
      next: {
        message:
          "Заявку збережено. База безкоштовна — підтвердіть і надішліть на модерацію. Спонсорські місця: /pricing.",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не вдалося зберегти заявку";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
