import { requireAuth } from "@/utils/auth";
import sql from "@/utils/db";
import { octokitForUser, commitFiles } from "@/lib/github";
import { getRenderer } from "@/lib/renderers";
import { safeRepoPath } from "@/lib/safe-path";

const slug = (s) =>
  String(s || "artifact").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "artifact";

/** POST /api/artifacts/:id/test
 *  body: { repo: "owner/name", base?, openPr?, values? }
 *  Publishes the artifact to a throwaway branch (aam/test/...) so it can be
 *  tried in a real repo without touching the default branch. No execution. */
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
  // Optional override applies to the primary file path only. Validate it —
  // it's raw client input (traversal here would write outside the intended
  // artifact directory).
  let files = rendered;
  if (body?.path) {
    const overridden = safeRepoPath(body.path);
    if (!overridden) {
      return Response.json({ error: "Unsafe file path", path: body.path }, { status: 400 });
    }
    files = [{ ...rendered[0], path: overridden }, ...rendered.slice(1)];
  }
  const filePath = files[0].path;

  try {
    const octokit = await octokitForUser(session.userId);

    // Resolve the base branch (default branch unless one is given).
    let base = body?.base;
    if (!base) {
      const { data: repoData } = await octokit.repos.get({ owner, repo: repoName });
      base = repoData.default_branch;
    }
    const { data: baseRef } = await octokit.git.getRef({ owner, repo: repoName, ref: `heads/${base}` });

    // Create the test branch from the base tip.
    const testBranch = `aam/test/${slug(artifact.name)}-${Date.now()}`;
    await octokit.git.createRef({
      owner, repo: repoName, ref: `refs/heads/${testBranch}`, sha: baseRef.object.sha,
    });

    // Commit the rendered artifact (1+ files) onto the test branch.
    const message = `test: ${artifact.name} (${artifact.type}) via Happy Code`;
    if (files.length > 1) {
      await commitFiles(octokit, { owner, repo: repoName, branch: testBranch, message, files });
    } else {
      await octokit.repos.createOrUpdateFileContents({
        owner, repo: repoName, path: filePath, message,
        content: Buffer.from(files[0].content, "utf8").toString("base64"),
        branch: testBranch,
      });
    }

    // Optionally open a PR for review.
    let prUrl;
    if (body?.openPr) {
      const { data: pr } = await octokit.pulls.create({
        owner, repo: repoName, head: testBranch, base,
        title: `Test: ${artifact.name} (${artifact.type})`,
        body: `Artefacto de prueba publicado por Happy Code en \`${filePath}\`.`,
      });
      prUrl = pr.html_url;
    }

    return Response.json({ branch: testBranch, base, path: filePath, paths: files.map((f) => f.path), prUrl: prUrl || null });
  } catch (err) {
    console.error("test publish failed:", err);
    const status = err.status === 409 ? 409 : 502;
    return Response.json({ error: "Test failed", message: String(err.message || err) }, { status });
  }
}
