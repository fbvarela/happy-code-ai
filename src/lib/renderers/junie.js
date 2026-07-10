import { createRenderer } from "@/lib/renderers/base";

/** Destination path for a JetBrains Junie artifact.
 *  Conventions: .junie/agents (agents + subagents), .junie/skills/<n>/SKILL.md,
 *  .junie/commands (slash commands), AGENTS.md for project guidelines (shared
 *  root with OpenCode/Cursor), .junie/mcp/mcp.json, .junie/config.json. */
function pathFor(type, slug) {
  switch (type) {
    case "agent":
    case "subagent":
      return `.junie/agents/${slug}.md`;
    case "skill":
      return `.junie/skills/${slug}/SKILL.md`;
    case "command":
      return `.junie/commands/${slug}.md`;
    case "memory":
      return slug === "agents" || slug === "memory" || slug === "junie"
        ? "AGENTS.md"
        : `.junie/memory/${slug}.md`;
    case "mcp":
      return ".junie/mcp/mcp.json";
    case "config_snippet":
      return ".junie/config.json";
    default:
      return `.junie/${slug}.md`;
  }
}

export const junieRenderer = createRenderer({ target: "junie", pathFor });
