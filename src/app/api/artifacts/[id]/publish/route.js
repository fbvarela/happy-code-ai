import { requireAuth } from "@/utils/auth";
import sql from "@/utils/db";
import { octokitForUser, commitFiles } from "@/lib/github";
import { getRenderer } from "@/lib/renderers";

/** POST /api/artifacts/:id/publish
 *  body: { repo: "owner/name", path?, message?, branch?, values? }
 *  Commits the rendered artifact via the GitHub Contents API (no clone). */
export async function POST(request, { params }) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const repo = (body?.repo || "").trim();
  if (!repo.includes("/")) {
    return Response.json({ error: "repo must be 'owner/name'" }, { status: 400 });
  }
  const [owner, repoName] = repo.split("/");

  const rows = await sql`SELECT * FROM artifacts WHERE id = ${id} AND user_id = ${session.userId}`;
  if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });
  const artifact = rows[0];

  const renderer = getRenderer(artifact.target);
  const { files: rendered } = renderer.render(artifact, body?.values || {});
  // Optional override applies to the primary file path only.
  const files = body?.path
    ? [{ ...rendered[0], path: body.path.replace(/^\/+/, "") }, ...rendered.slice(1)]
    : rendered;
  const branch = body?.branch || undefined;
  const message = body?.message || `Add ${artifact.name} (${artifact.type}) via Happy Code`;

  try {
    const octokit = await octokitForUser(session.userId);

    // Multiple files → atomic commit via Git Data API. Single file → Contents API.
    if (files.length > 1) {
      const out = await commitFiles(octokit, { owner, repo: repoName, branch, message, files });
      return Response.json({ path: files[0].path, paths: files.map((f) => f.path), branch: out.branch, commit: out.commit });
    }

    const filePath = files[0].path;
    let sha;
    try {
      const { data } = await octokit.repos.getContent({ owner, repo: repoName, path: filePath, ref: branch });
      if (!Array.isArray(data) && data.sha) sha = data.sha;
    } catch (e) {
      if (e.status !== 404) throw e; // 404 = new file, fine
    }
    const res = await octokit.repos.createOrUpdateFileContents({
      owner, repo: repoName, path: filePath, message,
      content: Buffer.from(files[0].content, "utf8").toString("base64"),
      sha, branch,
    });
    return Response.json({
      path: filePath, branch: branch || null,
      commit: res.data.commit?.html_url, contentUrl: res.data.content?.html_url,
    });
  } catch (err) {
    console.error("publish failed:", err);
    const status = err.status === 409 ? 409 : 502;
    return Response.json({ error: "Publish failed", message: String(err.message || err) }, { status });
  }
}
