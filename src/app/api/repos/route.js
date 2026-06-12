import { requireAuth } from "@/utils/auth";
import { octokitForUser } from "@/lib/github";

/** GET /api/repos — the user's repositories (for choosing a publish target). */
export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const octokit = await octokitForUser(session.userId);
    const { data } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: "updated",
    });
    return Response.json(
      data.map((r) => ({
        full_name: r.full_name,
        default_branch: r.default_branch,
        private: r.private,
        permissions: r.permissions,
      })),
    );
  } catch (err) {
    console.error("list repos failed:", err);
    return Response.json({ error: "Could not list repos", message: String(err.message || err) }, { status: 502 });
  }
}
