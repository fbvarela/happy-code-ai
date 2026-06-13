import { createRenderer } from "@/lib/renderers/base";

/** Destination path for a Gemini CLI artifact. Gemini centers on GEMINI.md
 *  context + custom commands (.gemini/commands/<n>.toml, raw TOML) + a single
 *  .gemini/settings.json (which also holds mcpServers). Agent/skill have no
 *  native concept, so they land as context markdown under .gemini/. */
function pathFor(type, slug) {
  switch (type) {
    case "memory":
      return slug === "gemini" || slug === "memory" || slug === "agents"
        ? "GEMINI.md"
        : `.gemini/${slug}.md`;
    case "command":
      return `.gemini/commands/${slug}.toml`;
    case "agent":
    case "subagent":
    case "skill":
      return `.gemini/${slug}.md`;
    case "mcp":
    case "config_snippet":
      return ".gemini/settings.json";
    default:
      return `.gemini/${slug}.md`;
  }
}

export const geminiRenderer = createRenderer({
  target: "gemini",
  pathFor,
  // Gemini commands are TOML, not Markdown — emit the body raw.
  markdownTypes: ["agent", "subagent", "skill", "memory"],
});
