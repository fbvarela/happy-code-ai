// Per-type "¿Cómo se usa?" help shown inline in the editor. Mirrors
// docs/GUIA-ARTEFACTOS.md; keep them in sync. `path` uses <slug> as the
// placeholder the renderer fills from the artifact name.

export const TYPE_HELP = {
  agent: {
    path: ".opencode/agent/<slug>.md",
    format: "Markdown + frontmatter YAML",
    what: "La personalidad e instrucciones principales con las que hablas.",
    usage: "Al arrancar OpenCode en el repo aparece como opción; lo eliges con el selector de agente.",
  },
  subagent: {
    path: ".opencode/agent/<slug>.md",
    format: "Markdown + frontmatter YAML",
    what: "Mismo archivo que un agente, pero pensado para que otro agente le delegue una tarea acotada.",
    usage: "Un agente principal lo invoca según su description, o lo llamas tú con @<slug>. Mantén la description muy concreta.",
  },
  skill: {
    path: ".opencode/skill/<slug>/SKILL.md",
    format: "Markdown + frontmatter (carpeta propia)",
    what: "Una capacidad reutilizable (procedimiento, checklist, formato) que OpenCode carga solo cuando hace falta.",
    usage: "Se activa por su description (carga progresiva). Los «Archivos adicionales» caen en la misma carpeta y los referencia el SKILL.md por ruta relativa.",
  },
  command: {
    path: ".opencode/command/<slug>.md",
    format: "Markdown + frontmatter YAML",
    what: "Un slash command reutilizable: un prompt con nombre que lanzas escribiendo /<slug> en el chat.",
    usage: "OpenCode lo ofrece como /<slug>. El cuerpo es el prompt que se envía; usa $ARGUMENTS para inyectar lo que escribas tras el comando y la frontmatter description para describirlo.",
  },
  memory: {
    path: "AGENTS.md  (si la llamas «agents»)  ·  si no  .opencode/memory/<slug>.md",
    format: "Markdown",
    what: "Contexto persistente que OpenCode lee siempre: convenciones, comandos de build, reglas de estilo.",
    usage: "Llámala «agents» para publicar AGENTS.md en la raíz (se inyecta solo). Otros nombres crean memorias con tema propio.",
  },
  mcp: {
    path: ".opencode/mcp/<slug>.json",
    format: "JSON",
    what: "Configuración de un servidor MCP: conecta herramientas externas (Postgres, GitHub…) al agente.",
    usage: "OpenCode arranca el servidor declarado en command y expone sus herramientas. Rellena command y las variables de entorno.",
  },
  config_snippet: {
    path: ".opencode/<slug>.json",
    format: "JSON",
    what: "Un fragmento suelto de configuración de OpenCode (ajustes, permisos, atajos).",
    usage: "OpenCode lee la config de .opencode/. Útil para compartir trozos de configuración con el equipo vía el repo.",
  },
};
