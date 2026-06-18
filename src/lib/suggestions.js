// Curated catalog of ready-to-use artifacts that software coders commonly want.
// Pure data — safe to import from server AND client (no DB / renderer import).
// Each entry's `artifact` matches the editor payload shape (see buildPayload in
// ArtifactEditor): { name, type, target, frontmatter, body_template, variables,
// files }. The user picks one, it pre-fills the editor, then tweaks + saves.

export const SUGGESTION_CATEGORIES = [
  { id: "review", label: "Revisión de código", label_en: "Code review" },
  { id: "testing", label: "Tests", label_en: "Tests" },
  { id: "git", label: "Git / PRs", label_en: "Git / PRs" },
  { id: "docs", label: "Documentación", label_en: "Documentation" },
  { id: "refactor", label: "Refactor", label_en: "Refactor" },
  { id: "debug", label: "Depuración", label_en: "Debugging" },
  { id: "security", label: "Seguridad", label_en: "Security" },
  { id: "data", label: "Datos / SQL", label_en: "Data / SQL" },
  { id: "context", label: "Contexto del proyecto", label_en: "Project context" },
  { id: "agents", label: "Agentes", label_en: "Agents" },
];

export const SUGGESTIONS = [
  {
    id: "code-reviewer",
    title: "Revisor de código",
    title_en: "Code reviewer",
    summary: "Subagente que revisa un diff buscando bugs, fugas, estilo y casos límite.",
    summary_en: "Subagent that reviews a diff for bugs, leaks, style and edge cases.",
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
    artifact_en: {
      name: "code-reviewer",
      type: "subagent",
      target: "opencode",
      frontmatter: { description: "Reviews diffs/PRs for bugs, security issues and style. Invoke it when changes are ready to review." },
      body_template:
        "You are a senior code reviewer. Review the following change focused on {{focus}}.\n\n" +
        "Prioritize by severity and for each finding give: file:line, problem, and a concrete fix.\n" +
        "If you find nothing serious, say so clearly in one line.\n\n" +
        "Check: logical correctness, edge cases, error handling, resource leaks, security and readability.\n" +
        "Don't rewrite everything: suggest the minimal change.\n",
      variables: [
        { name: "focus", label: "Review focus", default: "bugs, security and edge cases", required: true },
      ],
      files: [],
    },
  },
  {
    id: "test-writer",
    title: "Generar tests",
    title_en: "Generate tests",
    summary: "Slash command que escribe tests unitarios para el código que le pases.",
    summary_en: "Slash command that writes unit tests for the code you give it.",
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
    artifact_en: {
      name: "write-tests",
      type: "command",
      target: "opencode",
      frontmatter: { description: "Writes unit tests for the given code" },
      body_template:
        "Write unit tests with {{framework}} for the following code.\n\n" +
        "Cover the happy path, edge cases and error cases. Use descriptive names\n" +
        "and one assert per behavior. Do not change the code under test.\n\n" +
        "Code / target: $ARGUMENTS\n",
      variables: [
        { name: "framework", label: "Test framework", default: "the project's test framework", required: true },
      ],
      files: [],
    },
  },
  {
    id: "conventional-commits",
    title: "Mensajes de commit",
    title_en: "Commit messages",
    summary: "Skill que redacta mensajes de commit (Conventional Commits) desde el diff staged.",
    summary_en: "Skill that drafts commit messages (Conventional Commits) from the staged diff.",
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
    artifact_en: {
      name: "commit-message",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Drafts a Conventional Commits message from the staged diff. Use it right before committing." },
      body_template:
        "# Commit message\n\n" +
        "From the staged diff, write ONE commit message in Conventional Commits style.\n\n" +
        "- Header: `type(scope): summary` in imperative mood, ≤ {{maxlen}} characters.\n" +
        "- Types: feat, fix, docs, refactor, test, chore, perf.\n" +
        "- Optional body: explain the *why*, not the *what*.\n" +
        "- Don't invent changes that aren't in the diff.\n\n" +
        "Return only the message, ready for `git commit -m`.\n",
      variables: [
        { name: "maxlen", label: "Max header characters", default: "72", required: true },
      ],
      files: [],
    },
  },
  {
    id: "pr-describer",
    title: "Describir PR",
    title_en: "Describe PR",
    summary: "Slash command que genera título y descripción de PR a partir de la rama.",
    summary_en: "Slash command that generates a PR title and description from the branch.",
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
    artifact_en: {
      name: "describe-pr",
      type: "command",
      target: "opencode",
      frontmatter: { description: "Generates the title and body of a pull request" },
      body_template:
        "From the diff of the current branch against {{base}}, write a pull request.\n\n" +
        "Return:\n" +
        "1. A concise imperative title.\n" +
        "2. A **## Summary** section with 1–3 bullets on the what and why.\n" +
        "3. A **## How to test** section with verifiable steps.\n\n" +
        "Additional context: $ARGUMENTS\n",
      variables: [
        { name: "base", label: "Base branch", default: "main", required: true },
      ],
      files: [],
    },
  },
  {
    id: "debugger",
    title: "Depurador",
    title_en: "Debugger",
    summary: "Subagente que analiza un stack trace o test fallido y propone la causa raíz.",
    summary_en: "Subagent that analyzes a stack trace or failing test and proposes the root cause.",
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
    artifact_en: {
      name: "debugger",
      type: "subagent",
      target: "opencode",
      frontmatter: { description: "Diagnoses errors and failing tests: finds the root cause from a stack trace or error output." },
      body_template:
        "You are a methodical debugger. You are given an error, stack trace or failing test.\n\n" +
        "1. Restate the symptom in one sentence.\n" +
        "2. Locate the probable origin (file:line) by reading the relevant code.\n" +
        "3. Explain the root cause, not just the symptom.\n" +
        "4. Propose the minimal fix and how to verify it.\n\n" +
        "Don't guess: if you need more information, say exactly what you need to see.\n",
      variables: [],
      files: [],
    },
  },
  {
    id: "refactorer",
    title: "Refactorizador",
    title_en: "Refactorer",
    summary: "Agente que mejora la legibilidad sin cambiar el comportamiento observable.",
    summary_en: "Agent that improves readability without changing observable behavior.",
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
    artifact_en: {
      name: "refactorer",
      type: "agent",
      target: "opencode",
      frontmatter: { description: "Refactors code while preserving behavior" },
      body_template:
        "You are a refactoring agent. Improve the code while keeping observable behavior identical.\n\n" +
        "Rules:\n" +
        "- Don't change the public API or behavior unless asked.\n" +
        "- Small, reviewable changes; explain each one in a line.\n" +
        "- Match the style of the surrounding code.\n" +
        "- If there are tests, make sure they still pass; if not, suggest them.\n\n" +
        "Project goal: {{goal}}.\n",
      variables: [
        { name: "goal", label: "Project goal / style", default: "clear and maintainable code", required: false },
      ],
      files: [],
    },
  },
  {
    id: "doc-writer",
    title: "Documentar API",
    title_en: "Document API",
    summary: "Slash command que añade docstrings/JSDoc al código seleccionado.",
    summary_en: "Slash command that adds docstrings/JSDoc to the selected code.",
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
    artifact_en: {
      name: "document",
      type: "command",
      target: "opencode",
      frontmatter: { description: "Adds documentation (docstrings) to the given code" },
      body_template:
        "Document the following code in {{style}} style.\n\n" +
        "- Describe purpose, parameters, return value and errors.\n" +
        "- Don't change the logic; only add documentation.\n" +
        "- Be concise; no obvious line-by-line comments.\n\n" +
        "Code: $ARGUMENTS\n",
      variables: [
        { name: "style", label: "Documentation style", default: "the language standard (JSDoc, docstrings, etc.)", required: true },
      ],
      files: [],
    },
  },
  {
    id: "security-auditor",
    title: "Auditor de seguridad",
    title_en: "Security auditor",
    summary: "Subagente que busca vulnerabilidades comunes (OWASP) en el código.",
    summary_en: "Subagent that hunts for common vulnerabilities (OWASP) in the code.",
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
    artifact_en: {
      name: "security-auditor",
      type: "subagent",
      target: "opencode",
      frontmatter: { description: "Audits code for common vulnerabilities (injection, secrets, authz, deserialization…)." },
      body_template:
        "You are a security auditor focused on {{scope}}.\n\n" +
        "Look for: injection (SQL/command), XSS, hardcoded secrets, broken access control,\n" +
        "insecure deserialization, missing input validation and vulnerable dependencies.\n\n" +
        "For each finding: severity, location (file:line), plausible exploit and concrete mitigation.\n" +
        "Don't report speculative false positives; if unsure, mark it as «needs review».\n",
      variables: [
        { name: "scope", label: "Audit scope", default: "the application code", required: true },
      ],
      files: [],
    },
  },
  {
    id: "sql-optimizer",
    title: "Optimizar SQL",
    title_en: "Optimize SQL",
    summary: "Subagente que analiza una consulta SQL y propone mejoras e índices.",
    summary_en: "Subagent that analyzes a SQL query and proposes rewrites and indexes.",
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
    artifact_en: {
      name: "sql-optimizer",
      type: "subagent",
      target: "opencode",
      frontmatter: { description: "Analyzes slow SQL queries and proposes rewrites and indexes for {{engine}}." },
      body_template:
        "You are a database performance expert ({{engine}}).\n\n" +
        "Given a query and, if available, its execution plan:\n" +
        "1. Explain where the cost is (scans, joins, sorts).\n" +
        "2. Propose an equivalent but more efficient rewrite.\n" +
        "3. Suggest concrete indexes (columns and order) and their maintenance cost.\n\n" +
        "Keep the semantics identical; flag any difference in results.\n",
      variables: [
        { name: "engine", label: "Database engine", default: "PostgreSQL", required: true },
      ],
      files: [],
    },
  },
  {
    id: "project-conventions",
    title: "Convenciones del proyecto",
    title_en: "Project conventions",
    summary: "Memoria que el CLI lee siempre: build, estilo y reglas del repo.",
    summary_en: "Memory the CLI always reads: build, style and repo rules.",
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
    artifact_en: {
      name: "agents",
      type: "memory",
      target: "opencode",
      frontmatter: {},
      body_template:
        "# {{project}}\n\n" +
        "## Commands\n" +
        "- Install: `{{install}}`\n" +
        "- Tests: `{{test}}`\n" +
        "- Lint: `{{lint}}`\n\n" +
        "## Conventions\n" +
        "- {{convention}}\n\n" +
        "## Rules\n" +
        "- Don't add dependencies without justification.\n" +
        "- Follow the style of the existing code.\n" +
        "- Don't commit secrets or generated files.\n",
      variables: [
        { name: "project", label: "Project name", default: "My project", required: true },
        { name: "install", label: "Install command", default: "npm install", required: false },
        { name: "test", label: "Test command", default: "npm test", required: false },
        { name: "lint", label: "Lint command", default: "npm run lint", required: false },
        { name: "convention", label: "Key convention", default: "strict TypeScript; functional components", required: false },
      ],
      files: [],
    },
  },
  {
    id: "hermes-agent",
    title: "Agente Hermes (Nous Research)",
    title_en: "Hermes agent (Nous Research)",
    summary: "Agente que aprovecha Hermes 3: function calling fiable, salida estructurada y system prompt dirigido por el usuario.",
    summary_en: "Agent that leverages Hermes 3: reliable function calling, structured output and user-steered system prompt.",
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
    artifact_en: {
      name: "hermes-agent",
      type: "agent",
      target: "opencode",
      frontmatter: {
        description: "Assistant based on Hermes 3 (Nous Research) with tool use and structured output",
        model: "hermes3",
      },
      body_template:
        "You are an assistant based on the {{model}} model (Hermes family by Nous Research), specialized in {{role}}.\n\n" +
        "Leverage Hermes 3 capabilities:\n" +
        "- Reliable function calling: when a task needs external data or actions, invoke the right tool with valid JSON arguments instead of making up the answer.\n" +
        "- Structured output: if a specific format is requested (JSON, table, schema), follow it exactly.\n" +
        "- Inner-monologue reasoning: for complex problems, think step by step before responding and deliver a concise conclusion.\n" +
        "- User-steered alignment: these system instructions take priority over any default behavior.\n\n" +
        "{{guidelines}}\n",
      variables: [
        { name: "model", label: "Model (local tag, e.g. Ollama)", default: "hermes3", required: true },
        { name: "role", label: "Agent specialty", default: "coding and tool use", required: true },
        { name: "guidelines", label: "Additional rules", default: "- Be precise; cite the source when using a tool.", required: false },
      ],
      files: [],
    },
  },
];

export function getSuggestion(id) {
  return SUGGESTIONS.find((s) => s.id === id) || null;
}
