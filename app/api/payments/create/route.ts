import { NextResponse } from "next/server";
import { z } from "zod";
import { listingTierPriceUah } from "@/lib/pricing/catalog";
import { getAppUrl } from "@/lib/env";
import { getPaymentProvider } from "@/server/payments";
import {
  findPaymentByIdempotencyKey,
  savePayment,
} from "@/server/payments/store";
import type { PaymentPurpose } from "@/server/payments/types";
import { getSubmission, markSubmissionPaid } from "@/server/submissions/store";

export const runtime = "nodejs";

const bodySchema = z.object({
  submissionId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Невалідний запит" }, { status: 400 });
    }

    const submission = await getSubmission(parsed.data.submissionId);
    if (!submission) {
      return NextResponse.json({ error: "Заявку не знайдено" }, { status: 404 });
    }
    if (
      submission.status !== "pending_payment" &&
      submission.status !== "draft"
    ) {
      return NextResponse.json(
        { error: `Заявка вже в статусі ${submission.status}` },
        { status: 400 },
      );
    }

    const tier = submission.listingTier ?? "free";
    const amountUah = listingTierPriceUah(tier);
    const purpose: PaymentPurpose =
      tier === "passport" ? "passport_listing" : "base_listing";
    const idempotencyKey = `${purpose}_${submission.id}`;

    const existing = await findPaymentByIdempotencyKey(idempotencyKey);
    if (existing) {
      return NextResponse.json({
        payment: existing,
        checkoutUrl: existing.checkoutUrl,
      });
    }

    if (amountUah === 0) {
      const freePayment = await savePayment({
        provider: "local",
        providerPaymentId: `free_${submission.id}`,
        idempotencyKey,
        referenceId: submission.id,
        purpose,
        amountUah: 0,
        customerEmail: submission.ownerEmail,
        status: "paid",
        checkoutUrl: `${getAppUrl()}/submit/pay/${submission.id}?free=1`,
        paidAt: new Date().toISOString(),
      });
      await markSubmissionPaid(submission.id, freePayment.id);
      return NextResponse.json({
        payment: freePayment,
        checkoutUrl: freePayment.checkoutUrl,
        free: true,
      });
    }

    const provider = getPaymentProvider();
    const created = await provider.createPayment({
      amountUah,
      purpose,
      referenceId: submission.id,
      description:
        tier === "passport"
          ? `dodai.app — повна картка (${submission.name})`
          : `dodai.app — базове розміщення (${submission.name})`,
      customerEmail: submission.ownerEmail,
      idempotencyKey,
      redirectUrl: `${getAppUrl()}/submit/pay/${submission.id}?paid=1`,
      webhookUrl: `${getAppUrl()}/api/payments/webhook`,
    });

    const payment = await savePayment({
      provider: created.provider,
      providerPaymentId: created.providerPaymentId,
      idempotencyKey,
      referenceId: submission.id,
      purpose,
      amountUah,
      customerEmail: submission.ownerEmail,
      status: "created",
      checkoutUrl: created.checkoutUrl,
    });

    return NextResponse.json({
      payment,
      checkoutUrl: payment.checkoutUrl,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не вдалося створити оплату";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
