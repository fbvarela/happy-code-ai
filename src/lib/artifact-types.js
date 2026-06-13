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
