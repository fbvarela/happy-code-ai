import { requireAuth } from "@/utils/auth";
import { octokitForUser, commitFiles } from "@/lib/github";
import { sanitizeFilePaths } from "@/lib/safe-path";
import { isPublishableMemoryPath } from "@/lib/memory-paths";

/** POST /api/memory/publish — commit memory file changes to a GitHub repo. */
export async function POST(request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const repo = (body?.repo || "").trim();
  if (!repo.includes("/")) {
    return Response.json({ error: "repo is required (owner/name)" }, { status: 400 });
  }

  const rawFiles = body?.files;
  if (!Array.isArray(rawFiles) || !rawFiles.length) {
    return Response.json({ error: "files array is required" }, { status: 400 });
  }

  // Reject path traversal / absolute paths before anything touches GitHub.
  const { files, error: badPath } = sanitizeFilePaths(rawFiles);
  if (badPath !== undefined) {
    return Response.json({ error: "Unsafe file path", path: badPath }, { status: 400 });
  }

  // Allowlist: only paths matching this app's memory conventions may be
  // committed (same rule the scan route uses) — blocks writing to arbitrary
  // locations like .github/workflows or README.md even with a valid format.
  const offConventions = files.find((f) => !isPublishableMemoryPath(f.path));
  if (offConventions) {
    return Response.json(
      { error: "Path is not a recognized agent memory location", path: offConventions.path },
      { status: 400 },
    );
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
