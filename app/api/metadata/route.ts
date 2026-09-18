import { NextResponse } from "next/server";
import { metadataRequestSchema } from "@/lib/submit/schema";
import { findDuplicateDomain } from "@/server/submissions/store";
import { fetchPageMetadata } from "@/server/metadata/fetch-metadata";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = metadataRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Невалідний запит" },
        { status: 400 },
      );
    }

    const metadata = await fetchPageMetadata(parsed.data.url);
    const duplicateSlug = findDuplicateDomain(metadata.domain);

    return NextResponse.json({
      metadata,
      duplicateSlug,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не вдалося прочитати метадані";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
