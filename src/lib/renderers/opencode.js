import { renderTemplate } from "@/lib/render";

const MARKDOWN_TYPES = new Set(["agent", "subagent", "skill", "memory"]);

function slugify(name) {
  return String(name || "artifact")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "artifact";
}

function yamlValue(v) {
  if (Array.isArray(v)) return `[${v.map((x) => JSON.stringify(x)).join(", ")}]`;
  if (typeof v === "string") return /[:#\n]/.test(v) ? JSON.stringify(v) : v;
  return String(v);
}

function frontmatterBlock(frontmatter) {
  const entries = Object.entries(frontmatter || {});
  if (!entries.length) return "";
  return `---\n${entries.map(([k, v]) => `${k}: ${yamlValue(v)}`).join("\n")}\n---\n\n`;
}

/** Destination path in the repo for an OpenCode artifact of this type. */
function pathFor(type, name) {
  const slug = slugify(name);
  switch (type) {
    case "agent":
    case "subagent":
      return `.opencode/agent/${slug}.md`;
    case "skill":
      return `.opencode/skill/${slug}/SKILL.md`;
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

function dirOf(p) {
  const i = p.lastIndexOf("/");
  return i === -1 ? "" : p.slice(0, i);
}

export const opencodeRenderer = {
  target: "opencode",
  /** render(artifact, values) -> { files: [{path, content}], path, content }
   *  `path`/`content` are the primary file (back-compat); `files` includes it
   *  plus any extra files (artifact.files), placed relative to the primary's dir. */
  render(artifact, values = {}) {
    const body = renderTemplate(artifact.body_template, artifact.variables, values);
    const content = MARKDOWN_TYPES.has(artifact.type)
      ? frontmatterBlock(artifact.frontmatter) + body
      : body; // mcp / config_snippet are raw JSON
    const primaryPath = pathFor(artifact.type, artifact.name);

    const files = [{ path: primaryPath, content }];
    const baseDir = dirOf(primaryPath);
    for (const f of artifact.files || []) {
      if (!f || !f.path) continue;
      const rel = String(f.path).replace(/^\/+/, "");
      const full = baseDir ? `${baseDir}/${rel}` : rel;
      files.push({ path: full, content: renderTemplate(f.body_template, artifact.variables, values) });
    }

    return { files, path: primaryPath, content };
  },
};
