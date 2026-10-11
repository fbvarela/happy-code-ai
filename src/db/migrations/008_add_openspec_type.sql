-- Add 'openspec' (OpenSpec change proposals) to the allowed artifact types.
-- Without this the DB CHECK constraint rejected the insert, so creating/saving
-- or cloning an openspec artifact failed server-side.
ALTER TABLE artifacts DROP CONSTRAINT IF EXISTS artifacts_type_check;
ALTER TABLE artifacts ADD CONSTRAINT artifacts_type_check
  CHECK (type IN ('agent', 'subagent', 'skill', 'command', 'config_snippet', 'memory', 'mcp', 'openspec'));
