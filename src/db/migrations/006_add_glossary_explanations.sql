-- Per-user, per-term saved extended explanations for the glossary detail page.
-- `term_key` is the entry id: a seed slug (e.g. 'transformer') or a user-entry
-- uuid. A row exists once a user generates or edits an explanation; without one
-- the detail page generates a fresh explanation with Groq on demand.
CREATE TABLE IF NOT EXISTS glossary_explanations (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  term_key    text NOT NULL,
  explanation text NOT NULL DEFAULT '',
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, term_key)
);
