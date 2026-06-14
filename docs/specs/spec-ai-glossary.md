# Spec — AI Glossary

> Status: Draft · Author: fbvarela · Created: 2026-06-14

## Context

happy-code-ai (Agent Artifact Manager) helps coders build artifacts for AI
agent CLIs. Users — especially those newer to the space — keep hitting jargon
(subagent, MCP, RAG, frontmatter, context window, tool use…) and have no single
place inside the app that explains the terms or points them at the tools the
terms refer to. Today that knowledge lives scattered across `docs/GUIA-ARTEFACTOS.md`
and external docs.

This spec adds an **AI Glossary**: a searchable list of AI/coding-agent terms
with **AI-generated definitions** and curated links to the most-used AI
tools/models (Claude, ChatGPT, Cursor, Gemini CLI, Ollama…). Definitions are
produced by **Groq** (fast, cheap inference — already wired into this app via
`@ai-sdk/groq` and `GROQ_API_KEY` in `src/lib/generator.js`). The glossary ships
a baseline of seeded terms and lets each user **manually add and remove** their
own entries, persisted per-user in Neon.

Related:
- `docs/specs/spec-agent-artifact-manager.md` — parent product spec (schema, auth, token-cost constraint).
- `src/lib/generator.js` — existing Groq/Anthropic provider wiring (`createGroq`, `GROQ_MODEL`, `generateObject`).
- `src/lib/suggestions.js` — precedent for a curated, client-rendered catalog.
- `docs/GUIA-ARTEFACTOS.md` — existing per-artifact guide the glossary complements.

## Goals

- Show a searchable, category-filterable glossary of AI terms with concise
  definitions, reachable from the home header (alongside the ✨ Sugerencias
  button) at `/glossary`.
- **Generate definitions with Groq**: when a term has no definition yet, call
  Groq to produce a short, accurate definition (and a suggested category/links),
  which the user reviews before saving.
- **Cache every generated definition** in the DB so it is generated once per
  term and rendered thereafter for 0 tokens.
- Ship a curated seed set of terms and **links to the most-used AIs/CLIs**
  (Claude, ChatGPT, Gemini, Cursor, OpenCode, Ollama, etc.); seed definitions
  are pre-generated with Groq and committed as static data (0 tokens at render).
- Let an authenticated user **add** a new entry (just the term is required —
  Groq fills the definition) and **remove** entries, persisted per-user.
- Keep the feature auth-gated and consistent with existing design tokens and
  component patterns (cards, `btn` classes, no native dialogs).

## Non-goals

- No live regeneration on every page view — definitions are generated once and
  cached; the glossary never calls Groq just to render.
- No provider switching UI — definitions use Groq specifically (the app's
  Anthropic-first `selectProvider` is for artifact generation; the glossary
  pins Groq for speed/cost).
- No editing of the shared seed entries — seed is read-only reference; users
  act only on their own added entries.
- No public sharing, upvoting, or cross-user contribution flow.
- No rich text / images in definitions — plain text + links only.

## Proposed design

Two layers, mirroring the suggestions feature: a static seed module plus a
per-user table for manual additions. Definitions come from Groq and are cached
(seed: pre-generated into the static module; user: generated on add, stored on
the row). The UI merges both layers for display.

### Data model

New module `src/lib/glossary.js` (pure data, importable client + server):

```js
export const GLOSSARY_CATEGORIES = [
  { id: "concept",  label: "Conceptos" },
  { id: "artifact", label: "Artefactos" },
  { id: "tool",     label: "Herramientas / CLIs" },
  { id: "model",    label: "Modelos" },
  { id: "protocol", label: "Protocolos" },
];

export const GLOSSARY_SEED = [
  {
    id: "mcp",
    term: "MCP (Model Context Protocol)",
    category: "protocol",
    aliases: ["Model Context Protocol"],
    definition: "Protocolo abierto para conectar herramientas externas…",
    links: [{ label: "Anthropic — MCP", url: "https://modelcontextprotocol.io" }],
  },
  // …subagent, RAG, context window, tool use, frontmatter, skill, agent…
  // plus "links to most used AI" entries (category: "tool"/"model"):
  { id: "claude", term: "Claude", category: "model",
    definition: "Familia de modelos de Anthropic…",
    links: [{ label: "claude.ai", url: "https://claude.ai" },
            { label: "Claude Code", url: "https://claude.com/claude-code" }] },
  // ChatGPT, Gemini, Cursor, OpenCode, Ollama, …
];
```

New migration `src/db/migrations/005_add_glossary.sql` — a per-user table for
manual additions (follows the `artifacts` conventions: uuid PK, `user_id` FK
`ON DELETE CASCADE`, `links` as jsonb):

```sql
CREATE TABLE IF NOT EXISTS glossary_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  term        text NOT NULL,
  category    text NOT NULL DEFAULT 'concept',
  definition  text NOT NULL DEFAULT '',
  aliases     text[] NOT NULL DEFAULT '{}',
  links       jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_glossary_user ON glossary_entries(user_id);
```

Seed entries carry a stable string `id`; user entries carry a uuid. The UI tags
each row with a `source: "seed" | "user"` so only `user` rows get a Remove
action.

### Definition generation (Groq)

New module `src/lib/glossary-generator.js` — pins Groq (does **not** reuse the
Anthropic-first `selectProvider`):

```js
import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";

const defSchema = z.object({
  definition: z.string().describe("2-3 sentence plain-language definition, no fluff"),
  category: z.enum(["concept","artifact","tool","model","protocol"]).default("concept"),
  links: z.array(z.object({ label: z.string(), url: z.string().url() })).max(3).default([]),
});

export function isGroqConfigured() { return !!process.env.GROQ_API_KEY; }

export async function defineTerm(term) {
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
  const { object } = await generateObject({
    model: groq(process.env.GROQ_MODEL || "llama-3.3-70b-versatile"),
    schema: defSchema,
    messages: [
      { role: "system", content:
        "You write concise glossary entries about AI / coding-agent terms. " +
        "Be accurate and neutral. If unsure a term exists, say so in the definition. " +
        "Only include official/authoritative links." },
      { role: "user", content: `Define the term: ${term}` },
    ],
  });
  return object; // { definition, category, links }
}
```

Output is short (token-cheap) and structured, validated by Zod. Seed
definitions are produced by a one-off script (`scripts/seed-glossary.mjs`) that
calls `defineTerm` for each seed term and writes the result into
`src/lib/glossary.js` as committed static data — so the baseline renders with 0
runtime tokens.

### API surface

- `GET  /api/glossary` — returns the current user's added entries (seed is
  imported client-side from `glossary.js`, not round-tripped).
- `POST /api/glossary/define` — body `{ term }`; calls Groq via `defineTerm` and
  returns `{ definition, category, links }` (not persisted). Returns 503 if
  `GROQ_API_KEY` is unset, 502 on Groq failure.
- `POST /api/glossary` — body `{ term, category, definition, aliases, links }`;
  inserts a user entry, returns it. The `definition` is the (reviewed) Groq
  output. Validates `term` non-empty and each `links[].url` is a valid http(s)
  URL. If `definition` is empty, the server calls `defineTerm` itself before
  inserting, so the cached definition is never blank.
- `DELETE /api/glossary/:id` — deletes the entry if it belongs to the caller.

All under the existing middleware (session-gated; same as `/api/artifacts`).

### UI flow

- `src/app/glossary/page.jsx` — server component, `force-dynamic`, hosts the
  client gallery (same shell as `src/app/suggestions/page.jsx`).
- `src/components/GlossaryList.jsx` — client component:
  - Merges `GLOSSARY_SEED` with the user's `GET /api/glossary` results, sorts
    alphabetically by `term`.
  - Search box (matches term/aliases/definition) + category `<select>`.
  - Each entry is a card: term, category badge, definition, link chips
    (`target="_blank" rel="noreferrer noopener"`). User rows show a **Borrar**
    button (inline confirm, like `ArtifactLibrary`, no native `confirm()`).
  - An **+ Añadir término** button reveals an inline form. The user types the
    **term** and clicks **Generar definición** → `POST /api/glossary/define`
    (Groq) fills the definition, category, and link rows, all editable. Submit →
    `POST /api/glossary` → optimistic prepend. The user may also write the
    definition by hand and skip generation (the server backfills via Groq only
    if left blank).
- `src/components/ArtifactLibrary.jsx` header — add a **📖 Glosario** button
  next to **✨ Sugerencias**, routing to `/glossary`.

### Failure modes

- `GROQ_API_KEY` unset → `define` returns 503; the form falls back to a manual
  definition textarea (feature still usable without Groq).
- Groq error/timeout → 502; inline message, user can retry or type manually.
- Invalid link URL → 400 with field message; form shows it inline.
- `POST`/`DELETE` failure → non-blocking error line in the form/card; list
  reloads from server to reconcile.
- Empty user list → only seed entries render (never an empty page).
- Duplicate term vs. seed → allowed; user entry sorts alongside and is clearly a
  `user` row (removable). No dedupe in MVP.

## Alternatives considered

- **Single discriminated table for seed + user entries** (a `kind`/`is_seed`
  column, seed loaded into DB). Rejected: seeding/migrating shared content into
  every user's rows duplicates data and complicates updates to the baseline.
  The static-module + per-user-table split matches the established suggestions
  pattern and keeps seed edits to a code change.
- **Reuse the `artifacts` table** with a `type: 'glossary'`. Rejected: artifacts
  carry templating/version/target machinery irrelevant to a glossary term; it
  would pollute that model and its renderers/CHECK constraint.
- **Static-only glossary, no DB.** Rejected: the user explicitly asked for
  manual add/remove, which requires per-user persistence.
- **Generate definitions on every view (no cache).** Rejected: repeated token
  spend for unchanged content; violates the product's token-cost constraint.
  Generate once on add, cache in the row.
- **Use the existing Anthropic-first `selectProvider`.** Rejected: the user
  asked for Groq specifically; Groq's low latency/cost fits short, on-demand
  definitions, so the glossary pins it rather than preferring Anthropic.

## Risks & open questions

- Production needs migration `005` applied (`npm run db:migrate`) before the
  add/remove API works; the seed-only view degrades gracefully until then.
- Requires `GROQ_API_KEY` in the environment for generation (already documented
  in `.env.example`). Without it, generation is disabled but manual entry works.
- Groq definition accuracy/hallucination — definitions are user-reviewed before
  saving, and the prompt instructs the model to flag uncertainty; still, treat
  generated text as a starting point, not authoritative.
- Open: should users be able to **edit** their own entries, or only add/remove? 
  also edit
- Open: should removing be limited to user entries, or also allow **hiding**
  seed entries per user? (MVP = seed always visible; no hide.)
- Link rot in seeded URLs — periodic manual review; low risk for MVP.
- Keep the seed list small and high-value to avoid it becoming a maintenance
  sink; lean on user additions for the long tail.

## Rollout plan

Single PR: `glossary.js` seed (definitions pre-generated by
`scripts/seed-glossary.mjs`) + `glossary-generator.js` + migration `005` + API
routes (`/api/glossary`, `/api/glossary/define`) + `/glossary` page/component +
header button. No feature flag — additive and auth-gated. Apply migration `005`
to the production Neon DB and ensure `GROQ_API_KEY` is set on Vercel as part of
deploy. The seed list renders immediately; add + Groq generation activate once
the migration and key are live.

## Success metrics

- ≥ 60% of seed categories have at least one entry at launch; ≥ 12 seed terms
  including the major AI tools/models (Claude, ChatGPT, Gemini, Cursor,
  OpenCode, Ollama).
- Users create at least one custom entry in a meaningful share of sessions that
  open `/glossary` (tracked via row counts in `glossary_entries`).
- Each definition is generated by Groq exactly **once** (on add) and then served
  from cache — `/glossary` page views spend 0 LLM tokens.
- Median Groq `define` latency < 2s (Groq is the fast-path provider).
