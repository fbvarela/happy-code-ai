-- Add github_repo column to artifacts table for optional repo association
-- Format: "owner/name", nullable (NULL means no repo associated)
-- This column has no CHECK constraint — the app trusts the repo picker UI.

ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS github_repo text;