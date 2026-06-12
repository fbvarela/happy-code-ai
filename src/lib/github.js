import { Octokit } from "@octokit/rest";
import sql from "@/utils/db";
import { decrypt } from "@/lib/crypto";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

/** Build the GitHub OAuth authorize URL. Scope `repo` is required so the app
 *  can write artifact files to the user's repositories. */
export function buildAuthorizeUrl({ redirectUri, state }) {
  const url = new URL(GITHUB_AUTHORIZE_URL);
  url.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "repo read:user user:email");
  url.searchParams.set("state", state);
  return url.toString();
}

/** Exchange an OAuth `code` for an access token. */
export async function exchangeCodeForToken({ code, redirectUri }) {
  const res = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });
  const data = await res.json();
  if (data.error || !data.access_token) {
    throw new Error(data.error_description || "Failed to obtain GitHub token");
  }
  return data.access_token;
}

/** Octokit client for a given (plaintext) token. */
export function octokitFor(token) {
  return new Octokit({ auth: token });
}

/** Octokit client for a logged-in user id, decrypting their stored token. */
export async function octokitForUser(userId) {
  const rows = await sql`SELECT access_token FROM users WHERE id = ${userId}`;
  if (!rows.length) throw new Error("User not found");
  return octokitFor(decrypt(rows[0].access_token));
}
