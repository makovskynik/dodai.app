const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function getTurnstileSiteKey(): string | undefined {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || undefined;
}

export function getTurnstileSecretKey(): string | undefined {
  return process.env.TURNSTILE_SECRET_KEY?.trim() || undefined;
}

/** Captcha is required only when the secret is configured. */
export function isTurnstileRequired(): boolean {
  return Boolean(getTurnstileSecretKey());
}

export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp?: string | null,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const secret = getTurnstileSecretKey();
  if (!secret) return { ok: true };
  if (!token?.trim()) {
    return { ok: false, reason: "Пройдіть перевірку (captcha)" };
  }

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token.trim());
    if (remoteIp) body.set("remoteip", remoteIp);

    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await response.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    if (!data.success) {
      return { ok: false, reason: "Captcha не пройдена. Спробуйте ще раз." };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "Не вдалося перевірити captcha" };
  }
}
