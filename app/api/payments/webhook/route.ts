import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/server/payments";
import {
  findPaymentByProviderId,
  markPaymentStatus,
} from "@/server/payments/store";
import { markSubmissionPaid } from "@/server/submissions/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const provider = getPaymentProvider();
    const parsed = await provider.verifyAndParseWebhook(request, body);

    const existing = await findPaymentByProviderId(parsed.providerPaymentId);
    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (existing.status === "paid") {
      return NextResponse.json({ ok: true, idempotent: true });
    }

    if (parsed.status === "paid") {
      await markPaymentStatus(parsed.providerPaymentId, "paid");
      await markSubmissionPaid(existing.referenceId, existing.id);
    } else {
      await markPaymentStatus(parsed.providerPaymentId, parsed.status);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
