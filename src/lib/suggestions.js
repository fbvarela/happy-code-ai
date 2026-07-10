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
  { id: "quality", label: "Calidad de código", label_en: "Code quality" },
  { id: "perf", label: "Rendimiento", label_en: "Performance" },
  { id: "openspec", label: "OpenSpec", label_en: "OpenSpec" },
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

  // ── Code quality ──────────────────────────────────────────────────────────
  {
    id: "pre-commit-checklist",
    title: "Checklist pre-commit",
    title_en: "Pre-commit checklist",
    summary: "Skill que verifica tests, lint, secretos y mensaje de commit antes de cada git commit.",
    summary_en: "Skill that verifies tests, lint, secrets and commit message before every git commit.",
    category: "quality",
    tags: ["commit", "lint", "tests", "secrets", "checklist"],
    artifact: {
      name: "pre-commit-checklist",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Usa este skill antes de cada git commit para detectar errores comunes." },
      body_template:
        "# Checklist pre-commit\n\n" +
        "Antes de hacer commit, verifica todo lo siguiente:\n\n" +
        "1. **Tests en verde** — ejecuta `{{test_cmd}}` y confirma que pasan.\n" +
        "2. **Sin artefactos de depuración** — busca `console.log`, `debugger`, `TODO REMOVE`, `FIXME`.\n" +
        "3. **Sin secretos** — escanea los archivos staged en busca de claves API, tokens, contraseñas.\n" +
        "4. **Lint limpio** — ejecuta `{{lint_cmd}}`.\n" +
        "5. **Mensaje de commit** — sigue Conventional Commits (`tipo(ámbito): resumen ≤ 72 chars`).\n\n" +
        "Si alguna comprobación falla, corrígela antes de hacer commit. Indica cuáles pasaron y cuáles no.\n",
      variables: [
        { name: "test_cmd", label: "Comando de tests", default: "npm test", required: true },
        { name: "lint_cmd", label: "Comando de lint", default: "npm run lint", required: true },
      ],
      files: [],
    },
    artifact_en: {
      name: "pre-commit-checklist",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Run this skill before every git commit to catch common mistakes." },
      body_template:
        "# Pre-commit checklist\n\n" +
        "Before committing, verify all of the following:\n\n" +
        "1. **Tests pass** — run `{{test_cmd}}` and confirm green.\n" +
        "2. **No debug artifacts** — grep for `console.log`, `debugger`, `TODO REMOVE`, `FIXME`.\n" +
        "3. **No secrets** — scan staged files for API keys, tokens, passwords.\n" +
        "4. **Lint clean** — run `{{lint_cmd}}`.\n" +
        "5. **Commit message** — follows Conventional Commits (`type(scope): summary ≤ 72 chars`).\n\n" +
        "If any check fails, fix it before committing. Report which checks passed and which failed.\n",
      variables: [
        { name: "test_cmd", label: "Test command", default: "npm test", required: true },
        { name: "lint_cmd", label: "Lint command", default: "npm run lint", required: true },
      ],
      files: [],
    },
  },
  {
    id: "dead-code-detector",
    title: "Detector de código muerto",
    title_en: "Dead-code detector",
    summary: "Skill que identifica exports sin usar, ramas inalcanzables y feature flags obsoletos.",
    summary_en: "Skill that identifies unused exports, unreachable branches and stale feature flags.",
    category: "quality",
    tags: ["dead code", "cleanup", "exports", "feature flags"],
    artifact: {
      name: "dead-code-detector",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Detecta exports sin usar, código inalcanzable y feature flags obsoletos en los archivos modificados." },
      body_template:
        "# Detector de código muerto\n\n" +
        "Para cada archivo del changeset actual:\n\n" +
        "1. Lista todos los símbolos exportados que no se importan en ningún sitio del proyecto.\n" +
        "2. Identifica ramas `if (false)` o con condición constante.\n" +
        "3. Señala feature flags cuyo rollout sea 0 % o 100 % (hardcodeado).\n" +
        "4. Reporta cada hallazgo como: `archivo:línea — motivo — acción sugerida`.\n\n" +
        "No borres nada; solo reporta.\n",
      variables: [],
      files: [],
    },
    artifact_en: {
      name: "dead-code-detector",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Identify unused exports, unreachable code paths and stale feature flags in the touched files." },
      body_template:
        "# Dead-code detector\n\n" +
        "For each file in the current changeset:\n\n" +
        "1. List all exported symbols not imported anywhere in the codebase.\n" +
        "2. Identify `if (false)` / constant-condition branches.\n" +
        "3. Flag feature flags whose rollout is 0% or 100% (hardcoded).\n" +
        "4. Report each finding as: `file:line — reason — suggested action`.\n\n" +
        "Do not delete anything; only report.\n",
      variables: [],
      files: [],
    },
  },

  // ── Testing ───────────────────────────────────────────────────────────────
  {
    id: "test-gap-analyser",
    title: "Análisis de cobertura",
    title_en: "Test-gap analyser",
    summary: "Skill que identifica ramas y casos límite sin test tras escribir o editar código.",
    summary_en: "Skill that identifies untested branches and edge cases after writing or editing code.",
    category: "testing",
    tags: ["tests", "coverage", "edge cases", "checklist"],
    artifact: {
      name: "test-gap-analyser",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Tras escribir o editar código, detecta qué ramas y casos límite no tienen test." },
      body_template:
        "# Análisis de huecos en tests\n\n" +
        "Para las funciones/métodos modificados:\n\n" +
        "1. Lista cada ruta de ejecución distinta (camino feliz + cada rama).\n" +
        "2. Cruza con los tests existentes en `{{test_dir}}`.\n" +
        "3. Para cada ruta sin test, escribe una línea describiendo el test que falta.\n" +
        "4. Prioriza: primero los caminos de error y los límites de seguridad.\n\n" +
        "Devuelve un checklist que el desarrollador pueda convertir en casos de test reales.\n",
      variables: [
        { name: "test_dir", label: "Carpeta de tests", default: "tests/", required: false },
      ],
      files: [],
    },
    artifact_en: {
      name: "test-gap-analyser",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "After writing or editing code, identify which branches and edge cases lack test coverage." },
      body_template:
        "# Test-gap analyser\n\n" +
        "Given the changed functions/methods:\n\n" +
        "1. List every distinct execution path (happy path + each branch).\n" +
        "2. Cross-reference with existing tests in `{{test_dir}}`.\n" +
        "3. For each untested path, write a one-line description of the missing test.\n" +
        "4. Prioritize: error paths and security boundaries first.\n\n" +
        "Output a checklist the developer can turn into actual test cases.\n",
      variables: [
        { name: "test_dir", label: "Test directory", default: "tests/", required: false },
      ],
      files: [],
    },
  },
  {
    id: "mutation-test-advisor",
    title: "Asesor de tests de mutación",
    title_en: "Mutation-test advisor",
    summary: "Skill que detecta assertions débiles sugiriendo mutaciones que deberían hacerlos fallar.",
    summary_en: "Skill that spots weak assertions by suggesting mutations that should break them.",
    category: "testing",
    tags: ["tests", "mutation", "assertions", "quality"],
    artifact: {
      name: "mutation-test-advisor",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Tras escribir tests unitarios, sugiere mutaciones que detectarían assertions débiles." },
      body_template:
        "# Asesor de tests de mutación\n\n" +
        "Para la suite de tests proporcionada:\n\n" +
        "1. Identifica assertions que seguirían pasando si se invirtiera el signo (`>`, `<`, `===`).\n" +
        "2. Identifica valores de retorno que podrían sustituirse por `null` / `undefined` sin fallar.\n" +
        "3. Sugiere cómo reforzar cada assertion débil con una reescritura concreta.\n\n" +
        "Céntrate en las 5 mutaciones de mayor riesgo; no listes exhaustivamente todas las posibilidades.\n",
      variables: [],
      files: [],
    },
    artifact_en: {
      name: "mutation-test-advisor",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "After unit tests are written, suggest mutations that would detect weak assertions." },
      body_template:
        "# Mutation-test advisor\n\n" +
        "For the provided test suite:\n\n" +
        "1. Identify assertions that would still pass if the sign (`>`, `<`, `===`) were flipped.\n" +
        "2. Identify return values that could be swapped with `null` / `undefined` without failing tests.\n" +
        "3. Suggest strengthening each weak assertion with a concrete rewrite.\n\n" +
        "Focus on the top 5 highest-risk mutations; do not exhaustively list every possibility.\n",
      variables: [],
      files: [],
    },
  },

  // ── Documentation ─────────────────────────────────────────────────────────
  {
    id: "changelog-entry",
    title: "Entrada de CHANGELOG",
    title_en: "Changelog entry writer",
    summary: "Skill que redacta la sección de CHANGELOG para la versión actual desde el git log.",
    summary_en: "Skill that drafts the CHANGELOG section for the current version from the git log.",
    category: "docs",
    tags: ["changelog", "docs", "release", "git"],
    artifact: {
      name: "changelog-entry",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Tras completar una feature, redacta la entrada de CHANGELOG en formato Keep a Changelog." },
      body_template:
        "# Redactor de entrada de CHANGELOG\n\n" +
        "A partir del git log desde `{{since_tag}}` y el diff staged, redacta una entrada de CHANGELOG\n" +
        "en formato Keep a Changelog (https://keepachangelog.com).\n\n" +
        "Secciones a rellenar si aplica: Added, Changed, Deprecated, Removed, Fixed, Security.\n" +
        "- Una viñeta por cambio visible para el usuario.\n" +
        "- Omite refactors internos salvo que afecten a la API.\n" +
        "- Enlaza a PRs o issues donde estén disponibles.\n\n" +
        "Devuelve solo el bloque de la nueva versión, listo para pegar en CHANGELOG.md.\n",
      variables: [
        { name: "since_tag", label: "Tag desde el que comparar", default: "$(git describe --tags --abbrev=0)", required: true },
      ],
      files: [],
    },
    artifact_en: {
      name: "changelog-entry",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "After a feature is complete, draft the CHANGELOG entry for this version." },
      body_template:
        "# Changelog entry writer\n\n" +
        "From the git log since `{{since_tag}}` and the staged diff, draft a CHANGELOG entry\n" +
        "in Keep a Changelog format (https://keepachangelog.com).\n\n" +
        "Sections to populate if relevant: Added, Changed, Deprecated, Removed, Fixed, Security.\n" +
        "- One bullet per user-visible change.\n" +
        "- Omit internal refactors unless they affect the API.\n" +
        "- Link to PRs or issues where available.\n\n" +
        "Return only the new version section block, ready to paste into CHANGELOG.md.\n",
      variables: [
        { name: "since_tag", label: "Tag to compare from", default: "$(git describe --tags --abbrev=0)", required: true },
      ],
      files: [],
    },
  },
  {
    id: "adr-writer",
    title: "Escribir ADR",
    title_en: "ADR writer",
    summary: "Skill que captura decisiones arquitectónicas como Architecture Decision Records.",
    summary_en: "Skill that captures architectural decisions as Architecture Decision Records.",
    category: "docs",
    tags: ["adr", "architecture", "decision", "docs"],
    artifact: {
      name: "adr-writer",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Cuando se toma una decisión arquitectónica significativa, captúrala como un ADR." },
      body_template:
        "# Redactor de ADR\n\n" +
        "Escribe un ADR para la decisión recién tomada. Usa esta estructura:\n\n" +
        "## Título\n" +
        "ADR-{{number}}: <título corto en imperativo>\n\n" +
        "## Estado\n" +
        "Propuesto\n\n" +
        "## Contexto\n" +
        "¿Qué situación o restricción forzó esta decisión?\n\n" +
        "## Decisión\n" +
        "Qué se decidió, en una o dos frases.\n\n" +
        "## Consecuencias\n" +
        "- Positivas: qué se vuelve más fácil o mejor.\n" +
        "- Negativas: qué se vuelve más difícil, qué deuda se asume.\n" +
        "- Neutras: qué cambia sin ser mejor ni peor.\n\n" +
        "Guarda en `docs/adr/ADR-{{number}}-<slug>.md`.\n",
      variables: [
        { name: "number", label: "Número de ADR", default: "001", required: true },
      ],
      files: [],
    },
    artifact_en: {
      name: "adr-writer",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "When a significant architectural decision is made, capture it as an ADR." },
      body_template:
        "# ADR writer\n\n" +
        "Write an ADR for the decision just made. Use this structure:\n\n" +
        "## Title\n" +
        "ADR-{{number}}: <short imperative title>\n\n" +
        "## Status\n" +
        "Proposed\n\n" +
        "## Context\n" +
        "What situation or constraint forced this decision?\n\n" +
        "## Decision\n" +
        "What was decided, in one or two sentences.\n\n" +
        "## Consequences\n" +
        "- Positive: what becomes easier or better.\n" +
        "- Negative: what becomes harder, what debt is taken on.\n" +
        "- Neutral: what changes but is neither better nor worse.\n\n" +
        "Save to `docs/adr/ADR-{{number}}-<slug>.md`.\n",
      variables: [
        { name: "number", label: "ADR number", default: "001", required: true },
      ],
      files: [],
    },
  },

  // ── Security ──────────────────────────────────────────────────────────────
  {
    id: "dependency-audit",
    title: "Auditoría de dependencias",
    title_en: "Dependency audit",
    summary: "Skill que evalúa el riesgo de seguridad de cada nueva dependencia añadida.",
    summary_en: "Skill that evaluates the security posture of each newly added dependency.",
    category: "security",
    tags: ["security", "dependencies", "npm", "cve", "supply chain"],
    artifact: {
      name: "dependency-audit",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Cuando se añaden nuevas dependencias, evalúa su postura de seguridad antes de hacer commit." },
      body_template:
        "# Auditoría de dependencias\n\n" +
        "Para cada dependencia recién añadida:\n\n" +
        "1. Comprueba la fecha del último publish y la cadencia de releases (inactiva = riesgo).\n" +
        "2. Anota el número de mantenedores (un único mantenedor = riesgo de bus factor).\n" +
        "3. Comprueba si tiene CVEs conocidos.\n" +
        "4. Verifica que el import está acotado (nada de `import *` de paquetes no confiables).\n" +
        "5. Señala cualquier paquete que solicite permisos inusuales del SO (bindings nativos, red en install).\n\n" +
        "Resumen: nombre | nivel de riesgo (bajo/medio/alto) | motivo | recomendación.\n",
      variables: [],
      files: [],
    },
    artifact_en: {
      name: "dependency-audit",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "When new packages are added, evaluate their security posture before committing." },
      body_template:
        "# Dependency audit\n\n" +
        "For each newly added dependency:\n\n" +
        "1. Check the package's last publish date and release cadence (stale = risk).\n" +
        "2. Note the number of maintainers (single-maintainer = bus-factor risk).\n" +
        "3. Check if it has known CVEs.\n" +
        "4. Verify the import is scoped (no `import *` from untrusted packages).\n" +
        "5. Flag any package that requests unusual OS permissions (native bindings, network on install).\n\n" +
        "Summarize as: package name | risk level (low/medium/high) | reason | recommendation.\n",
      variables: [],
      files: [],
    },
  },
  {
    id: "input-boundary-validator",
    title: "Validar entradas de API",
    title_en: "Input-boundary validator",
    summary: "Skill que comprueba que todas las entradas de un nuevo handler están validadas y saneadas.",
    summary_en: "Skill that checks every input of a new handler is validated and sanitized at the boundary.",
    category: "security",
    tags: ["security", "validation", "sanitization", "api", "owasp"],
    artifact: {
      name: "input-boundary-validator",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Al añadir una nueva ruta o handler, verifica que todas las entradas están validadas en el límite." },
      body_template:
        "# Validador de entradas en el límite\n\n" +
        "Para cada handler nuevo o modificado:\n\n" +
        "1. Lista cada campo tomado de `req.body`, `req.params`, `req.query` o datos de formulario.\n" +
        "2. Confirma que cada campo está validado (tipo, longitud, rango, allowlist) antes de usarse.\n" +
        "3. Confirma que cada campo está saneado antes de pasarse a una query, plantilla o subproceso.\n" +
        "4. Señala cualquier campo que fluya a SQL, shell, HTML o rutas de archivo sin validar.\n\n" +
        "Reporte: nombre de campo | origen | ¿validado? | ¿saneado? | riesgo.\n",
      variables: [],
      files: [],
    },
    artifact_en: {
      name: "input-boundary-validator",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "When adding a new API route or form handler, check that all inputs are validated at the boundary." },
      body_template:
        "# Input-boundary validator\n\n" +
        "For each new or changed request handler:\n\n" +
        "1. List every field taken from `req.body`, `req.params`, `req.query`, or form data.\n" +
        "2. Confirm each field is validated (type, length, range, allowlist) before use.\n" +
        "3. Confirm each field is sanitized before being passed to a query, template, or subprocess.\n" +
        "4. Flag any field that flows into SQL, shell, HTML, or file paths without validation.\n\n" +
        "Report: field name | source | validated? | sanitized? | risk.\n",
      variables: [],
      files: [],
    },
  },

  // ── Performance ───────────────────────────────────────────────────────────
  {
    id: "n-plus-one-detector",
    title: "Detector N+1",
    title_en: "N+1 query detector",
    summary: "Skill que detecta patrones N+1 en código que accede a la base de datos.",
    summary_en: "Skill that detects N+1 query patterns in database-touching code.",
    category: "perf",
    tags: ["performance", "n+1", "sql", "orm", "database"],
    artifact: {
      name: "n-plus-one-detector",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Al revisar código que accede a la BD, identifica patrones N+1 y propone la solución batch/eager." },
      body_template:
        "# Detector de N+1\n\n" +
        "Escanea el código modificado en busca de patrones N+1:\n\n" +
        "1. Encuentra cualquier bucle que ejecute una query en cada iteración.\n" +
        "2. Encuentra llamadas al ORM dentro de `.map()`, `.forEach()` o comprensiones de array.\n" +
        "3. Para cada hallazgo: muestra el archivo:línea, explica el N+1 y sugiere el fix con batch/eager-load.\n\n" +
        "Si el proyecto usa {{orm}}, prioriza sus mecanismos de eager loading integrados.\n",
      variables: [
        { name: "orm", label: "ORM del proyecto", default: "el ORM del proyecto", required: false },
      ],
      files: [],
    },
    artifact_en: {
      name: "n-plus-one-detector",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "When reviewing database-touching code, identify N+1 query patterns and propose the batch/eager fix." },
      body_template:
        "# N+1 query detector\n\n" +
        "Scan the changed code for N+1 patterns:\n\n" +
        "1. Find any loop that executes a DB query on each iteration.\n" +
        "2. Find ORM calls inside `.map()`, `.forEach()`, or array comprehensions.\n" +
        "3. For each hit: show the file:line, explain the N+1, and suggest the batch/eager-load fix.\n\n" +
        "If the codebase uses {{orm}}, prefer its built-in eager loading (`include`, `joinedload`, etc.).\n",
      variables: [
        { name: "orm", label: "Project ORM", default: "the project's ORM", required: false },
      ],
      files: [],
    },
  },
  {
    id: "bundle-size-watchdog",
    title: "Vigilante de bundle size",
    title_en: "Bundle-size watchdog",
    summary: "Skill que estima el impacto en el bundle JS de cada nuevo import añadido.",
    summary_en: "Skill that estimates the JS bundle impact of each new import added.",
    category: "perf",
    tags: ["performance", "bundle", "javascript", "tree-shaking", "lazy loading"],
    artifact: {
      name: "bundle-size-watchdog",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Tras añadir un nuevo import, estima su impacto en el bundle y sugiere alternativas si es grande." },
      body_template:
        "# Vigilante de bundle size\n\n" +
        "Para cada nuevo `import` añadido en el diff:\n\n" +
        "1. Comprueba si el paquete tiene una build ESM tree-shakeable.\n" +
        "2. Estima el tamaño min+gzip (usa datos de bundlephobia si están disponibles).\n" +
        "3. Si > 10 kB, sugiere una alternativa más ligera o dynamic import (`import()`).\n" +
        "4. Si el import solo se usa en una ruta, sugiere lazy loading.\n\n" +
        "Reporte: paquete | tamaño estimado | tree-shakeable | recomendación.\n",
      variables: [],
      files: [],
    },
    artifact_en: {
      name: "bundle-size-watchdog",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "After adding a new import, estimate its JS bundle impact and suggest alternatives if large." },
      body_template:
        "# Bundle-size watchdog\n\n" +
        "For each new `import` added in the diff:\n\n" +
        "1. Check if the package has a tree-shakeable ESM build.\n" +
        "2. Estimate the min+gzip size (use bundlephobia data if available).\n" +
        "3. If > 10 kB, suggest a lighter alternative or dynamic import (`import()`).\n" +
        "4. If the import is used only in a single route, suggest lazy loading.\n\n" +
        "Report: package | estimated size | tree-shakeable | recommendation.\n",
      variables: [],
      files: [],
    },
  },

  // ── Git / workflow ────────────────────────────────────────────────────────
  {
    id: "branch-hygiene",
    title: "Higiene de rama",
    title_en: "Branch hygiene",
    summary: "Skill que verifica que la rama está lista para revisión antes de abrir un PR.",
    summary_en: "Skill that verifies the branch is clean and ready for review before opening a PR.",
    category: "git",
    tags: ["git", "pr", "branch", "review", "checklist"],
    artifact: {
      name: "branch-hygiene",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Antes de abrir un PR, verifica que la rama está limpia, actualizada y lista para revisión." },
      body_template:
        "# Higiene de rama\n\n" +
        "Antes de abrir un PR desde esta rama:\n\n" +
        "1. Confirma que la rama está actualizada con `{{base}}` (sin commits divergidos).\n" +
        "2. Comprueba si hay merge commits en el historial de la rama (preferible rebase).\n" +
        "3. Confirma que no hay archivos `.env`, credenciales ni outputs de build staged.\n" +
        "4. Verifica que el número de commits es razonable (squash si > {{max_commits}} para un cambio pequeño).\n" +
        "5. Ejecuta la suite de tests una última vez.\n\n" +
        "Indica pasa/falla para cada comprobación.\n",
      variables: [
        { name: "base", label: "Rama base", default: "main", required: true },
        { name: "max_commits", label: "Máx. commits antes de squash", default: "5", required: false },
      ],
      files: [],
    },
    artifact_en: {
      name: "branch-hygiene",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Before opening a PR, verify the branch is clean, up to date and ready for review." },
      body_template:
        "# Branch hygiene\n\n" +
        "Before opening a PR from this branch:\n\n" +
        "1. Confirm the branch is up to date with `{{base}}` (no diverged commits).\n" +
        "2. Check for merge commits in the branch history (prefer rebase).\n" +
        "3. Confirm there are no `.env`, credential, or build-output files staged.\n" +
        "4. Verify the number of commits is reasonable (squash if > {{max_commits}} for a small change).\n" +
        "5. Run the test suite one final time.\n\n" +
        "Report pass/fail for each check.\n",
      variables: [
        { name: "base", label: "Base branch", default: "main", required: true },
        { name: "max_commits", label: "Max commits before squash", default: "5", required: false },
      ],
      files: [],
    },
  },
  {
    id: "rollback-plan",
    title: "Plan de rollback",
    title_en: "Rollback plan writer",
    summary: "Skill que documenta el procedimiento de rollback antes de desplegar un cambio crítico.",
    summary_en: "Skill that documents the rollback procedure before deploying a breaking change.",
    category: "git",
    tags: ["deployment", "rollback", "runbook", "ops"],
    artifact: {
      name: "rollback-plan",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Antes de desplegar un cambio con riesgo, documenta el plan de rollback." },
      body_template:
        "# Plan de rollback\n\n" +
        "Para el cambio a punto de desplegarse, escribe un runbook de rollback:\n\n" +
        "1. **Detección** — qué métrica o alerta indica que el despliegue fue mal.\n" +
        "2. **Umbral de decisión** — en qué punto hacer rollback (tasa de error, latencia…).\n" +
        "3. **Pasos de rollback** — comandos/acciones ordenados para revertir, incluidas migraciones de BD si las hay.\n" +
        "4. **Verificación** — cómo confirmar que el rollback fue exitoso.\n" +
        "5. **Responsable** — quién está de guardia y cómo contactarle.\n\n" +
        "Mantenlo corto: debe poder ejecutarse bajo presión.\n",
      variables: [],
      files: [],
    },
    artifact_en: {
      name: "rollback-plan",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Before deploying a risky change, document the rollback procedure." },
      body_template:
        "# Rollback plan\n\n" +
        "For the change about to be deployed, write a rollback runbook:\n\n" +
        "1. **Detection** — what metric or alert signals the deploy went wrong.\n" +
        "2. **Decision threshold** — at what point to roll back (error rate, latency, …).\n" +
        "3. **Rollback steps** — ordered commands/actions to revert, including DB migrations if any.\n" +
        "4. **Verification** — how to confirm the rollback succeeded.\n" +
        "5. **Owner** — who is on call and how to reach them.\n\n" +
        "Keep it short enough to execute under pressure.\n",
      variables: [],
      files: [],
    },
  },

  // ── AI-agent specific ─────────────────────────────────────────────────────
  {
    id: "prompt-hygiene-reviewer",
    title: "Revisión de prompt",
    title_en: "Prompt hygiene reviewer",
    summary: "Skill que detecta contradicciones, ambigüedad y alcance excesivo en un system prompt.",
    summary_en: "Skill that detects contradictions, ambiguity and scope creep in a system prompt.",
    category: "agents",
    tags: ["prompt", "system prompt", "agent", "review", "quality"],
    artifact: {
      name: "prompt-hygiene-reviewer",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Al editar un system prompt o cuerpo de agente, revísalo en busca de problemas comunes de calidad." },
      body_template:
        "# Revisión de higiene de prompt\n\n" +
        "Revisa el prompt proporcionado en busca de:\n\n" +
        "1. **Contradicción** — instrucciones que se contradicen entre sí.\n" +
        "2. **Ambigüedad** — verbos como «gestiona», «trata», «maneja» sin definición concreta.\n" +
        "3. **Caso de error ausente** — qué debe hacer el agente cuando la entrada es inesperada o falta.\n" +
        "4. **Alcance excesivo** — el prompt pide al agente hacer más de un trabajo claramente definido.\n" +
        "5. **Tokens desperdiciados** — frases repetidas o verbosas que podrían resumirse.\n\n" +
        "Devuelve una reescritura estilo diff con comentarios en línea explicando cada cambio.\n",
      variables: [],
      files: [],
    },
    artifact_en: {
      name: "prompt-hygiene-reviewer",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "When editing a system prompt or agent body, review it for common prompt-quality issues." },
      body_template:
        "# Prompt hygiene reviewer\n\n" +
        "Review the provided prompt for:\n\n" +
        "1. **Contradiction** — instructions that conflict with each other.\n" +
        "2. **Ambiguity** — verbs like \"handle\", \"deal with\", \"manage\" without a concrete definition.\n" +
        "3. **Missing failure mode** — what the agent should do when input is unexpected or missing.\n" +
        "4. **Scope creep** — the prompt asks the agent to do more than one clearly defined job.\n" +
        "5. **Token waste** — repeated or verbose phrasing that could be tightened.\n\n" +
        "Return a diff-style rewrite with inline comments explaining each change.\n",
      variables: [],
      files: [],
    },
  },
  {
    id: "tool-schema-validator",
    title: "Validar esquema de herramienta",
    title_en: "Tool-schema validator",
    summary: "Skill que valida un esquema JSON de herramienta MCP o function-calling antes de usarlo.",
    summary_en: "Skill that validates an MCP tool or function-calling JSON schema before use.",
    category: "agents",
    tags: ["mcp", "tool use", "function calling", "schema", "json"],
    artifact: {
      name: "tool-schema-validator",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "Al definir una nueva herramienta MCP o de function-calling, valida el esquema JSON antes de usarlo." },
      body_template:
        "# Validador de esquema de herramienta\n\n" +
        "Para el esquema JSON de herramienta proporcionado:\n\n" +
        "1. Verifica que cada parámetro tiene una `description` (los modelos la usan para el routing).\n" +
        "2. Verifica que los campos obligatorios están en el array `required`.\n" +
        "3. Confirma que ningún nombre de parámetro colisiona con palabras reservadas del runtime.\n" +
        "4. Comprueba que los valores `enum` son exhaustivos y en minúsculas.\n" +
        "5. Confirma que el `description` de la herramienta indica *cuándo* llamarla, no solo *qué* hace.\n\n" +
        "Reporta cada problema con una corrección sugerida.\n",
      variables: [],
      files: [],
    },
    artifact_en: {
      name: "tool-schema-validator",
      type: "skill",
      target: "opencode",
      frontmatter: { description: "When defining a new MCP tool or function-calling schema, validate it before use." },
      body_template:
        "# Tool-schema validator\n\n" +
        "For the provided JSON tool schema:\n\n" +
        "1. Verify every parameter has a `description` (models use these for routing).\n" +
        "2. Verify required fields are listed in the `required` array.\n" +
        "3. Confirm no parameter name shadows a reserved word in the target runtime.\n" +
        "4. Check that enum values are exhaustive and lowercase.\n" +
        "5. Confirm the tool `description` states *when* to call it, not just *what* it does.\n\n" +
        "Report each issue with a suggested fix.\n",
      variables: [],
      files: [],
    },
  },
  // ── OpenSpec templates ────────────────────────────────────────────────────
  {
    id: "os-feature",
    title: "Especificación de feature",
    title_en: "Feature specification",
    summary: "Plantilla OpenSpec completa con Propósito, 3 Requisitos SHALL y escenarios Gherkin para cualquier feature.",
    summary_en: "Full OpenSpec template with Purpose, 3 SHALL Requirements and Gherkin scenarios for any feature.",
    category: "openspec",
    tags: ["openspec", "spec", "requirements", "gherkin", "shall"],
    artifact: {
      name: "feature-spec",
      type: "openspec",
      target: "opencode",
      frontmatter: { feature: "", version: "1.0", status: "draft", agents: "claude-code, opencode" },
      body_template:
        "# {{feature}} Specification\n" +
        "<!-- version: {{version}} | status: {{status}} | agents: {{agents}} -->\n\n" +
        "## Purpose\n\n" +
        "{{purpose}}\n\n" +
        "## Requirements\n\n" +
        "### Requirement: Funcionalidad principal\n\n" +
        "El sistema DEBE {{req_core}}.\n\n" +
        "#### Escenario: Caso exitoso\n\n" +
        "- DADO {{dado_1}}\n" +
        "- CUANDO {{cuando_1}}\n" +
        "- ENTONCES {{entonces_1}}\n\n" +
        "### Requirement: Manejo de errores\n\n" +
        "El sistema DEBE rechazar {{req_error}} y retornar un error descriptivo.\n\n" +
        "#### Escenario: Entrada inválida\n\n" +
        "- DADO {{dado_2}}\n" +
        "- CUANDO {{cuando_2}}\n" +
        "- ENTONCES {{entonces_2}}\n\n" +
        "### Requirement: Rendimiento\n\n" +
        "El sistema DEBE responder en menos de {{max_latency}} bajo carga normal.\n\n" +
        "#### Escenario: Carga esperada\n\n" +
        "- DADO {{dado_3}}\n" +
        "- CUANDO {{cuando_3}}\n" +
        "- ENTONCES {{entonces_3}}\n",
      variables: [
        { name: "feature", label: "Nombre del feature", default: "Autenticación de usuarios", required: true },
        { name: "version", label: "Versión", default: "1.0", required: false },
        { name: "status", label: "Estado", default: "draft", required: false },
        { name: "agents", label: "Agentes objetivo", default: "claude-code, opencode", required: false },
        { name: "purpose", label: "Propósito (un párrafo)", default: "Gestiona la autenticación de usuarios mediante magic-link. Emite una sesión cifrada al verificar el token.", required: true },
        { name: "req_core", label: "Req. principal (tras DEBE)", default: "enviar un enlace de verificación al email y crear una sesión al confirmarlo", required: true },
        { name: "dado_1", label: "DADO (caso exitoso)", default: "un usuario registrado con email válido", required: true },
        { name: "cuando_1", label: "CUANDO (caso exitoso)", default: "solicita un magic-link", required: true },
        { name: "entonces_1", label: "ENTONCES (caso exitoso)", default: "recibe un email con enlace de un solo uso válido 15 minutos", required: true },
        { name: "req_error", label: "Req. error (tras DEBE rechazar)", default: "emails malformados o dominios no permitidos", required: true },
        { name: "dado_2", label: "DADO (error)", default: "un email con dominio bloqueado", required: true },
        { name: "cuando_2", label: "CUANDO (error)", default: "se solicita el magic-link", required: true },
        { name: "entonces_2", label: "ENTONCES (error)", default: "retorna 422 con mensaje 'Dominio no permitido'", required: true },
        { name: "max_latency", label: "Latencia máxima", default: "300 ms", required: true },
        { name: "dado_3", label: "DADO (rendimiento)", default: "100 peticiones concurrentes", required: true },
        { name: "cuando_3", label: "CUANDO (rendimiento)", default: "llegan al endpoint de login", required: true },
        { name: "entonces_3", label: "ENTONCES (rendimiento)", default: "el p95 de latencia está bajo 300 ms", required: true },
      ],
      files: [],
    },
    artifact_en: {
      name: "feature-spec",
      type: "openspec",
      target: "opencode",
      frontmatter: { feature: "", version: "1.0", status: "draft", agents: "claude-code, opencode" },
      body_template:
        "# {{feature}} Specification\n" +
        "<!-- version: {{version}} | status: {{status}} | agents: {{agents}} -->\n\n" +
        "## Purpose\n\n" +
        "{{purpose}}\n\n" +
        "## Requirements\n\n" +
        "### Requirement: Core behavior\n\n" +
        "The system SHALL {{req_core}}.\n\n" +
        "#### Scenario: Happy path\n\n" +
        "- GIVEN {{given_1}}\n" +
        "- WHEN {{when_1}}\n" +
        "- THEN {{then_1}}\n\n" +
        "### Requirement: Error handling\n\n" +
        "The system SHALL reject {{req_error}} and return a descriptive error.\n\n" +
        "#### Scenario: Invalid input\n\n" +
        "- GIVEN {{given_2}}\n" +
        "- WHEN {{when_2}}\n" +
        "- THEN {{then_2}}\n\n" +
        "### Requirement: Performance\n\n" +
        "The system SHALL respond within {{max_latency}} under normal load.\n\n" +
        "#### Scenario: Expected load\n\n" +
        "- GIVEN {{given_3}}\n" +
        "- WHEN {{when_3}}\n" +
        "- THEN {{then_3}}\n",
      variables: [
        { name: "feature", label: "Feature name", default: "User Authentication", required: true },
        { name: "version", label: "Version", default: "1.0", required: false },
        { name: "status", label: "Status", default: "draft", required: false },
        { name: "agents", label: "Target agents", default: "claude-code, opencode", required: false },
        { name: "purpose", label: "Purpose (one paragraph)", default: "Manages user authentication via magic-link. Issues an encrypted session upon token verification.", required: true },
        { name: "req_core", label: "Core req (after SHALL)", default: "send a verification link to the email and create a session upon confirmation", required: true },
        { name: "given_1", label: "GIVEN (happy path)", default: "a registered user with a valid email", required: true },
        { name: "when_1", label: "WHEN (happy path)", default: "they request a magic-link", required: true },
        { name: "then_1", label: "THEN (happy path)", default: "they receive an email with a single-use link valid for 15 minutes", required: true },
        { name: "req_error", label: "Error req (after SHALL reject)", default: "malformed emails or disallowed domains", required: true },
        { name: "given_2", label: "GIVEN (error)", default: "an email with a blocked domain", required: true },
        { name: "when_2", label: "WHEN (error)", default: "the magic-link is requested", required: true },
        { name: "then_2", label: "THEN (error)", default: "returns 422 with message 'Domain not allowed'", required: true },
        { name: "max_latency", label: "Max latency", default: "300 ms", required: true },
        { name: "given_3", label: "GIVEN (performance)", default: "100 concurrent requests", required: true },
        { name: "when_3", label: "WHEN (performance)", default: "they hit the login endpoint", required: true },
        { name: "then_3", label: "THEN (performance)", default: "p95 latency is under 300 ms", required: true },
      ],
      files: [],
    },
  },
  {
    id: "os-api-endpoint",
    title: "Spec de endpoint REST",
    title_en: "REST API endpoint spec",
    summary: "Especificación OpenSpec para un endpoint HTTP: request, response, auth, errores y rate limiting.",
    summary_en: "OpenSpec for one HTTP endpoint: request, response, auth, errors and rate limiting.",
    category: "openspec",
    tags: ["openspec", "api", "rest", "endpoint", "http"],
    artifact: {
      name: "api-endpoint-spec",
      type: "openspec",
      target: "opencode",
      frontmatter: { feature: "", version: "1.0", status: "draft", agents: "claude-code, opencode" },
      body_template:
        "# {{method}} {{path}} Specification\n" +
        "<!-- version: {{version}} | status: {{status}} | agents: {{agents}} -->\n\n" +
        "## Purpose\n\n" +
        "{{purpose}}\n\n" +
        "## Requirements\n\n" +
        "### Requirement: Contrato de request\n\n" +
        "El sistema DEBE aceptar {{method}} en `{{path}}` con Content-Type `application/json`.\n" +
        "El cuerpo DEBE incluir: `{{required_fields}}`.\n\n" +
        "#### Escenario: Request válido\n\n" +
        "- DADO un cliente autenticado con {{auth_method}}\n" +
        "- CUANDO envía {{method}} `{{path}}` con campos válidos\n" +
        "- ENTONCES retorna {{success_status}} con `{{response_fields}}`\n\n" +
        "### Requirement: Autenticación\n\n" +
        "El sistema DEBE rechazar requests sin {{auth_method}} válido con 401.\n\n" +
        "#### Escenario: Sin autenticación\n\n" +
        "- DADO un cliente sin cabecera de autenticación\n" +
        "- CUANDO llama a {{method}} `{{path}}`\n" +
        "- ENTONCES retorna 401 con `{ \"error\": \"Unauthorized\" }`\n\n" +
        "### Requirement: Rate limiting\n\n" +
        "El sistema DEBE limitar a {{rate_limit}} por IP y retornar 429 al superarlo.\n\n" +
        "#### Escenario: Límite superado\n\n" +
        "- DADO una IP que ha realizado {{rate_limit}} en los últimos 60 s\n" +
        "- CUANDO envía una petición adicional\n" +
        "- ENTONCES retorna 429 con cabecera `Retry-After`\n",
      variables: [
        { name: "method", label: "Método HTTP", default: "POST", required: true },
        { name: "path", label: "Ruta", default: "/api/users", required: true },
        { name: "version", label: "Versión", default: "1.0", required: false },
        { name: "status", label: "Estado", default: "draft", required: false },
        { name: "agents", label: "Agentes objetivo", default: "claude-code, opencode", required: false },
        { name: "purpose", label: "Propósito", default: "Crea un nuevo usuario y retorna el perfil creado.", required: true },
        { name: "required_fields", label: "Campos requeridos", default: "email, name", required: true },
        { name: "auth_method", label: "Método de auth", default: "Bearer token en cabecera Authorization", required: true },
        { name: "success_status", label: "Código de éxito", default: "201 Created", required: true },
        { name: "response_fields", label: "Campos de respuesta", default: "id, email, createdAt", required: true },
        { name: "rate_limit", label: "Rate limit", default: "100 peticiones", required: true },
      ],
      files: [],
    },
    artifact_en: {
      name: "api-endpoint-spec",
      type: "openspec",
      target: "opencode",
      frontmatter: { feature: "", version: "1.0", status: "draft", agents: "claude-code, opencode" },
      body_template:
        "# {{method}} {{path}} Specification\n" +
        "<!-- version: {{version}} | status: {{status}} | agents: {{agents}} -->\n\n" +
        "## Purpose\n\n" +
        "{{purpose}}\n\n" +
        "## Requirements\n\n" +
        "### Requirement: Request contract\n\n" +
        "The system SHALL accept {{method}} at `{{path}}` with Content-Type `application/json`.\n" +
        "The body SHALL include: `{{required_fields}}`.\n\n" +
        "#### Scenario: Valid request\n\n" +
        "- GIVEN an authenticated client with {{auth_method}}\n" +
        "- WHEN they send {{method}} `{{path}}` with valid fields\n" +
        "- THEN returns {{success_status}} with `{{response_fields}}`\n\n" +
        "### Requirement: Authentication\n\n" +
        "The system SHALL reject requests without a valid {{auth_method}} with 401.\n\n" +
        "#### Scenario: Missing authentication\n\n" +
        "- GIVEN a client without an authentication header\n" +
        "- WHEN they call {{method}} `{{path}}`\n" +
        "- THEN returns 401 with `{ \"error\": \"Unauthorized\" }`\n\n" +
        "### Requirement: Rate limiting\n\n" +
        "The system SHALL limit to {{rate_limit}} per IP and return 429 when exceeded.\n\n" +
        "#### Scenario: Limit exceeded\n\n" +
        "- GIVEN an IP that has made {{rate_limit}} in the last 60 s\n" +
        "- WHEN they send one more request\n" +
        "- THEN returns 429 with a `Retry-After` header\n",
      variables: [
        { name: "method", label: "HTTP method", default: "POST", required: true },
        { name: "path", label: "Path", default: "/api/users", required: true },
        { name: "version", label: "Version", default: "1.0", required: false },
        { name: "status", label: "Status", default: "draft", required: false },
        { name: "agents", label: "Target agents", default: "claude-code, opencode", required: false },
        { name: "purpose", label: "Purpose", default: "Creates a new user and returns the created profile.", required: true },
        { name: "required_fields", label: "Required fields", default: "email, name", required: true },
        { name: "auth_method", label: "Auth method", default: "Bearer token in Authorization header", required: true },
        { name: "success_status", label: "Success status", default: "201 Created", required: true },
        { name: "response_fields", label: "Response fields", default: "id, email, createdAt", required: true },
        { name: "rate_limit", label: "Rate limit", default: "100 requests", required: true },
      ],
      files: [],
    },
  },
  {
    id: "os-auth-flow",
    title: "Spec de flujo de autenticación",
    title_en: "Authentication flow spec",
    summary: "Especificación OpenSpec para flujos de auth: magic-link, OAuth o JWT, con escenarios de éxito y fallo.",
    summary_en: "OpenSpec for auth flows: magic-link, OAuth or JWT, with success and failure scenarios.",
    category: "openspec",
    tags: ["openspec", "auth", "login", "jwt", "oauth", "magic-link"],
    artifact: {
      name: "auth-flow-spec",
      type: "openspec",
      target: "opencode",
      frontmatter: { feature: "", version: "1.0", status: "draft", agents: "claude-code, opencode" },
      body_template:
        "# {{auth_method}} Authentication Specification\n" +
        "<!-- version: {{version}} | status: {{status}} | agents: {{agents}} -->\n\n" +
        "## Purpose\n\n" +
        "Gestiona la autenticación de usuarios mediante {{auth_method}}. " +
        "Los tokens tienen un TTL de {{token_ttl}} y no se almacenan en localStorage.\n\n" +
        "## Requirements\n\n" +
        "### Requirement: Emisión de token\n\n" +
        "El sistema DEBE generar un token firmado con {{signing_alg}} al verificar la identidad del usuario.\n\n" +
        "#### Escenario: Login exitoso\n\n" +
        "- DADO un usuario registrado\n" +
        "- CUANDO completa el flujo de {{auth_method}}\n" +
        "- ENTONCES recibe una cookie HttpOnly con el token de sesión válida {{token_ttl}}\n\n" +
        "### Requirement: Expiración\n\n" +
        "El sistema DEBE invalidar tokens tras {{token_ttl}} y redirigir al login.\n\n" +
        "#### Escenario: Token expirado\n\n" +
        "- DADO un usuario con sesión de más de {{token_ttl}}\n" +
        "- CUANDO realiza una petición autenticada\n" +
        "- ENTONCES recibe 401 y es redirigido a /login\n\n" +
        "### Requirement: Protección de rutas\n\n" +
        "El sistema DEBE bloquear el acceso a rutas protegidas sin sesión válida.\n\n" +
        "#### Escenario: Acceso sin sesión\n\n" +
        "- DADO un visitante sin cookie de sesión\n" +
        "- CUANDO navega a {{protected_route}}\n" +
        "- ENTONCES es redirigido a /login con `?redirect={{protected_route}}`\n",
      variables: [
        { name: "auth_method", label: "Método de auth", default: "Magic-link", required: true },
        { name: "version", label: "Versión", default: "1.0", required: false },
        { name: "status", label: "Estado", default: "draft", required: false },
        { name: "agents", label: "Agentes objetivo", default: "claude-code, opencode", required: false },
        { name: "token_ttl", label: "TTL del token", default: "7 días", required: true },
        { name: "signing_alg", label: "Algoritmo de firma", default: "HS256 e iron-session", required: true },
        { name: "protected_route", label: "Ruta protegida de ejemplo", default: "/dashboard", required: true },
      ],
      files: [],
    },
    artifact_en: {
      name: "auth-flow-spec",
      type: "openspec",
      target: "opencode",
      frontmatter: { feature: "", version: "1.0", status: "draft", agents: "claude-code, opencode" },
      body_template:
        "# {{auth_method}} Authentication Specification\n" +
        "<!-- version: {{version}} | status: {{status}} | agents: {{agents}} -->\n\n" +
        "## Purpose\n\n" +
        "Manages user authentication via {{auth_method}}. " +
        "Tokens have a TTL of {{token_ttl}} and are never stored in localStorage.\n\n" +
        "## Requirements\n\n" +
        "### Requirement: Token issuance\n\n" +
        "The system SHALL generate a token signed with {{signing_alg}} upon verifying the user identity.\n\n" +
        "#### Scenario: Successful login\n\n" +
        "- GIVEN a registered user\n" +
        "- WHEN they complete the {{auth_method}} flow\n" +
        "- THEN they receive an HttpOnly cookie with a session token valid for {{token_ttl}}\n\n" +
        "### Requirement: Expiration\n\n" +
        "The system SHALL invalidate tokens after {{token_ttl}} and redirect to login.\n\n" +
        "#### Scenario: Expired token\n\n" +
        "- GIVEN a user whose session is older than {{token_ttl}}\n" +
        "- WHEN they make an authenticated request\n" +
        "- THEN they receive 401 and are redirected to /login\n\n" +
        "### Requirement: Route protection\n\n" +
        "The system SHALL block access to protected routes without a valid session.\n\n" +
        "#### Scenario: Unauthenticated access\n\n" +
        "- GIVEN a visitor without a session cookie\n" +
        "- WHEN they navigate to {{protected_route}}\n" +
        "- THEN they are redirected to /login with `?redirect={{protected_route}}`\n",
      variables: [
        { name: "auth_method", label: "Auth method", default: "Magic-link", required: true },
        { name: "version", label: "Version", default: "1.0", required: false },
        { name: "status", label: "Status", default: "draft", required: false },
        { name: "agents", label: "Target agents", default: "claude-code, opencode", required: false },
        { name: "token_ttl", label: "Token TTL", default: "7 days", required: true },
        { name: "signing_alg", label: "Signing algorithm", default: "HS256 via iron-session", required: true },
        { name: "protected_route", label: "Example protected route", default: "/dashboard", required: true },
      ],
      files: [],
    },
  },
  {
    id: "os-data-model",
    title: "Spec de modelo de datos",
    title_en: "Data model spec",
    summary: "Especificación OpenSpec para esquemas de base de datos: restricciones, validaciones y escenarios de migración.",
    summary_en: "OpenSpec for database schemas: constraints, validations and migration scenarios.",
    category: "openspec",
    tags: ["openspec", "database", "schema", "migration", "sql"],
    artifact: {
      name: "data-model-spec",
      type: "openspec",
      target: "opencode",
      frontmatter: { feature: "", version: "1.0", status: "draft", agents: "claude-code, opencode" },
      body_template:
        "# {{entity}} Data Model Specification\n" +
        "<!-- version: {{version}} | status: {{status}} | agents: {{agents}} -->\n\n" +
        "## Purpose\n\n" +
        "Define el esquema de la tabla `{{table}}`, sus restricciones e invariantes " +
        "para garantizar integridad de datos sin lógica en capa de aplicación.\n\n" +
        "## Requirements\n\n" +
        "### Requirement: Esquema de la tabla\n\n" +
        "El sistema DEBE crear la tabla `{{table}}` con las columnas: {{columns}}.\n" +
        "El campo `id` DEBE ser {{id_format}} y primary key.\n\n" +
        "#### Escenario: Inserción válida\n\n" +
        "- DADO los campos requeridos con valores válidos\n" +
        "- CUANDO se inserta un registro en `{{table}}`\n" +
        "- ENTONCES retorna el registro con `id` generado y `created_at` en UTC\n\n" +
        "### Requirement: Restricciones de integridad\n\n" +
        "El sistema DEBE rechazar {{null_constraint}} nulos y {{unique_constraint}} duplicados a nivel de base de datos.\n\n" +
        "#### Escenario: Valor nulo en campo requerido\n\n" +
        "- DADO un insert con {{null_constraint}} = NULL\n" +
        "- CUANDO se ejecuta la query\n" +
        "- ENTONCES la base de datos lanza NOT NULL constraint violation\n\n" +
        "### Requirement: Migración sin downtime\n\n" +
        "El sistema DEBE aplicar la migración de `{{table}}` sin bloquear lecturas en producción.\n\n" +
        "#### Escenario: Migración en producción\n\n" +
        "- DADO una tabla existente con datos\n" +
        "- CUANDO se ejecuta `npm run db:migrate`\n" +
        "- ENTONCES la migración completa sin error y sin bloquear queries en vuelo\n",
      variables: [
        { name: "entity", label: "Nombre de la entidad", default: "User", required: true },
        { name: "table", label: "Nombre de la tabla", default: "users", required: true },
        { name: "version", label: "Versión", default: "1.0", required: false },
        { name: "status", label: "Estado", default: "draft", required: false },
        { name: "agents", label: "Agentes objetivo", default: "claude-code, opencode", required: false },
        { name: "columns", label: "Columnas", default: "id, email, name, created_at, updated_at", required: true },
        { name: "id_format", label: "Formato del ID", default: "UUID v4", required: true },
        { name: "null_constraint", label: "Campo NOT NULL principal", default: "email", required: true },
        { name: "unique_constraint", label: "Campo UNIQUE", default: "email", required: true },
      ],
      files: [],
    },
    artifact_en: {
      name: "data-model-spec",
      type: "openspec",
      target: "opencode",
      frontmatter: { feature: "", version: "1.0", status: "draft", agents: "claude-code, opencode" },
      body_template:
        "# {{entity}} Data Model Specification\n" +
        "<!-- version: {{version}} | status: {{status}} | agents: {{agents}} -->\n\n" +
        "## Purpose\n\n" +
        "Defines the schema for the `{{table}}` table, its constraints and invariants " +
        "to guarantee data integrity without logic in the application layer.\n\n" +
        "## Requirements\n\n" +
        "### Requirement: Table schema\n\n" +
        "The system SHALL create the `{{table}}` table with columns: {{columns}}.\n" +
        "The `id` field SHALL be {{id_format}} and the primary key.\n\n" +
        "#### Scenario: Valid insert\n\n" +
        "- GIVEN all required fields with valid values\n" +
        "- WHEN a record is inserted into `{{table}}`\n" +
        "- THEN the record is returned with a generated `id` and `created_at` in UTC\n\n" +
        "### Requirement: Integrity constraints\n\n" +
        "The system SHALL reject null {{null_constraint}} and duplicate {{unique_constraint}} at the database level.\n\n" +
        "#### Scenario: Null value in required field\n\n" +
        "- GIVEN an insert with {{null_constraint}} = NULL\n" +
        "- WHEN the query is executed\n" +
        "- THEN the database raises a NOT NULL constraint violation\n\n" +
        "### Requirement: Zero-downtime migration\n\n" +
        "The system SHALL apply the `{{table}}` migration without blocking reads in production.\n\n" +
        "#### Scenario: Production migration\n\n" +
        "- GIVEN an existing table with data\n" +
        "- WHEN `npm run db:migrate` is executed\n" +
        "- THEN the migration completes without error and without blocking in-flight queries\n",
      variables: [
        { name: "entity", label: "Entity name", default: "User", required: true },
        { name: "table", label: "Table name", default: "users", required: true },
        { name: "version", label: "Version", default: "1.0", required: false },
        { name: "status", label: "Status", default: "draft", required: false },
        { name: "agents", label: "Target agents", default: "claude-code, opencode", required: false },
        { name: "columns", label: "Columns", default: "id, email, name, created_at, updated_at", required: true },
        { name: "id_format", label: "ID format", default: "UUID v4", required: true },
        { name: "null_constraint", label: "Primary NOT NULL field", default: "email", required: true },
        { name: "unique_constraint", label: "UNIQUE field", default: "email", required: true },
      ],
      files: [],
    },
  },
  {
    id: "os-background-job",
    title: "Spec de job en segundo plano",
    title_en: "Background job spec",
    summary: "Especificación OpenSpec para jobs asíncronos: schedule, reintentos, idempotencia y alertas de fallo.",
    summary_en: "OpenSpec for async background jobs: schedule, retries, idempotency and failure alerts.",
    category: "openspec",
    tags: ["openspec", "job", "queue", "async", "cron", "retry"],
    artifact: {
      name: "background-job-spec",
      type: "openspec",
      target: "opencode",
      frontmatter: { feature: "", version: "1.0", status: "draft", agents: "claude-code, opencode" },
      body_template:
        "# {{job_name}} Background Job Specification\n" +
        "<!-- version: {{version}} | status: {{status}} | agents: {{agents}} -->\n\n" +
        "## Purpose\n\n" +
        "{{purpose}}\n\n" +
        "## Requirements\n\n" +
        "### Requirement: Programación\n\n" +
        "El sistema DEBE ejecutar `{{job_name}}` según el schedule `{{schedule}}` " +
        "con un timeout de {{timeout}} por ejecución.\n\n" +
        "#### Escenario: Ejecución programada\n\n" +
        "- DADO que el schedule `{{schedule}}` se cumple\n" +
        "- CUANDO el job runner lo activa\n" +
        "- ENTONCES el job completa en menos de {{timeout}} y registra éxito en el log\n\n" +
        "### Requirement: Reintentos e idempotencia\n\n" +
        "El sistema DEBE reintentar hasta {{retry_count}} veces con backoff exponencial " +
        "y DEBE ser idempotente (reintentos no duplican efectos).\n\n" +
        "#### Escenario: Fallo transitorio\n\n" +
        "- DADO que el job falla con error de red\n" +
        "- CUANDO el runner lo reintenta\n" +
        "- ENTONCES el intento #2 retoma donde falló sin crear duplicados\n\n" +
        "### Requirement: Alerta de fallo permanente\n\n" +
        "El sistema DEBE emitir una alerta cuando el job falla {{retry_count}} veces consecutivas.\n\n" +
        "#### Escenario: Agotamiento de reintentos\n\n" +
        "- DADO que el job ha fallado {{retry_count}} veces seguidas\n" +
        "- CUANDO ocurre el último fallo\n" +
        "- ENTONCES se envía una alerta a {{alert_channel}} y el job queda en estado 'failed'\n",
      variables: [
        { name: "job_name", label: "Nombre del job", default: "EmailDigestJob", required: true },
        { name: "version", label: "Versión", default: "1.0", required: false },
        { name: "status", label: "Estado", default: "draft", required: false },
        { name: "agents", label: "Agentes objetivo", default: "claude-code, opencode", required: false },
        { name: "purpose", label: "Propósito", default: "Envía un resumen diario de actividad por email a los usuarios activos.", required: true },
        { name: "schedule", label: "Schedule (cron)", default: "0 8 * * *", required: true },
        { name: "timeout", label: "Timeout", default: "5 minutos", required: true },
        { name: "retry_count", label: "Reintentos máximos", default: "3", required: true },
        { name: "alert_channel", label: "Canal de alerta", default: "#alerts en Slack", required: true },
      ],
      files: [],
    },
    artifact_en: {
      name: "background-job-spec",
      type: "openspec",
      target: "opencode",
      frontmatter: { feature: "", version: "1.0", status: "draft", agents: "claude-code, opencode" },
      body_template:
        "# {{job_name}} Background Job Specification\n" +
        "<!-- version: {{version}} | status: {{status}} | agents: {{agents}} -->\n\n" +
        "## Purpose\n\n" +
        "{{purpose}}\n\n" +
        "## Requirements\n\n" +
        "### Requirement: Scheduling\n\n" +
        "The system SHALL run `{{job_name}}` on the `{{schedule}}` schedule " +
        "with a timeout of {{timeout}} per execution.\n\n" +
        "#### Scenario: Scheduled execution\n\n" +
        "- GIVEN the `{{schedule}}` schedule fires\n" +
        "- WHEN the job runner activates it\n" +
        "- THEN the job completes within {{timeout}} and logs success\n\n" +
        "### Requirement: Retries and idempotency\n\n" +
        "The system SHALL retry up to {{retry_count}} times with exponential backoff " +
        "and SHALL be idempotent (retries do not duplicate effects).\n\n" +
        "#### Scenario: Transient failure\n\n" +
        "- GIVEN the job fails with a network error\n" +
        "- WHEN the runner retries it\n" +
        "- THEN attempt #2 resumes without creating duplicates\n\n" +
        "### Requirement: Permanent failure alert\n\n" +
        "The system SHALL emit an alert when the job fails {{retry_count}} consecutive times.\n\n" +
        "#### Scenario: Retry exhaustion\n\n" +
        "- GIVEN the job has failed {{retry_count}} times in a row\n" +
        "- WHEN the last failure occurs\n" +
        "- THEN an alert is sent to {{alert_channel}} and the job is marked 'failed'\n",
      variables: [
        { name: "job_name", label: "Job name", default: "EmailDigestJob", required: true },
        { name: "version", label: "Version", default: "1.0", required: false },
        { name: "status", label: "Status", default: "draft", required: false },
        { name: "agents", label: "Target agents", default: "claude-code, opencode", required: false },
        { name: "purpose", label: "Purpose", default: "Sends a daily activity digest email to active users.", required: true },
        { name: "schedule", label: "Schedule (cron)", default: "0 8 * * *", required: true },
        { name: "timeout", label: "Timeout", default: "5 minutes", required: true },
        { name: "retry_count", label: "Max retries", default: "3", required: true },
        { name: "alert_channel", label: "Alert channel", default: "#alerts on Slack", required: true },
      ],
      files: [],
    },
  },

  // ── Java / Spring Boot ────────────────────────────────────────────────────
  {
    id: "spring-data-repository-reviewer",
    title: "Revisor de Spring Data",
    title_en: "Spring Data reviewer",
    summary: "Subagente que revisa repositorios y queries de Spring Data JPA en busca de N+1, fetch strategies y uso incorrecto de @Transactional.",
    summary_en: "Subagent that reviews Spring Data JPA repositories and queries for N+1s, fetch strategies and @Transactional misuse.",
    category: "data",
    tags: ["spring", "spring-data", "jpa", "hibernate", "n+1"],
    artifact: {
      name: "spring-data-reviewer",
      type: "subagent",
      target: "opencode",
      frontmatter: { description: "Revisa repositorios y servicios de Spring Data JPA/Hibernate buscando N+1, fetch strategies y problemas transaccionales. Invócalo al tocar código de acceso a datos." },
      body_template:
        "Eres un revisor experto en Spring Data JPA / Hibernate centrado en {{focus}}.\n\n" +
        "Para el repositorio o servicio dado:\n" +
        "1. Detecta problemas N+1: relaciones `@OneToMany`/`@ManyToMany` con fetch LAZY accedidas en bucle sin `JOIN FETCH` ni `@EntityGraph`.\n" +
        "2. Revisa el uso de `@Transactional`: métodos de solo lectura sin `readOnly = true`, propagación incorrecta, o transacciones abiertas más de lo necesario.\n" +
        "3. Verifica que los métodos derivados de `Repository` (`findBy...`) no oculten una query costosa; sugiere `@Query` con paginación si aplica.\n" +
        "4. Comprueba el uso de `Pageable`/`Sort` en vez de cargar colecciones completas en memoria.\n" +
        "5. Señala cualquier `EntityManager`/`Session` usado directamente sin necesidad clara.\n\n" +
        "Para cada hallazgo: archivo:línea, problema, y la corrección concreta (código, no solo descripción).\n",
      variables: [
        { name: "focus", label: "Enfoque de la revisión", default: "N+1, fetch strategies y transacciones", required: true },
      ],
      files: [],
    },
    artifact_en: {
      name: "spring-data-reviewer",
      type: "subagent",
      target: "opencode",
      frontmatter: { description: "Reviews Spring Data JPA/Hibernate repositories and services for N+1s, fetch strategies and transactional issues. Invoke it when touching data-access code." },
      body_template:
        "You are an expert Spring Data JPA / Hibernate reviewer focused on {{focus}}.\n\n" +
        "For the given repository or service:\n" +
        "1. Detect N+1 problems: LAZY `@OneToMany`/`@ManyToMany` relations accessed in a loop without `JOIN FETCH` or `@EntityGraph`.\n" +
        "2. Review `@Transactional` usage: read-only methods missing `readOnly = true`, wrong propagation, or transactions held open longer than needed.\n" +
        "3. Verify derived `Repository` methods (`findBy...`) don't hide an expensive query; suggest `@Query` with pagination where relevant.\n" +
        "4. Check for `Pageable`/`Sort` usage instead of loading entire collections into memory.\n" +
        "5. Flag any `EntityManager`/`Session` used directly without a clear need.\n\n" +
        "For each finding: file:line, problem, and a concrete fix (code, not just description).\n",
      variables: [
        { name: "focus", label: "Review focus", default: "N+1s, fetch strategies and transactions", required: true },
      ],
      files: [],
    },
  },
  {
    id: "spring-controller-openapi",
    title: "Controlador → OpenAPI",
    title_en: "Controller → OpenAPI",
    summary: "Slash command que genera la especificación OpenAPI/Swagger a partir de un @RestController de Spring.",
    summary_en: "Slash command that generates the OpenAPI/Swagger spec from a Spring @RestController.",
    category: "docs",
    tags: ["spring", "openapi", "swagger", "rest", "docs"],
    artifact: {
      name: "controller-to-openapi",
      type: "command",
      target: "opencode",
      frontmatter: { description: "Genera la especificación OpenAPI 3 a partir de un @RestController de Spring" },
      body_template:
        "A partir del @RestController/@RequestMapping indicado, genera la especificación OpenAPI 3 (YAML) para {{scope}}.\n\n" +
        "- Un `path` por cada método anotado con `@GetMapping`/`@PostMapping`/`@PutMapping`/`@DeleteMapping`/`@PatchMapping`.\n" +
        "- Infiere el schema del request body desde el DTO del parámetro `@RequestBody` (incluye validaciones `@NotNull`/`@Size` como `required`/`minLength`/`maxLength`).\n" +
        "- Infiere las respuestas desde el tipo de retorno y las anotaciones `@ResponseStatus`/`ResponseEntity<...>`.\n" +
        "- Incluye los parámetros de `@PathVariable` y `@RequestParam` con su tipo y si son opcionales.\n" +
        "- No inventes endpoints que no existan en el código.\n\n" +
        "Controlador: $ARGUMENTS\n",
      variables: [
        { name: "scope", label: "Alcance", default: "este controlador", required: false },
      ],
      files: [],
    },
    artifact_en: {
      name: "controller-to-openapi",
      type: "command",
      target: "opencode",
      frontmatter: { description: "Generates the OpenAPI 3 spec from a Spring @RestController" },
      body_template:
        "From the given @RestController/@RequestMapping, generate the OpenAPI 3 spec (YAML) for {{scope}}.\n\n" +
        "- One `path` per method annotated `@GetMapping`/`@PostMapping`/`@PutMapping`/`@DeleteMapping`/`@PatchMapping`.\n" +
        "- Infer the request body schema from the `@RequestBody` parameter's DTO (map `@NotNull`/`@Size` to `required`/`minLength`/`maxLength`).\n" +
        "- Infer responses from the return type and `@ResponseStatus`/`ResponseEntity<...>` annotations.\n" +
        "- Include `@PathVariable` and `@RequestParam` parameters with their type and whether they're optional.\n" +
        "- Don't invent endpoints that aren't in the code.\n\n" +
        "Controller: $ARGUMENTS\n",
      variables: [
        { name: "scope", label: "Scope", default: "this controller", required: false },
      ],
      files: [],
    },
  },
  {
    id: "mapstruct-mapper-generator",
    title: "Generar mapper MapStruct",
    title_en: "Generate MapStruct mapper",
    summary: "Slash command que genera una interfaz @Mapper de MapStruct entre una entidad JPA y su DTO.",
    summary_en: "Slash command that generates a MapStruct @Mapper interface between a JPA entity and its DTO.",
    category: "quality",
    tags: ["mapstruct", "dto", "jpa", "mapper", "boilerplate"],
    artifact: {
      name: "mapstruct-mapper",
      type: "command",
      target: "opencode",
      frontmatter: { description: "Genera una interfaz @Mapper de MapStruct entre una entidad y su DTO" },
      body_template:
        "Genera una interfaz `@Mapper(componentModel = \"{{component_model}}\")` de MapStruct que convierta entre {{entity}} y {{dto}}.\n\n" +
        "- Usa `@Mapping` explícito para cada campo cuyo nombre difiera entre entidad y DTO.\n" +
        "- Para relaciones anidadas, delega en otro mapper (`uses = {...}`) en vez de mapear manualmente.\n" +
        "- Añade métodos `toDto`, `toEntity` y, si se pide, `updateEntityFromDto` (`@MappingTarget`) para actualizaciones parciales.\n" +
        "- Ignora explícitamente (`ignore = true`) los campos gestionados por JPA (`id`, `createdAt`, `version`) al mapear hacia la entidad.\n" +
        "- No escribas la implementación: MapStruct la genera en tiempo de compilación.\n\n" +
        "Entidad: {{entity}}\nDTO: {{dto}}\n",
      variables: [
        { name: "entity", label: "Clase entidad", default: "User", required: true },
        { name: "dto", label: "Clase DTO", default: "UserDto", required: true },
        { name: "component_model", label: "componentModel", default: "spring", required: false },
      ],
      files: [],
    },
    artifact_en: {
      name: "mapstruct-mapper",
      type: "command",
      target: "opencode",
      frontmatter: { description: "Generates a MapStruct @Mapper interface between an entity and its DTO" },
      body_template:
        "Generate a MapStruct `@Mapper(componentModel = \"{{component_model}}\")` interface converting between {{entity}} and {{dto}}.\n\n" +
        "- Use explicit `@Mapping` for every field whose name differs between entity and DTO.\n" +
        "- For nested relations, delegate to another mapper (`uses = {...}`) instead of mapping manually.\n" +
        "- Add `toDto`, `toEntity` and, if requested, `updateEntityFromDto` (`@MappingTarget`) for partial updates.\n" +
        "- Explicitly ignore (`ignore = true`) JPA-managed fields (`id`, `createdAt`, `version`) when mapping onto the entity.\n" +
        "- Don't write the implementation: MapStruct generates it at compile time.\n\n" +
        "Entity: {{entity}}\nDTO: {{dto}}\n",
      variables: [
        { name: "entity", label: "Entity class", default: "User", required: true },
        { name: "dto", label: "DTO class", default: "UserDto", required: true },
        { name: "component_model", label: "componentModel", default: "spring", required: false },
      ],
      files: [],
    },
  },
  {
    id: "flyway-migration-reviewer",
    title: "Revisor de migraciones Flyway",
    title_en: "Flyway migration reviewer",
    summary: "Subagente que revisa scripts de migración Flyway/Liquibase en busca de cambios peligrosos o bloqueantes.",
    summary_en: "Subagent that reviews Flyway/Liquibase migration scripts for dangerous or locking changes.",
    category: "data",
    tags: ["flyway", "liquibase", "migration", "sql", "zero-downtime"],
    artifact: {
      name: "flyway-migration-reviewer",
      type: "subagent",
      target: "opencode",
      frontmatter: { description: "Revisa scripts de migración de base de datos buscando cambios que bloqueen tablas o rompan despliegues sin downtime." },
      body_template:
        "Eres un revisor de migraciones de base de datos ({{tool}}) centrado en despliegues sin downtime.\n\n" +
        "Para el script de migración dado, verifica:\n" +
        "1. `ALTER TABLE ADD COLUMN NOT NULL` sin `DEFAULT` — bloquea la tabla y rompe el código en despliegue; exige rehacerlo en pasos (nullable → backfill → not null).\n" +
        "2. Añadir un índice sin `CONCURRENTLY` (Postgres) — bloquea escrituras; recomienda `CREATE INDEX CONCURRENTLY`.\n" +
        "3. `DROP COLUMN`/`DROP TABLE` sin verificar que ningún código en producción los siga usando (rollout en dos fases).\n" +
        "4. Cambios de tipo de columna incompatibles que fuercen un rewrite completo de la tabla.\n" +
        "5. Migraciones no idempotentes o que no puedan revertirse limpiamente.\n\n" +
        "Para cada problema: severidad, por qué es peligroso, y la versión segura en pasos.\n",
      variables: [
        { name: "tool", label: "Herramienta de migración", default: "Flyway", required: true },
      ],
      files: [],
    },
    artifact_en: {
      name: "flyway-migration-reviewer",
      type: "subagent",
      target: "opencode",
      frontmatter: { description: "Reviews database migration scripts for changes that lock tables or break zero-downtime deploys." },
      body_template:
        "You are a database migration reviewer focused on zero-downtime deploys ({{tool}}).\n\n" +
        "For the given migration script, check:\n" +
        "1. `ALTER TABLE ADD COLUMN NOT NULL` without a `DEFAULT` — locks the table and breaks in-flight code; require the phased version (nullable → backfill → not null).\n" +
        "2. Adding an index without `CONCURRENTLY` (Postgres) — blocks writes; recommend `CREATE INDEX CONCURRENTLY`.\n" +
        "3. `DROP COLUMN`/`DROP TABLE` without confirming no production code still references it (two-phase rollout).\n" +
        "4. Incompatible column type changes that force a full table rewrite.\n" +
        "5. Non-idempotent migrations, or ones that can't be cleanly rolled back.\n\n" +
        "For each issue: severity, why it's dangerous, and the safe phased version.\n",
      variables: [
        { name: "tool", label: "Migration tool", default: "Flyway", required: true },
      ],
      files: [],
    },
  },
  {
    id: "testcontainers-scaffolder",
    title: "Scaffold de test con Testcontainers",
    title_en: "Testcontainers test scaffolder",
    summary: "Slash command que genera un test de integración Spring Boot con Testcontainers para el repositorio/servicio indicado.",
    summary_en: "Slash command that generates a Spring Boot integration test with Testcontainers for the given repository/service.",
    category: "testing",
    tags: ["testcontainers", "integration-test", "spring-boot", "junit5", "docker"],
    artifact: {
      name: "testcontainers-scaffold",
      type: "command",
      target: "opencode",
      frontmatter: { description: "Genera un test de integración JUnit 5 con Testcontainers para el repositorio/servicio indicado" },
      body_template:
        "Genera un test de integración JUnit 5 con Testcontainers para {{target}}.\n\n" +
        "- Usa `@SpringBootTest` + `@Testcontainers` con un contenedor `{{container}}` declarado como `static` y `@Container`.\n" +
        "- Registra las propiedades de conexión dinámicamente con `@DynamicPropertySource` (no hardcodees host/puerto).\n" +
        "- Reutiliza el contenedor entre clases de test si el proyecto ya tiene un patrón de contenedor compartido (singleton container); si no, créalo aquí.\n" +
        "- Escribe al menos un test que ejercite {{target}} contra el contenedor real (no un mock), cubriendo el camino feliz y un caso de error/restricción de BD.\n" +
        "- No uses H2 ni bases de datos en memoria: el objetivo es paridad con producción.\n\n" +
        "Repositorio/servicio objetivo: $ARGUMENTS\n",
      variables: [
        { name: "target", label: "Repositorio/servicio a testear", default: "el repositorio indicado", required: true },
        { name: "container", label: "Imagen de contenedor", default: "postgres:16-alpine", required: true },
      ],
      files: [],
    },
    artifact_en: {
      name: "testcontainers-scaffold",
      type: "command",
      target: "opencode",
      frontmatter: { description: "Generates a JUnit 5 integration test with Testcontainers for the given repository/service" },
      body_template:
        "Generate a JUnit 5 integration test with Testcontainers for {{target}}.\n\n" +
        "- Use `@SpringBootTest` + `@Testcontainers` with a `{{container}}` container declared `static` and `@Container`.\n" +
        "- Wire connection properties dynamically with `@DynamicPropertySource` (never hardcode host/port).\n" +
        "- Reuse the container across test classes if the project already has a shared-container pattern (singleton container); otherwise create it here.\n" +
        "- Write at least one test that exercises {{target}} against the real container (not a mock), covering the happy path and one error/DB-constraint case.\n" +
        "- Don't use H2 or in-memory databases: the goal is production parity.\n\n" +
        "Target repository/service: $ARGUMENTS\n",
      variables: [
        { name: "target", label: "Repository/service under test", default: "the given repository", required: true },
        { name: "container", label: "Container image", default: "postgres:16-alpine", required: true },
      ],
      files: [],
    },
  },
  {
    id: "clean-code-review",
    title: "Revisión Clean Code",
    title_en: "Clean Code review",
    summary: "Slash command que revisa código Java/Spring en busca de violaciones de SOLID, complejidad excesiva, mal naming y mal manejo de excepciones.",
    summary_en: "Slash command that reviews Java/Spring code for SOLID violations, excess complexity, poor naming and exception misuse.",
    category: "quality",
    tags: ["clean-code", "solid", "java", "complexity", "naming"],
    artifact: {
      name: "clean-code-review",
      type: "command",
      target: "opencode",
      frontmatter: { description: "Revisa el código en busca de violaciones de Clean Code/SOLID: complejidad, naming, excepciones e inmutabilidad." },
      body_template:
        "Revisa el siguiente código aplicando los principios de Clean Code y SOLID, con foco en {{focus}}.\n\n" +
        "Comprueba específicamente:\n" +
        "1. **SRP** — ¿la clase/método hace más de una cosa? Señala responsabilidades mezcladas.\n" +
        "2. **Complejidad** — métodos de más de {{max_lines}} líneas o con complejidad ciclomática alta (muchos `if`/`else`/`switch` anidados); sugiere extraer método o usar polimorfismo.\n" +
        "3. **Naming** — nombres de variables/métodos que no revelan intención (`data`, `tmp`, `process()`), booleanos sin prefijo `is`/`has`, abreviaturas poco claras.\n" +
        "4. **Excepciones** — uso de excepciones checked para control de flujo, catch genéricos (`catch (Exception e)`), o excepciones tragadas sin log.\n" +
        "5. **Inmutabilidad** — campos mutables que podrían ser `final`, setters innecesarios en objetos que deberían ser value objects.\n" +
        "6. **Nivel de abstracción** — mezcla de código de alto nivel (orquestación) y bajo nivel (detalles de implementación) en el mismo método.\n\n" +
        "Para cada hallazgo: archivo:línea, principio violado, y la corrección concreta. No reescribas todo el archivo.\n\n" +
        "Código: $ARGUMENTS\n",
      variables: [
        { name: "focus", label: "Enfoque de la revisión", default: "SOLID, complejidad y naming", required: true },
        { name: "max_lines", label: "Máx. líneas por método antes de sugerir extraer", default: "20", required: false },
      ],
      files: [],
    },
    artifact_en: {
      name: "clean-code-review",
      type: "command",
      target: "opencode",
      frontmatter: { description: "Reviews code for Clean Code/SOLID violations: complexity, naming, exceptions and immutability." },
      body_template:
        "Review the following code applying Clean Code and SOLID principles, focused on {{focus}}.\n\n" +
        "Specifically check for:\n" +
        "1. **SRP** — does the class/method do more than one thing? Flag mixed responsibilities.\n" +
        "2. **Complexity** — methods longer than {{max_lines}} lines or with high cyclomatic complexity (deeply nested `if`/`else`/`switch`); suggest extract-method or polymorphism.\n" +
        "3. **Naming** — variable/method names that don't reveal intent (`data`, `tmp`, `process()`), booleans missing an `is`/`has` prefix, unclear abbreviations.\n" +
        "4. **Exceptions** — checked exceptions used for flow control, generic `catch (Exception e)`, or swallowed exceptions with no logging.\n" +
        "5. **Immutability** — mutable fields that could be `final`, unnecessary setters on objects that should be value objects.\n" +
        "6. **Abstraction level** — high-level orchestration code mixed with low-level implementation detail in the same method.\n\n" +
        "For each finding: file:line, principle violated, and a concrete fix. Don't rewrite the whole file.\n\n" +
        "Code: $ARGUMENTS\n",
      variables: [
        { name: "focus", label: "Review focus", default: "SOLID, complexity and naming", required: true },
        { name: "max_lines", label: "Max lines per method before suggesting extraction", default: "20", required: false },
      ],
      files: [],
    },
  },
  {
    id: "os-spring-data-repository",
    title: "Spec de repositorio Spring Data",
    title_en: "Spring Data repository spec",
    summary: "Especificación OpenSpec para un método de repositorio Spring Data: contrato de paginación, ordenación y límites transaccionales.",
    summary_en: "OpenSpec for a Spring Data repository method: pagination/sorting contract and transaction boundaries.",
    category: "openspec",
    tags: ["openspec", "spring-data", "jpa", "repository", "pagination", "transaction"],
    artifact: {
      name: "spring-data-repository-spec",
      type: "openspec",
      target: "opencode",
      frontmatter: { feature: "", version: "1.0", status: "draft", agents: "claude-code, opencode" },
      body_template:
        "# {{repository}} Specification\n" +
        "<!-- version: {{version}} | status: {{status}} | agents: {{agents}} -->\n\n" +
        "## Purpose\n\n" +
        "{{purpose}}\n\n" +
        "## Requirements\n\n" +
        "### Requirement: Contrato de consulta\n\n" +
        "El sistema DEBE exponer `{{method_signature}}` en `{{repository}}`, devolviendo resultados paginados y ordenados según se indique.\n\n" +
        "#### Escenario: Página válida\n\n" +
        "- DADO {{given_1}}\n" +
        "- CUANDO se invoca `{{method_signature}}` con `{{page_params}}`\n" +
        "- ENTONCES retorna una `Page<{{entity}}>` de tamaño ≤ {{page_size}}, ordenada por `{{sort_field}}`\n\n" +
        "### Requirement: Límite transaccional\n\n" +
        "El sistema DEBE ejecutar el método dentro de `@Transactional({{transaction_attrs}})`, sin dejar la conexión abierta más allá del método.\n\n" +
        "#### Escenario: Acceso perezoso fuera de transacción\n\n" +
        "- DADO que el método se invoca desde fuera de un contexto transaccional activo\n" +
        "- CUANDO se accede a una colección `LAZY` del resultado tras retornar\n" +
        "- ENTONCES la colección DEBE haberse cargado ya con `JOIN FETCH`/`@EntityGraph`, o DEBE lanzarse una excepción controlada en vez de un `LazyInitializationException` sin manejar\n\n" +
        "### Requirement: Rendimiento\n\n" +
        "El sistema DEBE resolver la consulta sin generar el patrón N+1 para {{eager_relations}}.\n\n" +
        "#### Escenario: Colección anidada\n\n" +
        "- DADO un resultado con {{eager_relations}} asociadas\n" +
        "- CUANDO se serializa la respuesta\n" +
        "- ENTONCES se ejecuta una única query adicional (o ninguna) para cargar {{eager_relations}}, no una por fila\n",
      variables: [
        { name: "repository", label: "Nombre del repositorio", default: "OrderRepository", required: true },
        { name: "version", label: "Versión", default: "1.0", required: false },
        { name: "status", label: "Estado", default: "draft", required: false },
        { name: "agents", label: "Agentes objetivo", default: "claude-code, opencode", required: false },
        { name: "purpose", label: "Propósito (un párrafo)", default: "Define el contrato de consulta paginada de pedidos por cliente, con ordenación estable y sin N+1.", required: true },
        { name: "method_signature", label: "Firma del método", default: "Page<Order> findByCustomerId(Long customerId, Pageable pageable)", required: true },
        { name: "entity", label: "Entidad devuelta", default: "Order", required: true },
        { name: "given_1", label: "DADO (página válida)", default: "un cliente con 25 pedidos", required: true },
        { name: "page_params", label: "Parámetros de página", default: "page=0, size=10, sort=createdAt,desc", required: true },
        { name: "page_size", label: "Tamaño de página", default: "10", required: true },
        { name: "sort_field", label: "Campo de ordenación", default: "createdAt", required: true },
        { name: "transaction_attrs", label: "Atributos de @Transactional", default: "readOnly = true", required: true },
        { name: "eager_relations", label: "Relaciones cargadas junto al resultado", default: "OrderItem", required: true },
      ],
      files: [],
    },
    artifact_en: {
      name: "spring-data-repository-spec",
      type: "openspec",
      target: "opencode",
      frontmatter: { feature: "", version: "1.0", status: "draft", agents: "claude-code, opencode" },
      body_template:
        "# {{repository}} Specification\n" +
        "<!-- version: {{version}} | status: {{status}} | agents: {{agents}} -->\n\n" +
        "## Purpose\n\n" +
        "{{purpose}}\n\n" +
        "## Requirements\n\n" +
        "### Requirement: Query contract\n\n" +
        "The system SHALL expose `{{method_signature}}` on `{{repository}}`, returning paginated and sorted results as requested.\n\n" +
        "#### Scenario: Valid page\n\n" +
        "- GIVEN {{given_1}}\n" +
        "- WHEN `{{method_signature}}` is invoked with `{{page_params}}`\n" +
        "- THEN it returns a `Page<{{entity}}>` of size ≤ {{page_size}}, sorted by `{{sort_field}}`\n\n" +
        "### Requirement: Transaction boundary\n\n" +
        "The system SHALL run the method inside `@Transactional({{transaction_attrs}})`, without holding the connection open beyond the method.\n\n" +
        "#### Scenario: Lazy access outside a transaction\n\n" +
        "- GIVEN the method is invoked from outside an active transactional context\n" +
        "- WHEN a `LAZY` collection on the result is accessed after it returns\n" +
        "- THEN the collection SHALL already have been loaded via `JOIN FETCH`/`@EntityGraph`, or a controlled exception SHALL be thrown instead of an unhandled `LazyInitializationException`\n\n" +
        "### Requirement: Performance\n\n" +
        "The system SHALL resolve the query without producing the N+1 pattern for {{eager_relations}}.\n\n" +
        "#### Scenario: Nested collection\n\n" +
        "- GIVEN a result with associated {{eager_relations}}\n" +
        "- WHEN the response is serialized\n" +
        "- THEN a single additional query (or none) loads {{eager_relations}}, not one per row\n",
      variables: [
        { name: "repository", label: "Repository name", default: "OrderRepository", required: true },
        { name: "version", label: "Version", default: "1.0", required: false },
        { name: "status", label: "Status", default: "draft", required: false },
        { name: "agents", label: "Target agents", default: "claude-code, opencode", required: false },
        { name: "purpose", label: "Purpose (one paragraph)", default: "Defines the paginated query contract for orders by customer, with stable sorting and no N+1s.", required: true },
        { name: "method_signature", label: "Method signature", default: "Page<Order> findByCustomerId(Long customerId, Pageable pageable)", required: true },
        { name: "entity", label: "Returned entity", default: "Order", required: true },
        { name: "given_1", label: "GIVEN (valid page)", default: "a customer with 25 orders", required: true },
        { name: "page_params", label: "Page params", default: "page=0, size=10, sort=createdAt,desc", required: true },
        { name: "page_size", label: "Page size", default: "10", required: true },
        { name: "sort_field", label: "Sort field", default: "createdAt", required: true },
        { name: "transaction_attrs", label: "@Transactional attributes", default: "readOnly = true", required: true },
        { name: "eager_relations", label: "Relations loaded with the result", default: "OrderItem", required: true },
      ],
      files: [],
    },
  },
];

export function getSuggestion(id) {
  return SUGGESTIONS.find((s) => s.id === id) || null;
}
