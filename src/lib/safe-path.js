// Repo file-path sanitizer shared by the publish/render paths (audit §1.1:
// path injection via body.path / files[].path). Pure data-in/data-out — safe
// to import from server AND client.

const MAX_PATH_LENGTH = 512;

/** Normalize + validate a repo-relative file path (POSIX, GitHub-style).
 *  Returns the cleaned path, or null when the path is unsafe/invalid.
 *
 *  Rejects: absolute paths, backslashes, `..` traversal (before or after
 *  normalization), empty/dot-only paths, control characters (incl. NUL) and
 *  overlong paths. Leading slashes and single `.` segments are tolerated and
 *  stripped; repeated slashes are collapsed — matching what the UI/DB store.
 */
export function safeRepoPath(input, { maxLength = MAX_PATH_LENGTH } = {}) {
  if (typeof input !== "string") return null;
  if (/[\u0000-\u001f\u007f]/.test(input)) return null; // control chars
  if (input.includes("\\")) return null; // Windows separators / escape tricks

  const cleaned = input
    .replace(/^\/+/, "") // tolerate a leading slash (existing UI behavior)
    .split("/")
    .filter((seg) => seg !== "" && seg !== ".")
    .join("/");

  if (!cleaned) return null;
  if (cleaned.length > maxLength) return null;
  if (cleaned.split("/").some((seg) => seg === "..")) return null; // traversal
  return cleaned;
}

/** Validate + clean every file path in a [{ path, content }] publish payload.
 *  Returns { files } with sanitized paths, or { error } = the offending input
 *  path so the caller can answer 400 with a precise message. */
export function sanitizeFilePaths(files) {
  const out = [];
  for (const f of Array.isArray(files) ? files : []) {
    const p = safeRepoPath(f?.path);
    if (!p) return { error: f?.path };
    out.push({ ...f, path: p, content: typeof f.content === "string" ? f.content : "" });
  }
  return { files: out };
}
