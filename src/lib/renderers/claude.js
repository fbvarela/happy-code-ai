import { createRenderer } from "@/lib/renderers/base";

/** Destination path for a Claude Code artifact.
 *  Conventions: .claude/agents, .claude/commands, .claude/skills/<n>/SKILL.md,
 *  CLAUDE.md for project memory, .mcp.json for MCP servers, .claude/settings.json. */
function pathFor(type, slug) {
  switch (type) {
    case "agent":
    case "subagent":
      return `.claude/agents/${slug}.md`;
    case "skill":
      return `.claude/skills/${slug}/SKILL.md`;
    case "command":
      return `.claude/commands/${slug}.md`;
    case "memory":
      return slug === "claude" || slug === "memory" || slug === "agents"
        ? "CLAUDE.md"
        : `.claude/memory/${slug}.md`;
    case "mcp":
      return ".mcp.json";
    case "config_snippet":
      return ".claude/settings.json";
    default:
      return `${slug}.md`;
  }
}

export const claudeRenderer = createRenderer({ target: "claude", pathFor });
