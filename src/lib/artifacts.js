import { z } from "zod";
import sql from "@/utils/db";
import { ARTIFACT_TYPES } from "@/lib/artifact-types";

export { ARTIFACT_TYPES };

export const variableSchema = z.object({
  name: z.string().min(1).max(60),
  label: z.string().max(120).optional().default(""),
  default: z.string().optional().default(""),
  required: z.boolean().optional().default(false),
});

// Extra files committed alongside the primary (e.g. a skill's helper scripts).
// `path` is relative to the artifact's directory; `body_template` is Handlebars.
export const fileSchema = z.object({
  path: z.string().min(1).max(200),
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
  tags: z.array(z.string().min(1).max(40)).default([]),
});

/** Append a snapshot of the current state to artifact_versions. */
export async function snapshotVersion(artifact) {
  await sql`
    INSERT INTO artifact_versions (artifact_id, version, frontmatter, body_template)
    VALUES (${artifact.id}, ${artifact.version},
            ${JSON.stringify(artifact.frontmatter)}::jsonb, ${artifact.body_template})`;
}
