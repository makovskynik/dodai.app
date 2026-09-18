import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/server/auth/session";
import { getAppUrl } from "@/lib/env";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", getAppUrl()), 303);
}
