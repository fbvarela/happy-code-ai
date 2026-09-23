// Pure metadata about artifact types — safe to import from server AND client
// (no DB import here).

export const ARTIFACT_TYPES = [
  "agent",
  "subagent",
  "skill",
  "command",
  "config_snippet",
  "memory",
  "mcp",
  "openspec",
];

export const TYPE_LABELS = {
  agent: "Agente",
  subagent: "Subagente",
  skill: "Skill",
  command: "Slash command",
  config_snippet: "Config",
  memory: "Memoria",
  mcp: "MCP",
};

// Starter scaffolds applied when creating a new artifact of a given type
// (only when the body is still empty). Bodies are Handlebars templates so the
// holes stay 0-token-fillable. The exact destination path/format per CLI is
// resolved later by the per-target renderer (Phase 2).
export const TYPE_SCAFFOLDS = {
  command: {
    frontmatter: { description: "Describe qué hace el comando" },
    body:
      "{{instruction}}\n\n" +
      "Argumentos del usuario: $ARGUMENTS\n",
    variables: [
      { name: "instruction", label: "Instrucción / prompt", default: "Escribe tests unitarios para:", required: true },
    ],
  },
  memory: {
    frontmatter: {},
    body: "# {{title}}\n\n{{content}}\n",
    variables: [
      { name: "title", label: "Título", default: "Contexto del proyecto", required: true },
      { name: "content", label: "Contenido", default: "- ", required: false },
    ],
  },
  openspec: {
    frontmatter: { feature: "", version: "1.0", status: "draft", agents: "claude-code, opencode" },
    body:
      "# {{feature}} Specification\n" +
      "<!-- version: {{version}} | status: {{status}} | agents: {{agents}} -->\n\n" +
      "## Purpose\n\n" +
      "{{purpose}}\n\n" +
      "## Requirements\n\n" +
      "### Requirement: {{requirement_1_name}}\n\n" +
      "The system SHALL {{requirement_1_statement}}.\n\n" +
      "#### Scenario: {{scenario_1_name}}\n\n" +
      "- GIVEN {{given_1}}\n" +
      "- WHEN {{when_1}}\n" +
      "- THEN {{then_1}}\n\n" +
      "### Requirement: {{requirement_2_name}}\n\n" +
      "The system SHALL {{requirement_2_statement}}.\n\n" +
      "#### Scenario: {{scenario_2_name}}\n\n" +
      "- GIVEN {{given_2}}\n" +
      "- WHEN {{when_2}}\n" +
      "- THEN {{then_2}}\n\n" +
      "### Requirement: {{requirement_3_name}}\n\n" +
      "The system SHALL {{requirement_3_statement}}.\n\n" +
      "#### Scenario: {{scenario_3_name}}\n\n" +
      "- GIVEN {{given_3}}\n" +
      "- WHEN {{when_3}}\n" +
      "- THEN {{then_3}}\n",
    variables: [
      { name: "feature", label: "Feature name", default: "User Authentication", required: true },
      { name: "version", label: "Version", default: "1.0", required: false },
      { name: "status", label: "Status", default: "draft", required: false },
      { name: "agents", label: "Target agents", default: "claude-code, opencode", required: false },
      { name: "purpose", label: "Purpose (one paragraph)", default: "Manages user authentication via magic-link. Issues a session upon token verification.", required: true },
      { name: "requirement_1_name", label: "Requirement 1 name", default: "Core Behavior", required: true },
      { name: "requirement_1_statement", label: "Requirement 1 (after SHALL)", default: "issue a session token after validating valid credentials", required: true },
      { name: "scenario_1_name", label: "Scenario 1 name", default: "Successful login", required: true },
      { name: "given_1", label: "GIVEN 1", default: "a registered user with valid credentials", required: true },
      { name: "when_1", label: "WHEN 1", default: "the user submits the login form", required: true },
      { name: "then_1", label: "THEN 1", default: "the system returns a 200 response with a session token", required: true },
      { name: "requirement_2_name", label: "Requirement 2 name", default: "Error Handling", required: true },
      { name: "requirement_2_statement", label: "Requirement 2 (after SHALL)", default: "reject malformed credentials with a 401 response", required: true },
      { name: "scenario_2_name", label: "Scenario 2 name", default: "Invalid credentials", required: true },
      { name: "given_2", label: "GIVEN 2", default: "a registered user with malformed credentials", required: true },
      { name: "when_2", label: "WHEN 2", default: "the user submits the login form", required: true },
      { name: "then_2", label: "THEN 2", default: "the system returns a 401 response with a descriptive error", required: true },
      { name: "requirement_3_name", label: "Requirement 3 name", default: "Performance", required: true },
      { name: "requirement_3_statement", label: "Requirement 3 (after SHALL)", default: "respond to login requests within 300 ms at the p95", required: true },
      { name: "scenario_3_name", label: "Scenario 3 name", default: "Expected load", required: true },
      { name: "given_3", label: "GIVEN 3", default: "100 concurrent login requests", required: true },
      { name: "when_3", label: "WHEN 3", default: "the requests reach the login endpoint", required: true },
      { name: "then_3", label: "THEN 3", default: "the p95 latency stays below 300 ms", required: true },
    ],
  },
  mcp: {
    frontmatter: { transport: "local" },
    body:
      '{\n' +
      '  "{{serverName}}": {\n' +
      '    "type": "local",\n' +
      '    "command": ["{{command}}"],\n' +
      '    "environment": {\n' +
      '      "{{envKey}}": "{{envValue}}"\n' +
      '    }\n' +
      '  }\n' +
      '}\n',
    variables: [
      { name: "serverName", label: "Nombre del servidor", default: "my-mcp", required: true },
      { name: "command", label: "Comando", default: "npx -y @scope/mcp-server", required: true },
      { name: "envKey", label: "Variable de entorno", default: "API_KEY", required: false },
      { name: "envValue", label: "Valor", default: "", required: false },
    ],
  },
};
