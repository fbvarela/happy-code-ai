// Server-side repo context for artifact generation: fetch a repo's memory docs
// (AGENTS.md, CLAUDE.md, GEMINI.md, per-module files, …) via the GitHub API and
// format them as a compact digest for the generator's system prompt.
// Uses the same path conventions as /api/memory/scan so both agree on what
// counts as a memory file.

import { MEMORY_PATHS, matchRootPath, matchNamedPath } from "@/lib/memory-paths";

// Keep the digest token-cheap: max chars per memory file and max total digest
// size (roughly 2–3k tokens worst case). Root files matter most, so they get a
// larger budget than named per-topic memories.
const MAX_CHARS_PER_ROOT_FILE = 4000;
const MAX_CHARS_PER_NAMED_FILE = 2000;
const MAX_TOTAL_CHARS = 12000;

/** owner/name -> { owner, repo }, or null when the format is wrong. */
function parseRepo(githubRepo) {
  if (typeof githubRepo !== "string") return null;
  const m = githubRepo.trim().match(/^([\w.-]+)\/([\w.-]+)$/);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

function truncate(text, max) {
  const s = String(text || "");
  if (s.length <= max) return s;
  return `${s.slice(0, max)}\n[… truncated]`;
}

function charBudget(entry) {
  return entry.isRoot ? MAX_CHARS_PER_ROOT_FILE : MAX_CHARS_PER_NAMED_FILE;
}

/**
 * Fetch the repo's memory files and format them as a digest string for the
 * generator system prompt. Never throws — failures are reported via status so
 * the UI can tell the user what happened.
 *
 * @param {string} githubRepo "owner/name"
 * @param {Octokit} octokit  authenticated client for the artifact owner
 * @param {string} [branch]  branch to read memory docs from; empty = default branch
 * @returns {Promise<{digest: string|null, branch: string|null,
 *                     status: "loaded"|"empty"|"unavailable"}>}
 *   loaded      — memory files found and included in `digest`
 *   empty       — repo reachable but no memory files match the conventions
 *   unavailable — bad repo format, no access, unknown branch, or API failure
 */
export async function getRepoMemoryContext(githubRepo, octokit, branch = "") {
  const parsed = parseRepo(githubRepo);
  if (!parsed || !octokit) return { digest: null, branch: null, status: "unavailable" };
  const { owner, repo } = parsed;

  try {
    // Resolve the requested branch (empty = repo's default branch) to its
    // commit so the tree — and therefore the docs read — is that branch's.
    let refName = typeof branch === "string" ? branch.trim() : "";
    if (!refName) {
      const { data } = await octokit.repos.get({ owner, repo });
      refName = data.default_branch;
    }

    const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${refName}` });
    const { data: commit } = await octokit.git.getCommit({ owner, repo, commit_sha: ref.object.sha });
    const { data: tree } = await octokit.git.getTree({
      owner, repo, tree_sha: commit.tree.sha, recursive: 1,
    });

    const blobs = (tree.tree || []).filter((e) => e.type === "blob");

    // Classify blobs against every target's memory conventions (same rule as
    // /api/memory/scan; a path matches at most one entry here since we dedup
    // by path rather than target+path).
    const matches = new Map();
    for (const paths of Object.values(MEMORY_PATHS)) {
      for (const entry of blobs) {
        const rootModule = matchRootPath(entry.path, paths.root);
        if (rootModule !== null) {
          matches.set(entry.path, { path: entry.path, sha: entry.sha, isRoot: true, module: rootModule });
          continue;
        }
        const named = matchNamedPath(entry.path, paths.dir, paths.ext);
        if (named) {
          matches.set(entry.path, { path: entry.path, sha: entry.sha, isRoot: false, module: named.module, slug: named.slug });
        }
      }
    }
    if (matches.size === 0) return { digest: null, branch: refName, status: "empty" };

    // Root files first, then named ones by path — the stable order keeps the
    // prompt cacheable across retries of the same generation.
    const entries = [...matches.values()].sort((a, b) =>
      a.isRoot === b.isRoot ? a.path.localeCompare(b.path) : a.isRoot ? -1 : 1,
    );

    const parts = [];
    let total = 0;
    for (const e of entries) {
      const budget = charBudget(e);
      if (total + budget > MAX_TOTAL_CHARS && parts.length > 0) break;
      let content = "";
      try {
        const { data: blob } = await octokit.git.getBlob({ owner, repo, file_sha: e.sha });
        content = Buffer.from(blob.content, "base64").toString("utf8");
      } catch {
        continue; // blob vanished between tree and fetch — skip it
      }
      const label = e.module ? `${e.path} (module: ${e.module})` : e.path;
      const body = truncate(content, budget);
      const part = `### ${label}\n${body}`;
      parts.push(part);
      total += part.length;
    }
    if (parts.length === 0) return { digest: null, branch: refName, status: "unavailable" };
    return { digest: parts.join("\n\n"), branch: refName, status: "loaded" };
  } catch (err) {
    console.warn(`repo context unavailable for ${githubRepo}:`, err.message);
    return { digest: null, branch: null, status: "unavailable" };
  }
}
