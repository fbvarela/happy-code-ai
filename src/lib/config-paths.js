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
