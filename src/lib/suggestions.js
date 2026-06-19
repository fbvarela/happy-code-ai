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
];

export function getSuggestion(id) {
  return SUGGESTIONS.find((s) => s.id === id) || null;
}
