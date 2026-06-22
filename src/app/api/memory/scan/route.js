import { requireAuth } from "@/utils/auth";
import { octokitForUser } from "@/lib/github";
import { TARGETS } from "@/lib/targets";
import { MEMORY_PATHS } from "@/lib/memory-paths";

async function fetchFile(octokit, owner, repo, path, ref) {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path, ref });
    if (data.type !== "file") return null;
    return {
      path,
      content: Buffer.from(data.content, "base64").toString("utf8"),
      sha: data.sha,
    };
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

async function listDir(octokit, owner, repo, dir, ext, ref) {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path: dir, ref });
    if (!Array.isArray(data)) return [];
    return data
      .filter((f) => f.type === "file" && f.name.endsWith(ext))
      .map((f) => ({ path: f.path, name: f.name }));
  } catch (e) {
    if (e.status === 404) return [];
    throw e;
  }
}

/** POST /api/memory/scan — scan a GitHub repo for memory files across all targets. */
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

    const seen = new Set();
    const files = [];

    for (const target of TARGETS) {
      const paths = MEMORY_PATHS[target];

      // Root file (skip if already fetched for a shared root like AGENTS.md)
      if (!seen.has(paths.root)) {
        seen.add(paths.root);
        const root = await fetchFile(octokit, owner, repoName, paths.root, branch);
        if (root) {
          files.push({ target, ...root, isRoot: true });
        }
      } else {
        const existing = files.find((f) => f.path === paths.root);
        if (existing) {
          files.push({ ...existing, target });
        }
      }

      // Named memory files in directory
      const entries = await listDir(octokit, owner, repoName, paths.dir, paths.ext, branch);
      for (const entry of entries) {
        if (seen.has(entry.path)) continue;
        seen.add(entry.path);
        const file = await fetchFile(octokit, owner, repoName, entry.path, branch);
        if (file) {
          const slug = entry.name.replace(/\.[^.]+$/, "");
          files.push({ target, ...file, isRoot: false, slug });
        }
      }
    }

    return Response.json({ files, branch });
  } catch (err) {
    console.error("memory scan failed:", err);
    return Response.json(
      { error: "Scan failed", message: String(err.message || err) },
      { status: 502 },
    );
  }
}
