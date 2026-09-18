// Memory file paths per target CLI and markdown section parsing.
// Pure data — safe to import from server AND client.

export const MEMORY_PATHS = {
  opencode: { root: "AGENTS.md", dir: ".opencode/memory", ext: ".md" },
  claude:   { root: "CLAUDE.md", dir: ".claude/memory",   ext: ".md" },
  cursor:   { root: "AGENTS.md", dir: ".cursor/rules",    ext: ".mdc" },
  gemini:   { root: "GEMINI.md", dir: ".gemini",           ext: ".md" },
  junie:    { root: "AGENTS.md", dir: ".junie/memory",     ext: ".md" },
};

// Targets that share the same root file.
export const SHARED_ROOTS = { "AGENTS.md": ["opencode", "cursor", "junie"] };

// ── Path matching (module-aware) ──
// A repo may be a Maven/Gradle multi-module project with per-module memory
// files (e.g. "service-a/CLAUDE.md"), not just one at the repo root. These
// helpers classify a path as belonging to a given target's root or named
// memory convention, returning which "module" (subdirectory, "" = repo root)
// it lives under. Shared by the scan API route and the UI so both agree on
// what counts as a memory file.

/** If `path` is `root` (repo root) or `<module>/root`, return the module
 *  ("" for repo root); otherwise null. */
export function matchRootPath(path, root) {
  if (path === root) return "";
  if (path.endsWith("/" + root)) return path.slice(0, -(root.length + 1));
  return null;
}

/** If `path` is a named memory file directly inside `<module>/<dir>/`,
 *  return { module, slug }; otherwise null. */
export function matchNamedPath(path, dir, ext) {
  const marker = dir + "/";
  const idx = path.indexOf(marker);
  if (idx === -1 || (idx !== 0 && path[idx - 1] !== "/")) return null;
  const rest = path.slice(idx + marker.length);
  if (!rest.endsWith(ext) || rest.includes("/")) return null;
  return { module: path.slice(0, idx).replace(/\/$/, ""), slug: rest.slice(0, -ext.length) };
}

/** Resolve which target (from `targets`) + module a path belongs to, using
 *  `memoryPaths` (a MEMORY_PATHS-shaped map). Returns null if no match. */
export function resolveMemoryPath(path, targets, memoryPaths) {
  for (const target of targets) {
    const paths = memoryPaths[target];
    const rootModule = matchRootPath(path, paths.root);
    if (rootModule !== null) return { target, module: rootModule, isRoot: true, slug: null };
    const named = matchNamedPath(path, paths.dir, paths.ext);
    if (named) return { target, module: named.module, isRoot: false, slug: named.slug };
  }
  return null;
}

/** Server-side allowlist for /api/memory/publish: a path is publishable only
 *  if it matches this app's own memory conventions — the same rule the scan
 *  route uses. Derived from resolveMemoryPath so the two can never drift.
 *  (Run AFTER safeRepoPath; this restricts to convention paths, traversal is
 *  already excluded there.) */
export function isPublishableMemoryPath(path) {
  return resolveMemoryPath(path, Object.keys(MEMORY_PATHS), MEMORY_PATHS) !== null;
}

export function parseMemorySections(markdown) {
  const lines = (markdown || "").split("\n");
  const sections = [];
  let current = { heading: null, lines: [] };

  for (const line of lines) {
    if (/^## /.test(line)) {
      sections.push(current);
      current = { heading: line.replace(/^## /, "").trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);

  return sections.map((s) => ({
    heading: s.heading,
    content: s.lines.join("\n").replace(/^\n+/, "").replace(/\n+$/, ""),
  }));
}

export function renderSections(sections) {
  return sections
    .map((s) =>
      s.heading ? `## ${s.heading}\n\n${s.content}` : s.content,
    )
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd() + "\n";
}
