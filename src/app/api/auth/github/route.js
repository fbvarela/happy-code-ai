import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { buildAuthorizeUrl } from "@/lib/github";

/** Kick off GitHub OAuth: set a state cookie and redirect to GitHub. */
export async function GET(request) {
  if (!process.env.GITHUB_CLIENT_ID) {
    return NextResponse.json({ error: "GitHub OAuth is not configured" }, { status: 500 });
  }

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri =
    process.env.GITHUB_OAUTH_REDIRECT ||
    new URL("/api/auth/github/callback", request.url).toString();

  const next = new URL(request.url).searchParams.get("next") || "/";

  const res = NextResponse.redirect(buildAuthorizeUrl({ redirectUri, state }));
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set("gh_oauth_state", state, { httpOnly: true, secure, sameSite: "lax", maxAge: 600, path: "/" });
  res.cookies.set("gh_oauth_next", next, { httpOnly: true, secure, sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}
