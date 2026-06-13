-- Add 'command' (slash command) to the allowed artifact types.
ALTER TABLE artifacts DROP CONSTRAINT IF EXISTS artifacts_type_check;
ALTER TABLE artifacts ADD CONSTRAINT artifacts_type_check
  CHECK (type IN ('agent', 'subagent', 'skill', 'command', 'config_snippet', 'memory', 'mcp'));
