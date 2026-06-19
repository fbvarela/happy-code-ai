// Context-window limits for AI coding agents (tokens).
// "safe" = recommended max for a single artifact, leaving headroom for
// the live coding session (conversation + file context + user message).
// Sources: official docs where available; community testing otherwise.
export const AGENT_LIMITS = {
  opencode: { label: "OpenCode",       window: 200_000, safe: 40_000 },
  claude:   { label: "Claude Code",    window: 200_000, safe: 40_000 },
  cursor:   { label: "Cursor",         window: 128_000, safe: 24_000 },
  gemini:   { label: "Gemini CLI",     window: 1_000_000, safe: 100_000 },
  // Reference agents — not export targets in this app but useful for comparison.
  copilot:  { label: "GitHub Copilot", window: 64_000, safe: 12_000, referenceOnly: true }, // unconfirmed; practical ceiling for agent instructions
  codex:    { label: "Codex CLI",      window: 8_000,  safe: 2_000,  referenceOnly: true, deprecated: true },
};

// Rough chars-per-token for mixed prose/code artifact bodies (English).
// Accurate to ±20 %; good enough for a budget gauge.
export function estimateTokens(text) {
  return Math.ceil((text || "").length / 3.8);
}
