// Pure metadata about supported target CLIs — safe to import from server AND
// client (no DB / renderer import here). Keep in sync with the renderer
// registry in src/lib/renderers/index.js.

export const TARGETS = ["opencode", "claude", "cursor", "gemini"];

export const TARGET_LABELS = {
  opencode: "OpenCode",
  claude: "Claude Code",
  cursor: "Cursor",
  gemini: "Gemini CLI",
};
