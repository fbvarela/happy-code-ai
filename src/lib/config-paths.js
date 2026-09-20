// Config file paths per target CLI.
// Pure data — safe to import from server AND client.

export const CONFIG_PATHS = {
  opencode: { settings: "opencode.json", mcpDir: ".opencode/mcp" },
  claude:   { settings: ".claude/settings.json" },
  cursor:   { settings: ".cursor/settings.json", mcp: ".cursor/mcp.json" },
  gemini:   { settings: ".gemini/settings.json" },
  junie:    { settings: ".junie/config.json", mcp: ".junie/mcp/mcp.json" },
};

// Root-level config files that apply across targets.
export const GLOBAL_CONFIG_PATHS = {
  mcp: ".mcp.json",
  // Root memory files shared across CLIs — the Config manager shows these in
  // the "Global" column so the dashboard reflects the repo's agent context.
  agents: "AGENTS.md",
  claude: "CLAUDE.md",
  gemini: "GEMINI.md",
};

/** Known config file paths to look for, grouped by target. */
export function getConfigPathsForTarget(target) {
  const paths = [];
  const c = CONFIG_PATHS[target];
  if (c?.settings) paths.push(c.settings);
  if (c?.mcp) paths.push(c.mcp);
  return paths;
}

/** Known global config file paths. */
export function getGlobalConfigPaths() {
  return Object.values(GLOBAL_CONFIG_PATHS);
}

/** Server-side allowlist for /api/config/publish: a path is publishable only
 *  if it is one of the exact known config paths (any target or global), or a
 *  file inside a target's MCP dir — the same rules the scan route uses.
 *  Derived from the same pure-data maps so the two can never drift.
 *  (Run AFTER safeRepoPath; this restricts to convention paths, traversal is
 *  already excluded there.) */
export function isPublishableConfigPath(path) {
  for (const target of Object.keys(CONFIG_PATHS)) {
    if (getConfigPathsForTarget(target).includes(path)) return true;
  }
  if (getGlobalConfigPaths().includes(path)) return true;
  return Object.values(CONFIG_PATHS).some(
    (c) => c.mcpDir && path.startsWith(c.mcpDir + "/"),
  );
}
