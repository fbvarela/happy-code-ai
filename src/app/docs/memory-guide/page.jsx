"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// ── Content ─────────────────────────────────────────────────────────────────

const CATEGORIES_EN = [
  {
    slug: "project",
    label: "Project context",
    file: "project.md",
    dir: ".claude/memory/",
    tag: "Named file",
    tagColor: "var(--bark)",
    when: "Load once at session start. Contains stable facts about the codebase: goals, tech stack, phase, key constraints. Rarely changes.",
    example: `# Project

## Overview
E-commerce platform for B2B wholesale. Multi-tenant SaaS.
Current phase: migrating monolith → microservices.

## Tech stack
- Backend: Node.js 20, Express, PostgreSQL (Neon)
- Frontend: Next.js 15, JSX only (no TypeScript)
- Auth: Clerk
- Infra: Vercel + GitHub Actions

## Key constraints
- Public API v1 is frozen — no breaking changes
- All DB migrations must be backward-compatible
- Max bundle: 250kB gzipped (LCP requirement)
- No global mutable state (Vercel Fluid Compute)`,
  },
  {
    slug: "conventions",
    label: "Code conventions",
    file: "conventions.md",
    dir: ".claude/memory/",
    tag: "Named file",
    tagColor: "var(--bark)",
    when: "The single most valuable memory file. Prevents the agent from inventing style or fighting existing patterns. Include anything that would trip up a new senior dev in their first PR.",
    example: `# Conventions

## Naming
- Files: kebab-case (user-profile.js, not UserProfile.js)
- React components: PascalCase
- DB columns: snake_case
- API routes: REST plural nouns (/users, /orders)

## Code style
- 2-space indent, single quotes, no semicolons
- Inline styles with CSS variables — no Tailwind, no CSS modules
- Imports: React → third-party → local (blank line between groups)
- No TypeScript — JSX only across the entire codebase

## Comments
- Default: no comments
- Only add when the WHY is non-obvious (hidden constraint,
  subtle invariant, workaround for a specific bug)
- Never describe WHAT the code does — names do that

## Error handling
- API routes: always return { error: string } on failure
- Never expose raw errors or stack traces to clients
- Log with context: logger.error({ userId, route, err })`,
  },
  {
    slug: "architecture",
    label: "Architecture",
    file: "architecture.md",
    dir: ".claude/memory/",
    tag: "Named file",
    tagColor: "var(--bark)",
    when: "Critical invariants and design patterns. Focus on things that are non-obvious and would cause subtle bugs if violated. Not a full architecture doc — just what the agent needs to avoid wrong turns.",
    example: `# Architecture

## Data flow
Request → Middleware (auth check) → API route → Service → DB
Never query DB directly from API routes — always via services in src/lib/

## Key patterns
- Repository pattern for all DB access (src/lib/db/*.js)
- Strategy pattern for renderers (src/lib/renderers/)
- Server components fetch data; client components handle interaction

## Critical invariants
- octokitForUser() decrypts stored token — never expose raw tokens
- commitFiles() is atomic — use it for all multi-file GitHub writes
- iron-session is the only auth store — never add a second one

## Known gotchas
- next dev requires --webpack flag (Turbopack has config conflicts)
- /api/repos is GitHub rate-limited — results cached 5 min
- CSS variables cascade from :root in globals.css — don't override inline`,
  },
  {
    slug: "workflow",
    label: "Workflow & commands",
    file: "workflow.md",
    dir: ".claude/memory/",
    tag: "Named file",
    tagColor: "var(--bark)",
    when: "Saves the agent from asking how to run things. Especially useful in repos with non-standard tooling or multi-step setup.",
    example: `# Workflow

## Setup
pnpm install
cp .env.example .env.local   # fill GitHub OAuth + iron-session secret
pnpm db:migrate
pnpm dev                     # --webpack flag set in package.json

## Common commands
pnpm dev          start dev server (port 3000)
pnpm build        production build (webpack mode)
pnpm db:migrate   run pending DB migrations
node scripts/seed.mjs  seed local DB with test data

## Testing
No automated test suite. Verify manually via browser.
For API routes: curl with a valid session cookie from browser devtools.
Use: curl -b "cookie=..." http://localhost:3000/api/...

## Git workflow
- Branch from main: feat/*, fix/*, ui/*
- PR → main (squash merge)
- Never commit directly to main
- CI runs build check on every PR`,
  },
  {
    slug: "persona",
    label: "Agent behavior",
    file: "CLAUDE.md (root section)",
    dir: "",
    tag: "Root memory",
    tagColor: "var(--leaf, #2a7a2a)",
    when: "Goes in the root memory file (CLAUDE.md / AGENTS.md), not a named file — it needs to be loaded every session. Defines tone, assumptions, and decision-making style.",
    example: `## Agent behavior

You are helping build a developer tool for senior software engineers.

Assume technical fluency — skip basic explanations.
Be direct and terse. No preambles ("Great question!", "Certainly!").

When you suggest an approach, recommend ONE and state the tradeoff.
Don't enumerate all options — the developer will redirect if needed.

Prefer editing existing files over creating new ones.
Default to no comments in code unless the WHY is non-obvious.
Don't add error handling for scenarios that can't happen.
Don't add abstractions beyond what the current task requires.

If something is unclear, ask ONE focused question.
Don't ask multiple clarifying questions at once.`,
  },
  {
    slug: "domain",
    label: "Domain knowledge",
    file: "domain.md",
    dir: ".claude/memory/",
    tag: "Named file",
    tagColor: "var(--bark)",
    when: "Business logic and terminology that aren't in the code. Prevents the agent from misunderstanding domain concepts or implementing rules from first principles instead of from spec.",
    example: `# Domain

## Key concepts
- Artifact: reusable AI prompt template with typed variables
  Types: agent, subagent, skill, command, config_snippet, memory, mcp, openspec
- Target: the agent CLI that consumes the artifact
  (claude, opencode, cursor, gemini)
- Renderer: converts artifact to target-specific format (Strategy pattern)
- Memory file: persistent context read by the agent CLI on startup

## Pricing model
- Free tier: up to 10 artifacts, no GitHub publish
- Pro tier: unlimited artifacts, GitHub publish, team sharing (v2)
- Billing via Stripe (not yet implemented — Phase 5)

## Business rules
- Each artifact belongs to one user (no sharing in v1)
- Artifact version auto-increments on every publish
- Body template uses {{variable}} placeholder syntax
- Deleting an artifact is soft-delete (deleted_at timestamp)`,
  },
];

const CATEGORIES_ES = [
  {
    slug: "project",
    label: "Contexto del proyecto",
    file: "project.md",
    dir: ".claude/memory/",
    tag: "Archivo nombrado",
    tagColor: "var(--bark)",
    when: "Se carga al inicio de la sesión. Contiene datos estables del codebase: objetivos, stack, fase actual, restricciones clave. Cambia raramente.",
    example: CATEGORIES_EN[0].example,
  },
  {
    slug: "conventions",
    label: "Convenciones de código",
    file: "conventions.md",
    dir: ".claude/memory/",
    tag: "Archivo nombrado",
    tagColor: "var(--bark)",
    when: "El archivo de memoria más valioso. Evita que el agente invente estilo o luche contra los patrones existentes. Incluye todo lo que podría confundir a un desarrollador senior nuevo en su primer PR.",
    example: CATEGORIES_EN[1].example,
  },
  {
    slug: "architecture",
    label: "Arquitectura",
    file: "architecture.md",
    dir: ".claude/memory/",
    tag: "Archivo nombrado",
    tagColor: "var(--bark)",
    when: "Invariantes críticos y patrones de diseño. Céntrate en lo que no es obvio y causaría bugs sutiles si se viola. No es un doc de arquitectura completo — solo lo que el agente necesita para no tomar decisiones equivocadas.",
    example: CATEGORIES_EN[2].example,
  },
  {
    slug: "workflow",
    label: "Workflow y comandos",
    file: "workflow.md",
    dir: ".claude/memory/",
    tag: "Archivo nombrado",
    tagColor: "var(--bark)",
    when: "Evita que el agente pregunte cómo ejecutar las cosas. Especialmente útil en repos con herramientas no estándar o setup de múltiples pasos.",
    example: CATEGORIES_EN[3].example,
  },
  {
    slug: "persona",
    label: "Comportamiento del agente",
    file: "CLAUDE.md (sección raíz)",
    dir: "",
    tag: "Memoria raíz",
    tagColor: "var(--leaf, #2a7a2a)",
    when: "Va en el archivo de memoria raíz (CLAUDE.md / AGENTS.md), no en un archivo nombrado — necesita cargarse en cada sesión. Define tono, suposiciones y estilo de toma de decisiones.",
    example: CATEGORIES_EN[4].example,
  },
  {
    slug: "domain",
    label: "Conocimiento de dominio",
    file: "domain.md",
    dir: ".claude/memory/",
    tag: "Archivo nombrado",
    tagColor: "var(--bark)",
    when: "Lógica de negocio y terminología que no está en el código. Evita que el agente malinterprete conceptos del dominio o implemente reglas desde cero en vez de seguir la especificación.",
    example: CATEGORIES_EN[5].example,
  },
];

const PRACTICES_EN = [
  { ok: true,  text: "Keep each named file focused on one topic — load what you need, not everything." },
  { ok: true,  text: "Use ## headings to structure content — most CLIs parse them for section-level control." },
  { ok: true,  text: "Write for the agent, not for humans: dense, imperative, no padding." },
  { ok: true,  text: "Put stable facts (stack, conventions) in named files; put behavioral instructions in the root." },
  { ok: true,  text: "Review and trim memory periodically — stale context is noise that degrades quality." },
  { ok: true,  text: "Sync architecture and conventions across CLIs using the Sync feature — don't duplicate manually." },
  { ok: false, text: "Don't paste entire source files into memory — summarize the important constraints instead." },
  { ok: false, text: "Don't store secrets, API keys, or tokens in memory files — they live in .env." },
  { ok: false, text: "Don't let the root file grow past ~100 lines — move sections to named files." },
  { ok: false, text: "Don't add things you can derive from the code — memory is for what isn't obvious from reading the repo." },
  { ok: false, text: "Don't write past tense ('we decided to...') — write present constraints ('always use X')." },
  { ok: false, text: "Don't duplicate the same content across all 4 CLI targets manually — use Sync to." },
];

const PRACTICES_ES = [
  { ok: true,  text: "Mantén cada archivo nombrado enfocado en un solo tema: carga lo que necesitas, no todo." },
  { ok: true,  text: "Usa encabezados ## para estructurar — la mayoría de los CLIs los parsean para control por sección." },
  { ok: true,  text: "Escribe para el agente, no para humanos: denso, imperativo, sin relleno." },
  { ok: true,  text: "Pon datos estables (stack, convenciones) en archivos nombrados; instrucciones de comportamiento en la raíz." },
  { ok: true,  text: "Revisa y recorta la memoria periódicamente — el contexto obsoleto es ruido que degrada la calidad." },
  { ok: true,  text: "Sincroniza arquitectura y convenciones entre CLIs con la función Sync — no dupliques manualmente." },
  { ok: false, text: "No pegues archivos fuente completos en la memoria — resume las restricciones importantes." },
  { ok: false, text: "No almacenes secretos, API keys o tokens en archivos de memoria — van en .env." },
  { ok: false, text: "No dejes que el archivo raíz supere ~100 líneas — mueve secciones a archivos nombrados." },
  { ok: false, text: "No añadas cosas que se pueden deducir del código — la memoria es para lo que no es obvio leyendo el repo." },
  { ok: false, text: "No escribas en pasado ('decidimos usar...') — escribe restricciones en presente ('usar siempre X')." },
  { ok: false, text: "No dupliques el mismo contenido en los 4 CLIs manualmente — usa Sincronizar a." },
];

const ROOT_VS_NAMED_EN = {
  title: "Root file vs. named files",
  root: {
    label: "Root memory (CLAUDE.md / AGENTS.md / GEMINI.md)",
    items: [
      "Always loaded — every session, every conversation",
      "Agent behavior, tone, core constraints",
      "Short project orientation (1-2 paragraphs max)",
      "Pointers to named files if needed",
    ],
    tip: "Keep it under 100 lines. Treat it like a system prompt: high signal, no padding.",
  },
  named: {
    label: "Named memory files (.claude/memory/*.md)",
    items: [
      "Loaded on demand or always (depends on CLI config)",
      "One topic per file: project, conventions, architecture, workflow, domain",
      "Longer, more detailed — context the agent needs when working in that area",
      "Synced across CLIs via Happy Code Sync",
    ],
    tip: "Claude Code auto-loads all files in .claude/memory/. Other CLIs may require explicit @file references.",
  },
};

const ROOT_VS_NAMED_ES = {
  title: "Archivo raíz vs. archivos nombrados",
  root: {
    label: "Memoria raíz (CLAUDE.md / AGENTS.md / GEMINI.md)",
    items: [
      "Siempre cargado — cada sesión, cada conversación",
      "Comportamiento del agente, tono, restricciones core",
      "Orientación corta del proyecto (1-2 párrafos máximo)",
      "Punteros a archivos nombrados si es necesario",
    ],
    tip: "Mantenlo bajo 100 líneas. Trátalo como un system prompt: alta señal, sin relleno.",
  },
  named: {
    label: "Archivos de memoria nombrados (.claude/memory/*.md)",
    items: [
      "Cargados bajo demanda o siempre (depende de la config del CLI)",
      "Un tema por archivo: proyecto, convenciones, arquitectura, workflow, dominio",
      "Más largos y detallados — contexto que el agente necesita en esa área",
      "Sincronizados entre CLIs con Sync de Happy Code",
    ],
    tip: "Claude Code auto-carga todos los archivos de .claude/memory/. Otros CLIs pueden requerir referencias explícitas @file.",
  },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function MemoryGuidePage() {
  const { lang, t } = useI18n();
  const categories = lang === "en" ? CATEGORIES_EN : CATEGORIES_ES;
  const practices = lang === "en" ? PRACTICES_EN : PRACTICES_ES;
  const rvn = lang === "en" ? ROOT_VS_NAMED_EN : ROOT_VS_NAMED_ES;

  const title = lang === "en" ? "Agent Memory Guide" : "Guía de memoria de agentes";
  const intro = lang === "en"
    ? "Practical examples and best practices for writing agent memory files that make your coding sessions more focused and consistent."
    : "Ejemplos prácticos y mejores prácticas para escribir archivos de memoria de agentes que hagan tus sesiones de código más enfocadas y consistentes.";
  const examplesTitle = lang === "en" ? "Memory file examples by category" : "Ejemplos de archivos de memoria por categoría";
  const whenLabel = lang === "en" ? "When to use" : "Cuándo usarlo";
  const practicesTitle = lang === "en" ? "Best practices" : "Buenas prácticas";

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 64px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
        <h1 style={{ fontSize: "1.75rem", lineHeight: 1.3 }}>{title}</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
          <Link href="/memory" style={{ fontSize: "0.9rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
            <BookOpen size={14} /> {t("nav.memory")}
          </Link>
          <Link href="/" style={{ fontSize: "0.9rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
            <ArrowLeft size={14} /> {t("nav.back")}
          </Link>
        </div>
      </div>
      <p style={{ color: "var(--text-muted)", marginBottom: 36, fontSize: "1.05rem", lineHeight: 1.6 }}>{intro}</p>

      {/* Root vs named */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: 16 }}>{rvn.title}</h2>
        <div className="grid2" style={{ gap: 14 }}>
          {[rvn.root, rvn.named].map((col, i) => (
            <div key={i} className="card" style={{ padding: "18px 20px" }}>
              <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 12, color: i === 0 ? "var(--leaf, #2a7a2a)" : "var(--bark)" }}>{col.label}</p>
              <ul style={{ margin: "0 0 12px", paddingLeft: 20, display: "grid", gap: 6 }}>
                {col.items.map((item, j) => (
                  <li key={j} style={{ fontSize: "0.95rem", lineHeight: 1.55 }}>{item}</li>
                ))}
              </ul>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", background: "var(--cream)", borderRadius: 6, padding: "8px 12px", margin: 0, lineHeight: 1.5 }}>
                💡 {col.tip}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Category examples */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: 16 }}>{examplesTitle}</h2>
        <div style={{ display: "grid", gap: 16 }}>
          {categories.map((cat) => (
            <div key={cat.slug} className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{cat.label}</h3>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: cat.tagColor, background: `color-mix(in srgb, ${cat.tagColor} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${cat.tagColor} 30%, transparent)`, borderRadius: 4, padding: "2px 8px" }}>{cat.tag}</span>
                <span style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "var(--text-muted)" }}>{cat.dir}{cat.file}</span>
              </div>

              <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: 14, lineHeight: 1.55 }}>
                <strong>{whenLabel}:</strong> {cat.when}
              </p>

              <pre style={codeStyle}>{cat.example}</pre>
            </div>
          ))}
        </div>
      </section>

      {/* Best practices */}
      <section>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: 16 }}>{practicesTitle}</h2>
        <div className="card-grid" style={{ gap: 10 }}>
          {practices.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                padding: "12px 14px",
                borderRadius: 8,
                background: p.ok ? "color-mix(in srgb, var(--leaf, #2a7a2a) 8%, transparent)" : "color-mix(in srgb, var(--clay) 8%, transparent)",
                border: `1px solid ${p.ok ? "color-mix(in srgb, var(--leaf, #2a7a2a) 20%, transparent)" : "color-mix(in srgb, var(--clay) 20%, transparent)"}`,
              }}
            >
              <span style={{ fontWeight: 700, color: p.ok ? "var(--leaf, #2a7a2a)" : "var(--clay)", flexShrink: 0, fontSize: "1rem" }}>
                {p.ok ? "✓" : "✗"}
              </span>
              <span style={{ fontSize: "0.92rem", lineHeight: 1.55 }}>{p.text}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const codeStyle = {
  background: "var(--cream)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  padding: "14px 16px",
  fontSize: "0.88rem",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  margin: 0,
  fontFamily: "monospace",
  lineHeight: 1.6,
};
