import { requireAuth } from "@/utils/auth";
import { octokitForUser } from "@/lib/github";
import { TARGETS } from "@/lib/targets";
import { MEMORY_PATHS, matchRootPath, matchNamedPath } from "@/lib/memory-paths";

/** POST /api/memory/scan — recursively scan a GitHub repo for memory files
 *  across all targets, including per-module files in Maven/Gradle-style
 *  multi-module repos (e.g. "service-a/CLAUDE.md", not just the repo root). */
export async function POST(request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const repo = (body?.repo || "").trim();
  if (!repo.includes("/")) {
    return Response.json({ error: "repo is required (owner/name)" }, { status: 400 });
  }
  const [owner, repoName] = repo.split("/");

  try {
    const octokit = await octokitForUser(session.userId);

    let branch = (body?.branch || "").trim();
    if (!branch) {
      const { data } = await octokit.repos.get({ owner, repo: repoName });
      branch = data.default_branch;
    }

    const { data: ref } = await octokit.git.getRef({ owner, repo: repoName, ref: `heads/${branch}` });
    const { data: commit } = await octokit.git.getCommit({ owner, repo: repoName, commit_sha: ref.object.sha });
    const { data: tree } = await octokit.git.getTree({
      owner, repo: repoName, tree_sha: commit.tree.sha, recursive: 1,
    });

    const blobs = (tree.tree || []).filter((e) => e.type === "blob");

    // Classify every blob against every target's memory conventions, at any
    // depth in the tree (dedup by target+path since a path only ever matches
    // one target's convention once).
    const matches = new Map();
    for (const target of TARGETS) {
      const paths = MEMORY_PATHS[target];
      for (const entry of blobs) {
        const rootModule = matchRootPath(entry.path, paths.root);
        if (rootModule !== null) {
          matches.set(`${target}:${entry.path}`, {
            path: entry.path, sha: entry.sha, target, module: rootModule, isRoot: true,
          });
          continue;
        }
        const named = matchNamedPath(entry.path, paths.dir, paths.ext);
        if (named) {
          matches.set(`${target}:${entry.path}`, {
            path: entry.path, sha: entry.sha, target, module: named.module, isRoot: false, slug: named.slug,
          });
        }
      }
    }

    const entries = [...matches.values()];

    // Fetch each unique blob's content once (a shared root like AGENTS.md
    // matches multiple targets but has a single sha).
    const contentBySha = new Map();
    await Promise.all(
      [...new Set(entries.map((e) => e.sha))].map(async (sha) => {
        const { data } = await octokit.git.getBlob({ owner, repo: repoName, file_sha: sha });
        contentBySha.set(sha, Buffer.from(data.content, "base64").toString("utf8"));
      }),
    );

    const files = entries.map((m) => ({ ...m, content: contentBySha.get(m.sha) }));

    return Response.json({ files, branch });
  } catch (err) {
    console.error("memory scan failed:", err);
    return Response.json(
      { error: "Scan failed", message: String(err.message || err) },
      { status: 502 },
    );
  }
}
