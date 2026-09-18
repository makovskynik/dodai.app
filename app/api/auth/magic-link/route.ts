import { NextResponse } from "next/server";
import { z } from "zod";
import { createMagicLink } from "@/server/auth/magic-link";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Вкажіть email" }, { status: 400 });
    }

    const result = await createMagicLink(parsed.data.email);
    return NextResponse.json({
      ok: true,
      message: "Якщо email коректний — надішлемо посилання для входу.",
      // Dev-only convenience; empty in production.
      previewToken: result.previewToken || undefined,
      previewUrl: result.previewToken ? result.verifyUrl : undefined,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не вдалося надіслати посилання";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
