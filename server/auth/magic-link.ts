import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAppUrl, getEnv, isAdminEmail } from "@/lib/env";

type MagicToken = {
  token: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  consumedAt?: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const TOKENS_FILE = path.join(DATA_DIR, "magic-links.json");

async function readTokens(): Promise<MagicToken[]> {
  try {
    return JSON.parse(await readFile(TOKENS_FILE, "utf8")) as MagicToken[];
  } catch {
    return [];
  }
}

async function writeTokens(tokens: MagicToken[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2), "utf8");
}

export async function createMagicLink(email: string): Promise<{
  verifyUrl: string;
  previewToken: string;
}> {
  const normalized = email.trim().toLowerCase();
  const token = randomBytes(24).toString("hex");
  const now = Date.now();
  const record: MagicToken = {
    token,
    email: normalized,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 1000 * 60 * 30).toISOString(),
  };

  const tokens = await readTokens();
  tokens.unshift(record);
  await writeTokens(tokens.slice(0, 200));

  const verifyUrl = `${getAppUrl()}/api/auth/verify?token=${token}`;

  const env = getEnv();
  if (env.RESEND_API_KEY && env.EMAIL_FROM) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [normalized],
        subject: "Вхід на dodai.app",
        text: `Ваше посилання для входу (30 хв):\n\n${verifyUrl}\n`,
      }),
    });
  } else {
    console.info("[magic-link]", { email: normalized, verifyUrl });
  }

  return {
    verifyUrl,
    previewToken: process.env.NODE_ENV === "production" ? "" : token,
  };
}

export async function consumeMagicToken(token: string): Promise<{
  email: string;
  role: "user" | "admin";
} | null> {
  const tokens = await readTokens();
  const index = tokens.findIndex((item) => item.token === token);
  if (index < 0) return null;

  const record = tokens[index];
  if (record.consumedAt) return null;
  if (Date.parse(record.expiresAt) < Date.now()) return null;

  tokens[index] = { ...record, consumedAt: new Date().toISOString() };
  await writeTokens(tokens);

  return {
    email: record.email,
    role: isAdminEmail(record.email) ? "admin" : "user",
  };
}
