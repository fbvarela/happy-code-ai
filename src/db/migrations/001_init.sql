-- Agent Artifact Manager — initial schema
-- Run with: npm run db:migrate

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users authenticated via GitHub OAuth. The access_token is stored encrypted
-- at rest (AES-256-GCM, see src/lib/crypto.js) and is used both for login
-- identity and for committing artifacts to the user's repositories.
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id     bigint UNIQUE NOT NULL,
  github_login  text NOT NULL,
  name          text,
  avatar_url    text,
  access_token  text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Artifacts: agents, subagents, skills, config snippets. The body is a
-- Handlebars template; `variables` declares the holes the UI fills in
-- (zero LLM tokens). `frontmatter` is flexible per target CLI.
CREATE TABLE IF NOT EXISTS artifacts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name           text NOT NULL,
  type           text NOT NULL CHECK (type IN ('agent','subagent','skill','config_snippet')),
  target         text NOT NULL DEFAULT 'opencode',
  frontmatter    jsonb NOT NULL DEFAULT '{}'::jsonb,
  body_template  text NOT NULL DEFAULT '',
  variables      jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags           text[] NOT NULL DEFAULT '{}',
  version        int NOT NULL DEFAULT 1,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artifacts_user ON artifacts(user_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_tags ON artifacts USING gin(tags);

-- Append-only version history (snapshot on each change).
CREATE TABLE IF NOT EXISTS artifact_versions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id    uuid NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  version        int NOT NULL,
  frontmatter    jsonb NOT NULL,
  body_template  text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artifact_versions_artifact ON artifact_versions(artifact_id);
