import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "dodai_session";

function secretKey() {
  const secret =
    process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16
      ? process.env.AUTH_SECRET
      : "dodai-dev-auth-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth =
    pathname.startsWith("/admin") || pathname.startsWith("/account");

  if (!needsAuth) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (pathname.startsWith("/admin")) {
      const email = String(payload.email ?? "").toLowerCase();
      const admins = (process.env.ADMIN_EMAILS ?? "admin@dodai.app")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
      const isAdmin = payload.role === "admin" || admins.includes(email);
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/account", request.url));
      }
    }
    return NextResponse.next();
  } catch {
    const login = new URL("/login", request.url);
    return NextResponse.redirect(login);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
