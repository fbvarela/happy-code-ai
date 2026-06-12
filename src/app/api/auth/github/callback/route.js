import { NextResponse } from "next/server";
import { exchangeCodeForToken, octokitFor } from "@/lib/github";
import { getSession } from "@/lib/session";
import { encrypt } from "@/lib/crypto";
import sql from "@/utils/db";

/** GitHub OAuth callback: verify state, exchange code, upsert user, open session. */
export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.cookies.get("gh_oauth_state")?.value;
  const next = request.cookies.get("gh_oauth_next")?.value || "/";

  const fail = (reason) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, request.url));

  if (!code || !state || state !== cookieState) return fail("oauth_state");

  try {
    const redirectUri =
      process.env.GITHUB_OAUTH_REDIRECT ||
      new URL("/api/auth/github/callback", request.url).toString();

    const token = await exchangeCodeForToken({ code, redirectUri });

    // Identify the user.
    const octokit = octokitFor(token);
    const { data: gh } = await octokit.rest.users.getAuthenticated();

    // Upsert by github_id; (re)store the encrypted token.
    const encrypted = encrypt(token);
    const rows = await sql`
      INSERT INTO users (github_id, github_login, name, avatar_url, access_token)
      VALUES (${gh.id}, ${gh.login}, ${gh.name}, ${gh.avatar_url}, ${encrypted})
      ON CONFLICT (github_id) DO UPDATE
        SET github_login = EXCLUDED.github_login,
            name         = EXCLUDED.name,
            avatar_url   = EXCLUDED.avatar_url,
            access_token = EXCLUDED.access_token,
            updated_at   = now()
      RETURNING id`;

    const session = await getSession();
    session.userId = rows[0].id;
    session.githubId = gh.id;
    session.githubLogin = gh.login;
    session.name = gh.name;
    session.avatarUrl = gh.avatar_url;
    await session.save();

    const res = NextResponse.redirect(new URL(next, request.url));
    res.cookies.delete("gh_oauth_state");
    res.cookies.delete("gh_oauth_next");
    return res;
  } catch (err) {
    console.error("GitHub OAuth callback failed:", err);
    return fail("oauth_failed");
  }
}
