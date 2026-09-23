import { z } from "zod";
import sql from "@/utils/db";
import { ARTIFACT_TYPES } from "@/lib/artifact-types";
import { safeRepoPath } from "@/lib/safe-path";

export { ARTIFACT_TYPES };

// Model-drafted drafts (especially local models and Agnes) send variable
// label/default as numbers, booleans or nested objects, and required as
// "true"/"false" strings. Coerce to the stored shape instead of rejecting the
// whole save — same policy as the cloud generator's coerceVarValue.
const coerceStr = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

export const variableSchema = z.object({
  name: z.preprocess(coerceStr, z.string().min(1).max(60)),
  label: z.preprocess(coerceStr, z.string().max(120)).optional().default(""),
  default: z.preprocess(coerceStr, z.string()).optional().default(""),
  required: z
    .preprocess((v) => (typeof v === "string" ? v === "true" : !!v), z.boolean())
    .optional()
    .default(false),
});

// Extra files committed alongside the primary (e.g. a skill's helper scripts).
// `path` is relative to the artifact's directory; `body_template` is Handlebars.
// The path must sanitize cleanly — rejects traversal (../), absolute paths and
// control chars at validation time, so unsafe paths never reach the DB.
export const fileSchema = z.object({
  path: z
    .string()
    .min(1)
    .max(200)
    .refine((p) => safeRepoPath(p) !== null, {
      message: "path must be a safe relative path (no '..', absolute paths or control chars)",
    }),
  body_template: z.string().default(""),
});

/** Validation schema for create/update payloads. */
export const artifactInput = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(ARTIFACT_TYPES),
  target: z.string().min(1).max(40).default("opencode"),
  frontmatter: z.record(z.any()).default({}),
  body_template: z.string().default(""),
  variables: z.array(variableSchema).default([]),
  files: z.array(fileSchema).default([]),
  tags: z
    .preprocess(
      (t) => (Array.isArray(t) ? t : typeof t === "string" ? t.split(",").map((s) => s.trim()).filter(Boolean) : []),
      z.array(z.preprocess(coerceStr, z.string().min(1).max(40))),
    )
    .default([]),
  // z.string().optional().default(null) rejects BOTH null and missing in zod 3.x
  // (the default itself is validated) — accept null/undefined explicitly.
  github_repo: z.string().nullable().optional().default(null),
});

/** Append a snapshot of the current state to artifact_versions. */
export async function snapshotVersion(artifact) {
  await sql`
    INSERT INTO artifact_versions (artifact_id, version, frontmatter, body_template)
    VALUES (${artifact.id}, ${artifact.version},
            ${JSON.stringify(artifact.frontmatter)}::jsonb, ${artifact.body_template})`;
}
