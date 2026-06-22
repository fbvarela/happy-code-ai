// Memory file paths per target CLI and markdown section parsing.
// Pure data — safe to import from server AND client.

export const MEMORY_PATHS = {
  opencode: { root: "AGENTS.md", dir: ".opencode/memory", ext: ".md" },
  claude:   { root: "CLAUDE.md", dir: ".claude/memory",   ext: ".md" },
  cursor:   { root: "AGENTS.md", dir: ".cursor/rules",    ext: ".mdc" },
  gemini:   { root: "GEMINI.md", dir: ".gemini",           ext: ".md" },
};

// Targets that share the same root file.
export const SHARED_ROOTS = { "AGENTS.md": ["opencode", "cursor"] };

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
