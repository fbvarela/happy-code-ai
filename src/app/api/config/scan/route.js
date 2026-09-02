import { requireAuth } from "@/utils/auth";
import { octokitForUser } from "@/lib/github";
import { TARGETS } from "@/lib/targets";
import { getConfigPathsForTarget, getGlobalConfigPaths, CONFIG_PATHS } from "@/lib/config-paths";

/** POST /api/config/scan — scan a GitHub repo for AI config files across all targets. */
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

    // Build a set of all known config paths across all targets + globals.
    const knownPaths = new Set();
    for (const target of TARGETS) {
      for (const p of getConfigPathsForTarget(target)) {
        knownPaths.add(p);
      }
    }
    for (const p of getGlobalConfigPaths()) {
      knownPaths.add(p);
    }

    // Collect MCP dir prefixes for wildcard matching.
    const mcpPathPrefixes = [];
    for (const target of TARGETS) {
      const mcpDir = CONFIG_PATHS[target]?.mcpDir;
      if (mcpDir) mcpPathPrefixes.push(mcpDir);
    }

    const matches = [];
    for (const entry of blobs) {
      // Exact known paths
      if (knownPaths.has(entry.path)) {
        const target = TARGETS.find((t) => getConfigPathsForTarget(t).includes(entry.path));
        matches.push({ path: entry.path, sha: entry.sha, target: target || null, isMcp: entry.path.includes("/mcp") || entry.path === ".mcp.json" });
        continue;
      }
      // MCP dir files (wildcard)
      for (const prefix of mcpPathPrefixes) {
        if (entry.path.startsWith(prefix + "/")) {
          const target = TARGETS.find((t) => CONFIG_PATHS[t]?.mcpDir === prefix);
          matches.push({ path: entry.path, sha: entry.sha, target: target || null, isMcp: true });
          break;
        }
      }
    }

    // Fetch content for each unique sha.
    const contentBySha = new Map();
    await Promise.all(
      [...new Set(matches.map((m) => m.sha))].map(async (sha) => {
        const { data } = await octokit.git.getBlob({ owner, repo: repoName, file_sha: sha });
        contentBySha.set(sha, Buffer.from(data.content, "base64").toString("utf8"));
      }),
    );

    const files = matches.map((m) => ({ ...m, content: contentBySha.get(m.sha) }));

    return Response.json({ files, branch });
  } catch (err) {
    console.error("config scan failed:", err);
    return Response.json(
      { error: "Scan failed", message: String(err.message || err) },
      { status: 502 },
    );
  }
}
