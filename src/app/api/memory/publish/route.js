import { requireAuth } from "@/utils/auth";
import { octokitForUser, commitFiles } from "@/lib/github";

/** POST /api/memory/publish — commit memory file changes to a GitHub repo. */
export async function POST(request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const repo = (body?.repo || "").trim();
  if (!repo.includes("/")) {
    return Response.json({ error: "repo is required (owner/name)" }, { status: 400 });
  }

  const files = body?.files;
  if (!Array.isArray(files) || !files.length) {
    return Response.json({ error: "files array is required" }, { status: 400 });
  }

  const [owner, repoName] = repo.split("/");
  const message = (body?.message || "").trim() ||
    "chore: update agent memory via Happy Code";

  try {
    const octokit = await octokitForUser(session.userId);
    const result = await commitFiles(octokit, {
      owner,
      repo: repoName,
      branch: (body?.branch || "").trim() || undefined,
      message,
      files: files.map((f) => ({ path: f.path, content: f.content })),
    });
    return Response.json(result);
  } catch (err) {
    console.error("memory publish failed:", err);
    return Response.json(
      { error: "Publish failed", message: String(err.message || err) },
      { status: 502 },
    );
  }
}
