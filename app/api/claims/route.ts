import { NextResponse } from "next/server";
import { z } from "zod";
import { getProductBySlug } from "@/lib/catalog/queries";
import { createClaimRequest } from "@/server/geo/claims";

export const runtime = "nodejs";

const bodySchema = z.object({
  productSlug: z.string().min(1).max(120),
  email: z.string().email(),
  note: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Перевірте поля" },
        { status: 400 },
      );
    }

    const product = await getProductBySlug(parsed.data.productSlug);
    if (!product) {
      return NextResponse.json({ error: "Продукт не знайдено" }, { status: 404 });
    }
    if (!product.claimable) {
      return NextResponse.json(
        { error: "Цю картку зараз не можна підтвердити як свою" },
        { status: 400 },
      );
    }

    const claim = await createClaimRequest(parsed.data);
    return NextResponse.json({
      ok: true,
      claim: { id: claim.id, status: claim.status },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не вдалося зберегти заявку";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
