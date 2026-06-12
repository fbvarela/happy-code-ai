import { requireAuth } from "@/utils/auth";
import sql from "@/utils/db";
import { octokitForUser } from "@/lib/github";
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
  const { path: defaultPath, content } = renderer.render(artifact, body?.values || {});
  const filePath = (body?.path || defaultPath).replace(/^\/+/, "");
  const branch = body?.branch || undefined;
  const message = body?.message || `Add ${artifact.name} (${artifact.type}) via Happy Code`;

  try {
    const octokit = await octokitForUser(session.userId);

    // Look up existing file sha (required to update in place).
    let sha;
    try {
      const { data } = await octokit.repos.getContent({ owner, repo: repoName, path: filePath, ref: branch });
      if (!Array.isArray(data) && data.sha) sha = data.sha;
    } catch (e) {
      if (e.status !== 404) throw e; // 404 = new file, fine
    }

    const res = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path: filePath,
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      sha,
      branch,
    });

    return Response.json({
      path: filePath,
      branch: branch || null,
      commit: res.data.commit?.html_url,
      contentUrl: res.data.content?.html_url,
    });
  } catch (err) {
    console.error("publish failed:", err);
    const status = err.status === 409 ? 409 : 502;
    return Response.json({ error: "Publish failed", message: String(err.message || err) }, { status });
  }
}
