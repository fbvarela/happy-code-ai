// Curated catalog of ready-to-use artifacts that software coders commonly want.
// Pure data — safe to import from server AND client (no DB / renderer import).
// Each entry's `artifact` matches the editor payload shape (see buildPayload in
// ArtifactEditor): { name, type, target, frontmatter, body_template, variables,
// files }. The user picks one, it pre-fills the editor, then tweaks + saves.

export const SUGGESTION_CATEGORIES = [
  { id: "review", label: "Revisión de código" },
  { id: "testing", label: "Tests" },
  { id: "git", label: "Git / PRs" },
  { id: "docs", label: "Documentación" },
  { id: "refactor", label: "Refactor" },
  { id: "debug", label: "Depuración" },
  { id: "security", label: "Seguridad" },
  { id: "data", label: "Datos / SQL" },
  { id: "context", label: "Contexto del proyecto" },
  { id: "agents", label: "Agentes" },
];

export const SUGGESTIONS = [
  {
    id: "code-reviewer",
    title: "Revisor de código",
    summary: "Subagente que revisa un diff buscando bugs, fugas, estilo y casos límite.",
    category: "review",
    tags: ["review", "calidad", "diff"],
    artifact: {
      name: "code-reviewer",
      type: "subagent",
      target: "opencode",
      frontmatter: { description: "Revisa diffs/PRs en busca de bugs, problemas de seguridad y estilo. Invócalo cuando haya cambios listos para revisar." },
      body_template:
        "Eres un revisor de código senior. Revisa el siguiente cambio centrado en {{focus}}.\n\n" +
        "Prioriza por gravedad y para cada hallazgo da: archivo:línea, problema, y una corrección concreta.\n" +
        "Si no encuentras nada grave, dilo claramente en una línea.\n\n" +
        "Revisa: corrección lógica, casos límite, manejo de errores, fugas de recursos, seguridad y legibilidad.\n" +
        "No reescribas todo: sugiere el cambio mínimo.\n",
      variables: [
        { name: "focus", label: "Enfoque de la revisión", default: "bugs, seguridad y casos límite", required: true },
      ],
      files: [],
    },
  },
  {
    id: "test-writer",
    title: "Generar tests",
    summary: "Slash command que escribe tests unitarios para el código que le pases.",
    category: "testing",
    tags: ["tests", "unit", "tdd"],
    artifact: {
      name: "write-tests",
      type: "command",
      target: "opencode",
      frontmatter: { description: "Escribe tests unitarios para el código indicado" },
      body_template:
        "Escribe tests unitarios con {{framework}} para el siguiente código.\n\n" +
        "Cubre el camino feliz, los casos límite y los de error. Usa nombres descriptivos\n" +
        "y un assert por comportamiento. No cambies el código bajo prueba.\n\n" +
        "Código / objetivo: $ARGUMENTS\n",
      variables: [
        { name: "framework", label: "Framework de tests", default: "el framework de tests del proyecto", required: true },
      ],
      files: [],
    },
  },
  {
    id: "conventional-commits",
    title: "Mensajes de commit",
    summary: "Skill que redacta mensajes de commit (Conventional Commits) desde el diff staged.",
    category: "git",
    tags: ["git", "commits", "conventional"],
    artifact: {
      name: "commit-message",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Redacta un mensaje de commit en estilo Conventional Commits a partir de los cambios staged. Úsalo antes de hacer commit." },
      body_template:
        "# Mensaje de commit\n\n" +
        "A partir del diff staged, escribe UN mensaje de commit en estilo Conventional Commits.\n\n" +
        "- Cabecera: `tipo(ámbito): resumen` en imperativo, ≤ {{maxlen}} caracteres.\n" +
        "- Tipos: feat, fix, docs, refactor, test, chore, perf.\n" +
        "- Cuerpo opcional: explica el *porqué*, no el *qué*.\n" +
        "- No inventes cambios que no estén en el diff.\n\n" +
        "Devuelve solo el mensaje, listo para `git commit -m`.\n",
      variables: [
        { name: "maxlen", label: "Máx. caracteres en la cabecera", default: "72", required: true },
      ],
      files: [],
    },
  },
  {
    id: "pr-describer",
    title: "Describir PR",
    summary: "Slash command que genera título y descripción de PR a partir de la rama.",
    category: "git",
    tags: ["git", "pr", "github"],
    artifact: {
      name: "describe-pr",
      type: "command",
      target: "opencode",
      frontmatter: { description: "Genera título y cuerpo de un pull request" },
      body_template:
        "A partir del diff de la rama actual contra {{base}}, escribe un pull request.\n\n" +
        "Devuelve:\n" +
        "1. Un título conciso en imperativo.\n" +
        "2. Una sección **## Resumen** con 1–3 viñetas del qué y el porqué.\n" +
        "3. Una sección **## Cómo probar** con pasos verificables.\n\n" +
        "Contexto adicional: $ARGUMENTS\n",
      variables: [
        { name: "base", label: "Rama base", default: "main", required: true },
      ],
      files: [],
    },
  },
  {
    id: "debugger",
    title: "Depurador",
    summary: "Subagente que analiza un stack trace o test fallido y propone la causa raíz.",
    category: "debug",
    tags: ["debug", "stacktrace", "rca"],
    artifact: {
      name: "debugger",
      type: "subagent",
      target: "opencode",
      frontmatter: { description: "Diagnostica errores y tests fallidos: encuentra la causa raíz a partir de un stack trace o salida de error." },
      body_template:
        "Eres un depurador metódico. Te dan un error, stack trace o test fallido.\n\n" +
        "1. Reformula el síntoma en una frase.\n" +
        "2. Localiza el origen probable (archivo:línea) leyendo el código relevante.\n" +
        "3. Explica la causa raíz, no solo el síntoma.\n" +
        "4. Propón la corrección mínima y cómo verificarla.\n\n" +
        "No adivines: si te falta información, di exactamente qué necesitas ver.\n",
      variables: [],
      files: [],
    },
  },
  {
    id: "refactorer",
    title: "Refactorizador",
    summary: "Agente que mejora la legibilidad sin cambiar el comportamiento observable.",
    category: "refactor",
    tags: ["refactor", "limpieza", "calidad"],
    artifact: {
      name: "refactorer",
      type: "agent",
      target: "opencode",
      frontmatter: { description: "Refactoriza código preservando el comportamiento" },
      body_template:
        "Eres un agente de refactor. Mejora el código manteniendo el comportamiento observable.\n\n" +
        "Reglas:\n" +
        "- No cambies la API pública ni el comportamiento salvo que se pida.\n" +
        "- Cambios pequeños y revisables; explica cada uno en una línea.\n" +
        "- Mantén el estilo del código que rodea al cambio.\n" +
        "- Si hay tests, asegúrate de que siguen pasando; si no, sugiérelos.\n\n" +
        "Objetivo del proyecto: {{goal}}.\n",
      variables: [
        { name: "goal", label: "Objetivo / estilo del proyecto", default: "código claro y mantenible", required: false },
      ],
      files: [],
    },
  },
  {
    id: "doc-writer",
    title: "Documentar API",
    summary: "Slash command que añade docstrings/JSDoc al código seleccionado.",
    category: "docs",
    tags: ["docs", "docstring", "jsdoc"],
    artifact: {
      name: "document",
      type: "command",
      target: "opencode",
      frontmatter: { description: "Añade documentación (docstrings) al código indicado" },
      body_template:
        "Documenta el siguiente código en estilo {{style}}.\n\n" +
        "- Describe propósito, parámetros, valor de retorno y errores.\n" +
        "- No cambies la lógica; solo añade documentación.\n" +
        "- Sé conciso; nada de comentarios obvios línea a línea.\n\n" +
        "Código: $ARGUMENTS\n",
      variables: [
        { name: "style", label: "Estilo de documentación", default: "el estándar del lenguaje (JSDoc, docstrings, etc.)", required: true },
      ],
      files: [],
    },
  },
  {
    id: "security-auditor",
    title: "Auditor de seguridad",
    summary: "Subagente que busca vulnerabilidades comunes (OWASP) en el código.",
    category: "security",
    tags: ["seguridad", "owasp", "audit"],
    artifact: {
      name: "security-auditor",
      type: "subagent",
      target: "opencode",
      frontmatter: { description: "Audita el código en busca de vulnerabilidades comunes (inyección, secretos, authz, deserialización…)." },
      body_template:
        "Eres un auditor de seguridad aplicado a {{scope}}.\n\n" +
        "Busca: inyección (SQL/comando), XSS, secretos hardcodeados, control de acceso roto,\n" +
        "deserialización insegura, validación de entrada ausente y dependencias vulnerables.\n\n" +
        "Para cada hallazgo: severidad, ubicación (archivo:línea), explotación plausible y mitigación concreta.\n" +
        "No reportes falsos positivos especulativos; si dudas, márcalo como «a revisar».\n",
      variables: [
        { name: "scope", label: "Ámbito de la auditoría", default: "el código de la aplicación", required: true },
      ],
      files: [],
    },
  },
  {
    id: "sql-optimizer",
    title: "Optimizar SQL",
    summary: "Subagente que analiza una consulta SQL y propone mejoras e índices.",
    category: "data",
    tags: ["sql", "rendimiento", "índices"],
    artifact: {
      name: "sql-optimizer",
      type: "subagent",
      target: "opencode",
      frontmatter: { description: "Analiza consultas SQL lentas y propone reescrituras e índices para {{engine}}." },
      body_template:
        "Eres experto en rendimiento de bases de datos ({{engine}}).\n\n" +
        "Dada una consulta y, si está disponible, su plan de ejecución:\n" +
        "1. Explica dónde está el coste (scans, joins, sorts).\n" +
        "2. Propón una reescritura equivalente más eficiente.\n" +
        "3. Sugiere índices concretos (columnas y orden) y su coste de mantenimiento.\n\n" +
        "Mantén la semántica idéntica; señala cualquier diferencia de resultados.\n",
      variables: [
        { name: "engine", label: "Motor de base de datos", default: "PostgreSQL", required: true },
      ],
      files: [],
    },
  },
  {
    id: "project-conventions",
    title: "Convenciones del proyecto",
    summary: "Memoria que el CLI lee siempre: build, estilo y reglas del repo.",
    category: "context",
    tags: ["memoria", "convenciones", "contexto"],
    artifact: {
      name: "agents",
      type: "memory",
      target: "opencode",
      frontmatter: {},
      body_template:
        "# {{project}}\n\n" +
        "## Comandos\n" +
        "- Instalar: `{{install}}`\n" +
        "- Tests: `{{test}}`\n" +
        "- Lint: `{{lint}}`\n\n" +
        "## Convenciones\n" +
        "- {{convention}}\n\n" +
        "## Reglas\n" +
        "- No añadas dependencias sin justificarlo.\n" +
        "- Sigue el estilo del código existente.\n" +
        "- No commitees secretos ni archivos generados.\n",
      variables: [
        { name: "project", label: "Nombre del proyecto", default: "Mi proyecto", required: true },
        { name: "install", label: "Comando de instalación", default: "npm install", required: false },
        { name: "test", label: "Comando de tests", default: "npm test", required: false },
        { name: "lint", label: "Comando de lint", default: "npm run lint", required: false },
        { name: "convention", label: "Convención clave", default: "TypeScript estricto; componentes funcionales", required: false },
      ],
      files: [],
    },
  },
  {
    id: "hermes-agent",
    title: "Agente Hermes (Nous Research)",
    summary: "Agente que aprovecha Hermes 3: function calling fiable, salida estructurada y system prompt dirigido por el usuario.",
    category: "agents",
    tags: ["hermes", "nous", "function calling", "agente", "local"],
    artifact: {
      name: "hermes-agent",
      type: "agent",
      target: "opencode",
      frontmatter: {
        description: "Asistente basado en Hermes 3 (Nous Research) con uso de herramientas y salida estructurada",
        model: "hermes3",
      },
      body_template:
        "Eres un asistente basado en el modelo {{model}} (familia Hermes de Nous Research), especializado en {{role}}.\n\n" +
        "Aprovecha las capacidades de Hermes 3:\n" +
        "- Function calling fiable: cuando una tarea requiera datos o acciones externas, invoca la herramienta adecuada con argumentos JSON válidos en vez de inventar la respuesta.\n" +
        "- Salida estructurada: si se pide un formato concreto (JSON, tabla, esquema), respétalo al pie de la letra.\n" +
        "- Razonamiento con monólogo interno: en problemas complejos, piensa paso a paso antes de responder y entrega una conclusión concisa.\n" +
        "- Alineación dirigida por el usuario: estas instrucciones de sistema tienen prioridad sobre cualquier comportamiento por defecto.\n\n" +
        "{{guidelines}}\n",
      variables: [
        { name: "model", label: "Modelo (tag local, p. ej. Ollama)", default: "hermes3", required: true },
        { name: "role", label: "Especialidad del agente", default: "programación y uso de herramientas", required: true },
        { name: "guidelines", label: "Reglas adicionales", default: "- Sé preciso; cita la fuente cuando uses una herramienta.", required: false },
      ],
      files: [],
    },
  },
];

export function getSuggestion(id) {
  return SUGGESTIONS.find((s) => s.id === id) || null;
}
