import { requireAuth } from "@/utils/auth";
import { octokitForUser } from "@/lib/github";

/** GET /api/repos/branches?repo=owner/repo — list branches for a repo. */
export async function GET(request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const repo = new URL(request.url).searchParams.get("repo");
  if (!repo || !repo.includes("/")) {
    return Response.json({ error: "Missing or invalid repo param" }, { status: 400 });
  }

  const [owner, repoName] = repo.split("/");
  try {
    const octokit = await octokitForUser(session.userId);
    const { data } = await octokit.repos.listBranches({
      owner,
      repo: repoName,
      per_page: 100,
    });
    return Response.json(data.map((b) => b.name));
  } catch (err) {
    console.error("list branches failed:", err);
    return Response.json({ error: "Could not list branches" }, { status: 502 });
  }
}
