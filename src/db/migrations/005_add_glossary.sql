-- AI Glossary — per-user manually-added terms. The curated baseline lives in
-- src/lib/glossary.js (static, 0-token). Definitions are generated once by Groq
-- (see src/lib/glossary-generator.js) and cached here.
CREATE TABLE IF NOT EXISTS glossary_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  term        text NOT NULL,
  category    text NOT NULL DEFAULT 'concept',
  definition  text NOT NULL DEFAULT '',
  aliases     text[] NOT NULL DEFAULT '{}',
  links       jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_glossary_user ON glossary_entries(user_id);
