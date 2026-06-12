-- Support multi-file artifacts (e.g. a skill = SKILL.md + helper files).
-- `files` holds EXTRA files; the primary file stays in body_template/frontmatter.
-- Each entry: { "path": "relative/to/artifact/dir", "body_template": "..." }.
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS files jsonb NOT NULL DEFAULT '[]'::jsonb;
