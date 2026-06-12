import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

// Paths reachable without a session.
const PUBLIC_PATHS = ["/login", "/api/auth", "/offline"];

function toLogin(request, reason) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  if (reason) loginUrl.searchParams.set("error", reason);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // A missing/short SESSION_SECRET (e.g. env var not set on the host) makes
  // iron-session throw. Don't let that 500 the whole site — surface it as an
  // unauthenticated redirect instead of MIDDLEWARE_INVOCATION_FAILED.
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    console.error("SESSION_SECRET is missing or too short (need ≥32 chars).");
    return toLogin(request, "server_misconfigured");
  }

  let session;
  try {
    session = await getIronSession(request.cookies, sessionOptions);
  } catch (err) {
    console.error("Session read failed in middleware:", err);
    return toLogin(request);
  }

  if (!session.userId) {
    return toLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
