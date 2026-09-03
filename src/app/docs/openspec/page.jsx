"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// ── Content ────────────────────────────────────────────────────────────────

const SECTIONS_ES = [
  {
    id: "what",
    title: "Qué es OpenSpec",
    body: "OpenSpec es un framework ligero basado en especificaciones que actúa como capa de planificación universal para coding agents. Las specs viven como archivos Markdown en openspec/specs/ dentro del repo y usan un formato estructurado: un bloque Purpose, Requirements expresados como afirmaciones \"El sistema DEBE/SHALL…\", y Scenarios en Gherkin (GIVEN / WHEN / THEN). Cuando cambia el código, OpenSpec genera \"spec deltas\" para que los revisores vean cambios de intención, no solo diffs de líneas.",
  },
  {
    id: "when",
    title: "Cuándo usarlo",
    bullets: [
      "Antes de empezar una feature: escribe la spec primero, luego pídele al agent que la implemente.",
      "Cuando briefes a un coding agent: apunta al agent al archivo de spec en vez de describir requisitos en el chat.",
      "Al revisar una PR generada por IA: compara el spec delta con el código para verificar que se cumplieron todos los SHALLs.",
      "Como documentación viva: la spec vive en el mismo repo que el código y se versiona junto con él.",
    ],
  },
  {
    id: "anatomy",
    title: "Anatomía del formato",
    note: "Cada sección tiene un propósito específico. No los mezcles.",
    example: `# User Authentication Specification
<!-- version: 1.0 | status: draft | agents: claude-code, opencode -->

## Purpose

Gestiona la autenticación de usuarios via magic-link.
Emite una sesión cifrada al verificar el token.

## Requirements

### Requirement: Emisión de token

El sistema DEBE generar un token firmado con HS256
al verificar la identidad del usuario.

#### Scenario: Login exitoso

- GIVEN un usuario registrado con email válido
- WHEN solicita un magic-link y hace clic en él
- THEN recibe una cookie HttpOnly con sesión válida 7 días`,
    annotations: [
      { label: "Cabecera", text: "# [Feature] Specification — nombre normalizado para que el agent lo encuentre." },
      { label: "Comentario de meta", text: "<!-- version | status | agents --> — metadatos de la spec sin contaminar el Markdown." },
      { label: "Purpose", text: "Un párrafo. Qué gestiona esta spec y por qué existe. Sin detalles de implementación." },
      { label: "Requirement", text: "Una afirmación SHALL. Un solo verbo. Medible. Sin mencionar tecnología." },
      { label: "Scenario", text: "GIVEN estado inicial, WHEN una acción, THEN un resultado observable. Sin conjunciones." },
    ],
  },
  {
    id: "shalls",
    title: "Cómo escribir buenos SHALLs",
    rules: [
      { title: "Un verbo, una obligación", good: "El sistema DEBE validar el email antes de enviar el magic-link.", bad: "El sistema DEBE validar el email y generar el token y enviarlo." },
      { title: "Resultado medible", good: "El sistema DEBE responder en menos de 300 ms en el p95.", bad: "El sistema DEBE ser rápido." },
      { title: "Sin detalles de implementación", good: "El sistema DEBE almacenar las sesiones de forma cifrada.", bad: "El sistema DEBE usar AES-256-GCM con iron-session v8." },
      { title: "Verificable con un test", good: "El sistema DEBE rechazar emails con dominio @example.com.", bad: "El sistema DEBE manejar los casos límite de email." },
    ],
  },
  {
    id: "gherkin",
    title: "Scenarios Gherkin",
    rules: [
      "GIVEN establece el estado inicial del sistema, no describe acciones.",
      "WHEN describe una sola acción. Si necesitas dos, es posible que sean dos scenarios.",
      "THEN describe un resultado observable y concreto desde fuera del sistema.",
      "Evita 'Y' / 'And' en WHEN y THEN — suele indicar que el scenario hace dos cosas.",
      "Un Requirement puede tener varios Scenarios (caso exitoso, caso de error, edge case).",
    ],
  },
  {
    id: "workflow",
    title: "Del spec al código: el flujo completo",
    steps: [
      { n: 1, title: "Draft", body: "Elige una plantilla en Sugerencias → OpenSpec. Rellena las variables (feature, purpose, requirements, scenarios). Previsualiza el Markdown renderizado." },
      { n: 2, title: "Publica en el repo", body: "Clic en \"Publicar en GitHub\". La spec se sube a openspec/specs/<slug>.md via la API de GitHub — sin clonar el repo." },
      { n: 3, title: "Briefea al agent", body: "En tu terminal: claude \"implement openspec/specs/user-auth.md\" o opencode \"implement openspec/specs/user-auth.md\". El agent lee la spec, mapea cada SHALL a tareas de código y usa los scenarios como criterios de aceptación." },
      { n: 4, title: "El agent implementa", body: "El agent crea una rama, escribe código + tests y abre una PR. OpenSpec CLI (si está instalado) genera un spec delta mostrando qué requirements están satisfechos." },
      { n: 5, title: "Revisa e itera", body: "Si los requisitos cambian, actualiza el artefacto en Happy Code y republica. El archivo de spec se actualiza en la misma PR. El agent re-corre hasta que todos los SHALLs pasen." },
      { n: 6, title: "Merge", body: "Todos los scenarios en verde, spec delta al 100 %. Código y spec aterrizan juntos — la documentación nunca se desincroniza del código." },
    ],
  },
];

const SECTIONS_EN = [
  {
    id: "what",
    title: "What is OpenSpec",
    body: "OpenSpec is a lightweight spec-driven framework that acts as a universal planning layer for coding agents. Specs live as Markdown files in openspec/specs/ inside the repo and use a structured format — a Purpose block, Requirements stated as \"The system SHALL…\" assertions, and Gherkin Scenarios (GIVEN / WHEN / THEN). When code changes, OpenSpec generates \"spec deltas\" so reviewers see intent changes, not just line diffs.",
  },
  {
    id: "when",
    title: "When to use it",
    bullets: [
      "Before starting a feature: write the spec first, then ask the agent to implement it.",
      "When briefing a coding agent: point the agent at the spec file instead of describing requirements in chat.",
      "When reviewing an AI-generated PR: compare the spec delta with the code to verify all SHALLs were met.",
      "As living documentation: the spec lives in the same repo as the code and is versioned alongside it.",
    ],
  },
  {
    id: "anatomy",
    title: "Format anatomy",
    note: "Each section has a specific role. Don't mix them.",
    example: `# User Authentication Specification
<!-- version: 1.0 | status: draft | agents: claude-code, opencode -->

## Purpose

Manages user authentication via magic-link.
Issues an encrypted session upon token verification.

## Requirements

### Requirement: Token issuance

The system SHALL generate a token signed with HS256
upon verifying the user identity.

#### Scenario: Successful login

- GIVEN a registered user with a valid email
- WHEN they request a magic-link and click it
- THEN they receive an HttpOnly cookie with a session valid for 7 days`,
    annotations: [
      { label: "Header", text: "# [Feature] Specification — normalized name so the agent can find it." },
      { label: "Meta comment", text: "<!-- version | status | agents --> — spec metadata without polluting the Markdown." },
      { label: "Purpose", text: "One paragraph. What this spec manages and why it exists. No implementation details." },
      { label: "Requirement", text: "One SHALL assertion. One verb. Measurable. No mention of technology." },
      { label: "Scenario", text: "GIVEN initial state, WHEN one action, THEN one observable result. No conjunctions." },
    ],
  },
  {
    id: "shalls",
    title: "How to write good SHALLs",
    rules: [
      { title: "One verb, one obligation", good: "The system SHALL validate the email before sending the magic-link.", bad: "The system SHALL validate the email and generate the token and send it." },
      { title: "Measurable outcome", good: "The system SHALL respond within 300 ms at the p95.", bad: "The system SHALL be fast." },
      { title: "No implementation details", good: "The system SHALL store sessions in encrypted form.", bad: "The system SHALL use AES-256-GCM with iron-session v8." },
      { title: "Verifiable with a test", good: "The system SHALL reject emails with domain @example.com.", bad: "The system SHALL handle email edge cases." },
    ],
  },
  {
    id: "gherkin",
    title: "Gherkin scenarios",
    rules: [
      "GIVEN sets the initial state of the system — it does not describe actions.",
      "WHEN describes a single action. If you need two, you probably have two scenarios.",
      "THEN describes an observable, concrete result from outside the system.",
      "Avoid 'And' in WHEN and THEN — it usually means the scenario does two things.",
      "One Requirement can have multiple Scenarios (happy path, error case, edge case).",
    ],
  },
  {
    id: "workflow",
    title: "From spec to code: the full workflow",
    steps: [
      { n: 1, title: "Draft", body: "Pick a template from Suggestions → OpenSpec. Fill the variables (feature, purpose, requirements, scenarios). Preview the rendered Markdown." },
      { n: 2, title: "Publish to repo", body: "Click \"Publish to GitHub\". The spec is committed to openspec/specs/<slug>.md via the GitHub API — no local clone needed." },
      { n: 3, title: "Brief the agent", body: "In your terminal: claude \"implement openspec/specs/user-auth.md\" or opencode \"implement openspec/specs/user-auth.md\". The agent reads the spec, maps each SHALL to code tasks, and uses scenarios as acceptance criteria." },
      { n: 4, title: "Agent implements", body: "The agent creates a branch, writes code + tests, and opens a PR. OpenSpec CLI (if installed) generates a spec delta showing which requirements are satisfied." },
      { n: 5, title: "Review & iterate", body: "If requirements change, update the artifact in Happy Code and republish. The spec file updates in the same PR. The agent re-runs until all SHALLs pass." },
      { n: 6, title: "Merge", body: "All scenarios green, spec delta at 100%. Code and spec land together — documentation never drifts from code." },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function OpenSpecGuidePage() {
  const { lang, t } = useI18n();
  const sections = lang === "en" ? SECTIONS_EN : SECTIONS_ES;

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>{lang === "en" ? "OpenSpec Guide" : "Guía de OpenSpec"}</h1>
          <p className="page-header-meta">
            {lang === "en"
              ? "Spec-driven development for coding agents — write intent, let the agent write code."
              : "Desarrollo orientado a specs para coding agents — escribe intención, deja que el agent escriba el código."}
          </p>
        </div>
        <Link href="/" style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
          <ArrowLeft size={14} /> {t("nav.back")}
        </Link>
      </div>
      <a
        href="https://openspec.dev/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: "0.9rem", color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 28, textDecoration: "none" }}
      >
        openspec.dev <ExternalLink size={12} />
      </a>

      <div style={{ display: "grid", gap: 20 }}>
        {sections.map((s) => (
          <section key={s.id} className="card" style={{ padding: "20px 24px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 12 }}>{s.title}</h2>

            {s.body && (
              <p style={{ fontSize: "1rem", lineHeight: 1.65 }}>{s.body}</p>
            )}

            {s.bullets && (
              <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
                {s.bullets.map((b, i) => (
                  <li key={i} style={{ fontSize: "1rem", lineHeight: 1.5 }}>{b}</li>
                ))}
              </ul>
            )}

            {s.example && (
              <>
                {s.note && (
                  <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: 10 }}>{s.note}</p>
                )}
                <pre style={codeStyle}>{s.example}</pre>
                {s.annotations && (
                  <div style={{ display: "grid", gap: 6, marginTop: 12 }}>
                    {s.annotations.map((a) => (
                      <div key={a.label} style={{ display: "flex", gap: 8, fontSize: "0.95rem", lineHeight: 1.5 }}>
                        <span style={annotationLabel}>{a.label}</span>
                        <span style={{ color: "var(--text-muted)" }}>{a.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {s.rules && Array.isArray(s.rules) && typeof s.rules[0] === "string" && (
              <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
                {s.rules.map((r, i) => (
                  <li key={i} style={{ fontSize: "1rem", lineHeight: 1.5 }}>{r}</li>
                ))}
              </ul>
            )}

            {s.rules && Array.isArray(s.rules) && typeof s.rules[0] === "object" && (
              <div style={{ display: "grid", gap: 14 }}>
                {s.rules.map((r) => (
                  <div key={r.title}>
                    <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: 6 }}>{r.title}</div>
                    <div style={{ display: "grid", gap: 4 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                        <span style={okBadge}>OK</span>
                        <code style={inlineCode}>{r.good}</code>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                        <span style={noBadge}>NO</span>
                        <code style={{ ...inlineCode, color: "var(--clay)", textDecoration: "line-through" }}>{r.bad}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {s.steps && (
              <div style={{ display: "grid", gap: 12 }}>
                {s.steps.map((step) => (
                  <div key={step.n} style={{ display: "flex", gap: 12 }}>
                    <span style={stepNum}>{step.n}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 3 }}>{step.title}</div>
                      <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.55 }}>{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/suggestions" style={linkBtn}>
          {lang === "en" ? "OpenSpec templates in Suggestions →" : "Plantillas OpenSpec en Sugerencias →"}
        </Link>
        <a href="https://openspec.dev/" target="_blank" rel="noopener noreferrer" style={linkBtn}>
          openspec.dev <ExternalLink size={12} style={{ display: "inline" }} />
        </a>
      </div>
    </div>
  );
}

const codeStyle = {
  background: "var(--cream)",
  border: "1px solid var(--line)",
  borderRadius: 6,
  padding: "12px 14px",
  fontSize: "0.88rem",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  margin: 0,
  fontFamily: "monospace",
  lineHeight: 1.6,
};

const annotationLabel = {
  fontSize: "0.8rem",
  fontWeight: 700,
  background: "var(--cream)",
  border: "1px solid var(--line)",
  borderRadius: 4,
  padding: "1px 6px",
  whiteSpace: "nowrap",
  alignSelf: "flex-start",
  marginTop: 1,
};

const okBadge = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "var(--leaf)",
  background: "color-mix(in srgb, var(--leaf) 12%, transparent)",
  border: "1px solid color-mix(in srgb, var(--leaf) 30%, transparent)",
  borderRadius: 4,
  padding: "1px 5px",
  whiteSpace: "nowrap",
  alignSelf: "flex-start",
  marginTop: 2,
};

const noBadge = {
  ...okBadge,
  color: "var(--clay)",
  background: "color-mix(in srgb, var(--clay) 12%, transparent)",
  border: "1px solid color-mix(in srgb, var(--clay) 30%, transparent)",
};

const inlineCode = {
  fontSize: "0.92rem",
  fontFamily: "monospace",
  lineHeight: 1.5,
};

const stepNum = {
  minWidth: 30,
  height: 30,
  borderRadius: "50%",
  background: "var(--bark)",
  color: "#fff",
  fontSize: "0.85rem",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  marginTop: 1,
};

const linkBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: "1rem",
  color: "var(--bark)",
  textDecoration: "none",
  fontWeight: 600,
};
