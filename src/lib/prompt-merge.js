// Merge a user-provided system-prompt override into the built-in base prompt.
//
// Security/robustness rule (audit §1.2): client-supplied overrides are appended
// AFTER the base rules — never replacing them — so the quality gate and the
// structured-output requirement can't be silently disabled by localStorage
// state or an accidental paste. The override is also length-capped so it can't
// blow up the prompt (or the cache prefix).

const MAX_OVERRIDE_CHARS = 4000; // ~1k tokens of extra instructions, plenty for customization

const MERGE_MARKER = [
  "",
  "",
  "--- Additional user-provided instructions (apply on top of the rules above; if anything conflicts, the rules above win) ---",
  "",
].join("\n");

const TRUNCATION_NOTE = "\n[user instructions truncated]";

/** Collapse runs of whitespace to keep the merged prompt tidy? No — the
 *  override may legitimately use indentation (e.g. YAML examples). Only trim
 *  the outer edges and normalize line endings. */
function cleanOverride(raw) {
  return String(raw).replace(/\r\n?/g, "\n").trim();
}

/** Cap the override length, preferring a line boundary over a mid-word cut. */
function capOverride(text, cap) {
  if (text.length <= cap) return text;
  const slice = text.slice(0, cap);
  const lastNewline = slice.lastIndexOf("\n");
  return (lastNewline > cap * 0.5 ? slice.slice(0, lastNewline) : slice).trimEnd() + TRUNCATION_NOTE;
}

/** Append `override` after `basePrompt`. If the override is missing, blank or
 *  not a string, the base prompt is returned unchanged. Pure function. */
export function mergeSystemPrompt(basePrompt, override, { cap = MAX_OVERRIDE_CHARS } = {}) {
  if (typeof override !== "string") return basePrompt;
  const cleaned = cleanOverride(override);
  if (!cleaned) return basePrompt;
  return basePrompt + MERGE_MARKER + capOverride(cleaned, cap);
}
