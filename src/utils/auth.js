import { getSession } from "@/lib/session";

/**
 * Returns { session } or { error: Response }.
 * session shape: { userId, githubId, githubLogin, name, avatarUrl }
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session.userId) {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}
