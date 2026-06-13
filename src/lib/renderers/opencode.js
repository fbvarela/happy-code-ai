import { createRenderer } from "@/lib/renderers/base";

/** Destination path in the repo for an OpenCode artifact of this type. */
function pathFor(type, slug) {
  switch (type) {
    case "agent":
    case "subagent":
      return `.opencode/agent/${slug}.md`;
    case "skill":
      return `.opencode/skill/${slug}/SKILL.md`;
    case "command":
      return `.opencode/command/${slug}.md`;
    case "memory":
      return slug === "agents" ? "AGENTS.md" : `.opencode/memory/${slug}.md`;
    case "mcp":
      return `.opencode/mcp/${slug}.json`;
    case "config_snippet":
      return `.opencode/${slug}.json`;
    default:
      return `${slug}.md`;
  }
}

export const opencodeRenderer = createRenderer({ target: "opencode", pathFor });
