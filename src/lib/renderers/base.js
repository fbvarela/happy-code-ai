import { renderTemplate } from "@/lib/render";

// Types that are emitted as Markdown (YAML frontmatter + body). mcp/config are
// raw JSON; a target may override (e.g. Gemini commands are raw TOML).
export const DEFAULT_MARKDOWN_TYPES = ["agent", "subagent", "skill", "command", "memory"];

export function slugify(name) {
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

function dirOf(p) {
  const i = p.lastIndexOf("/");
  return i === -1 ? "" : p.slice(0, i);
}

/** Build a renderer for one target CLI. `pathFor(type, slug)` returns the
 *  destination path; everything else (frontmatter, extra files) is shared.
 *  render(artifact, values) -> { files: [{path, content}], path, content } */
export function createRenderer({ target, pathFor, markdownTypes = DEFAULT_MARKDOWN_TYPES }) {
  const mdSet = new Set(markdownTypes);
  return {
    target,
    render(artifact, values = {}) {
      const body = renderTemplate(artifact.body_template, artifact.variables, values);
      // openspec artifacts use a fixed path and emit raw body (format is self-contained)
      const isOpenSpec = artifact.type === "openspec";
      const content = isOpenSpec
        ? body
        : mdSet.has(artifact.type)
          ? frontmatterBlock(artifact.frontmatter) + body
          : body;
      const primaryPath = isOpenSpec
        ? `openspec/specs/${slugify(artifact.name)}.md`
        : pathFor(artifact.type, slugify(artifact.name));

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
}
