-- Add 'memory' and 'mcp' to the allowed artifact types.
ALTER TABLE artifacts DROP CONSTRAINT IF EXISTS artifacts_type_check;
ALTER TABLE artifacts ADD CONSTRAINT artifacts_type_check
  CHECK (type IN ('agent', 'subagent', 'skill', 'config_snippet', 'memory', 'mcp'));
