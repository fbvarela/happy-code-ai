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
      "### Requirement: {{req1_name}}\n\n" +
      "The system SHALL {{req1}}.\n\n" +
      "#### Scenario: {{scenario1_name}}\n\n" +
      "- GIVEN {{given1}}\n" +
      "- WHEN {{when1}}\n" +
      "- THEN {{then1}}\n",
    variables: [
      { name: "feature", label: "Feature name", default: "User Authentication", required: true },
      { name: "version", label: "Version", default: "1.0", required: false },
      { name: "status", label: "Status", default: "draft", required: false },
      { name: "agents", label: "Target agents", default: "claude-code, opencode", required: false },
      { name: "purpose", label: "Purpose (one paragraph)", default: "Describe what this feature manages and why it exists.", required: true },
      { name: "req1_name", label: "Requirement name", default: "Core Behavior", required: true },
      { name: "req1", label: "Requirement (after SHALL)", default: "accept valid credentials and return a session token", required: true },
      { name: "scenario1_name", label: "Scenario name", default: "Successful login", required: true },
      { name: "given1", label: "GIVEN", default: "a registered user with valid credentials", required: true },
      { name: "when1", label: "WHEN", default: "the user submits the login form", required: true },
      { name: "then1", label: "THEN", default: "the system returns a 200 response with a session token", required: true },
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
