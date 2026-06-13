// Per-type "¿Cómo se usa?" help shown inline in the editor. The destination
// path and format are derived live from the selected target's renderer (so
// they stay correct as targets grow); only the target-neutral prose lives here.

export const TYPE_HELP = {
  agent: {
    what: "La personalidad e instrucciones principales con las que hablas.",
    usage: "Al arrancar el CLI en el repo aparece como opción; lo eliges con el selector de agente. (En Cursor se traduce a una regla.)",
  },
  subagent: {
    what: "Como un agente, pero pensado para que otro agente le delegue una tarea acotada.",
    usage: "Un agente principal lo invoca según su description, o lo llamas tú con @<slug>. Mantén la description muy concreta.",
  },
  skill: {
    what: "Una capacidad reutilizable (procedimiento, checklist, formato) que el CLI carga solo cuando hace falta.",
    usage: "Se activa por su description (carga progresiva). Los «Archivos adicionales» caen en la misma carpeta y los referencia el archivo principal por ruta relativa.",
  },
  command: {
    what: "Un slash command reutilizable: un prompt con nombre que lanzas escribiendo /<slug> en el chat.",
    usage: "El CLI lo ofrece como /<slug>. El cuerpo es el prompt que se envía; usa $ARGUMENTS para inyectar lo que escribas tras el comando. (En Gemini el formato es TOML.)",
  },
  memory: {
    what: "Contexto persistente que el CLI lee siempre: convenciones, comandos de build, reglas de estilo.",
    usage: "El archivo de memoria raíz (AGENTS.md / CLAUDE.md / GEMINI.md según el CLI) se inyecta automáticamente. Con otros nombres creas memorias con tema propio.",
  },
  mcp: {
    what: "Configuración de un servidor MCP: conecta herramientas externas (Postgres, GitHub…) al agente.",
    usage: "El CLI arranca el servidor declarado en command y expone sus herramientas. Rellena command y las variables de entorno.",
  },
  config_snippet: {
    what: "Un fragmento suelto de configuración del CLI (ajustes, permisos, atajos).",
    usage: "El CLI lee su config del directorio correspondiente. Útil para compartir trozos de configuración con el equipo vía el repo.",
  },
};

// Human label for a file format, keyed by extension of the rendered path.
export const FORMAT_BY_EXT = {
  md: "Markdown + frontmatter YAML",
  mdc: "Cursor MDC (frontmatter + markdown)",
  json: "JSON",
  toml: "TOML",
};
