import { NextResponse } from "next/server";
import { z } from "zod";
import {
  clientIpFromRequest,
  ensureAnonymousVoterKey,
} from "@/lib/votes/anonymous";
import {
  isTurnstileRequired,
  verifyTurnstileToken,
} from "@/lib/security/turnstile";
import { readSessionUser } from "@/server/auth/session";
import { castVote, VoteError } from "@/server/votes/service";

export const runtime = "nodejs";

const bodySchema = z.object({
  launchId: z.string().min(1),
  turnstileToken: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Некоректний запит" }, { status: 400 });
    }

    const ip = clientIpFromRequest(request);
    const captcha = await verifyTurnstileToken(
      parsed.data.turnstileToken,
      ip,
    );
    if (!captcha.ok) {
      return NextResponse.json(
        {
          error: captcha.reason,
          captchaRequired: isTurnstileRequired(),
        },
        { status: 400 },
      );
    }

    const user = await readSessionUser();
    const voterKey = user?.email
      ? user.email.trim().toLowerCase()
      : await ensureAnonymousVoterKey();

    const result = await castVote({
      launchId: parsed.data.launchId,
      voterKey,
    });

    console.info("vote_cast", {
      launchId: result.vote.launchId,
      productSlug: result.vote.productSlug,
      voteCount: result.voteCount,
      anonymous: !user?.email,
    });

    return NextResponse.json({
      ok: true,
      voteCount: result.voteCount,
      hasVoted: true,
    });
  } catch (error) {
    if (error instanceof VoteError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    const message =
      error instanceof Error ? error.message : "Не вдалося зберегти голос";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
