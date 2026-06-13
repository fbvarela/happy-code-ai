import { createRenderer } from "@/lib/renderers/base";

/** Destination path for a Cursor artifact. Cursor's model is "rules"
 *  (.cursor/rules/<n>.mdc, frontmatter + markdown), so agent/skill/command all
 *  collapse to rules. MCP is .cursor/mcp.json; Cursor also reads AGENTS.md. */
function pathFor(type, slug) {
  switch (type) {
    case "agent":
    case "subagent":
    case "skill":
    case "command":
      return `.cursor/rules/${slug}.mdc`;
    case "memory":
      return slug === "agents" ? "AGENTS.md" : `.cursor/rules/${slug}.mdc`;
    case "mcp":
      return ".cursor/mcp.json";
    case "config_snippet":
      return `.cursor/${slug}.json`;
    default:
      return `.cursor/rules/${slug}.mdc`;
  }
}

export const cursorRenderer = createRenderer({ target: "cursor", pathFor });
