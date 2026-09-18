import { NextResponse } from "next/server";
import { consumeMagicToken } from "@/server/auth/magic-link";
import { setSessionCookie } from "@/server/auth/session";
import { getAppUrl } from "@/lib/env";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing", getAppUrl()));
  }

  const user = await consumeMagicToken(token);
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid", getAppUrl()));
  }

  await setSessionCookie({
    email: user.email,
    role: user.role,
  });

  const destination = user.role === "admin" ? "/admin" : "/account";
  return NextResponse.redirect(new URL(destination, getAppUrl()));
}
