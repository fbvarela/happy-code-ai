# Happy Code — Agent Artifact Manager

## Project Overview

Happy Code is one app in the Happy Factory suite. It lets a signed-in GitHub
user create, store, template, AI-generate, and publish "agent artifacts"
(agents, subagents, skills, slash commands, config snippets, memory files,
MCP configs, OpenSpec docs) for AI-coding CLIs — currently **OpenCode** is the
MVP target, with renderers also stubbed for Claude Code, Cursor, Gemini CLI,
and JetBrains Junie. Artifacts are Handlebars templates with typed
variables, so generation and rendering stay token-cheap. The app also ships a
small AI-term glossary feature (define/explain terms, cached explanations)
and a "memory" scanner/publisher for repo `MEMORY.md`-style files. Publishing
writes files to the user's GitHub repos via a GitHub OAuth App (`repo`
scope). Deployed on Vercel; data lives in Neon Postgres.

Status per README: Phase 1 (scaffold) is done — GitHub OAuth + session, DB
schema, base UI/PWA. Artifact CRUD/templates and the generator/publish flow
are the active/next phases (see `docs/PLAN.md` and
`docs/specs-happy-code-ai/SPEC.md`).

## Quick Start / Commands

```bash
npm install
npm run dev          # next dev --webpack, http://localhost:3000
npm run build         # next build --webpack
npm start             # next start (production)
npm run lint           # next lint (eslint-config-next core-web-vitals)
npm run db:migrate     # node --env-file=.env.local scripts/db-migrate.mjs
npm run glossary:seed  # node --env-file=.env.local scripts/seed-glossary.mjs
npm run icons:pwa      # regenerate PWA icons
```

No test runner is configured (no `test` script, no test framework in
`package.json`).

## Architecture

- **Framework**: Next.js 16 (App Router, plain JS/JSX — not TypeScript),
  React 19, Tailwind CSS 4. PWA via `@ducanh2912/next-pwa` (disabled in dev;
  see `next.config.js` for the security headers and Workbox runtime-caching
  rules: API/`/login` are `NetworkOnly`, `_next/static` is cached forever,
  everything else is `NetworkFirst`).
- **Path alias**: `@/*` → `src/*` (`jsconfig.json`).
- **Routing**: `src/app/**` — pages are `.jsx`, API routes are `route.js`
  under `src/app/api/**`. Key route groups:
  - `api/auth/github`, `api/auth/github/callback`, `api/auth/logout`,
    `api/auth/me` — OAuth login flow and session introspection.
  - `api/artifacts`, `api/artifacts/[id]`, `.../render`, `.../publish`,
    `.../test` — artifact CRUD, template rendering, GitHub publish, dry-run.
  - `api/generate` — AI-assisted artifact generation.
  - `api/glossary*` — term list/detail/define/explain.
  - `api/memory/scan`, `api/memory/publish` — repo memory-file scanning and
    publish.
  - `api/repos`, `api/repos/branches` — GitHub repo/branch listing for the
    publish target picker.
  - No `test-login` route currently exists in this app (unlike some other
    Happy Factory apps — see memory `reference_test_login.md`). Only real
    GitHub OAuth is wired up.
- **Data layer**: `src/lib/*.js` holds domain logic (`artifacts.js`,
  `generator.js`, `glossary.js`, `glossary-generator.js`, `render.js`,
  `github.js`, `crypto.js`, `session.js`, `suggestions.js`, etc.) and is
  imported by route handlers — no separate service/repository layer beyond
  that. `src/lib/renderers/{base,claude,cursor,gemini,junie,opencode}.js`
  implement one renderer per target CLI, registered in
  `src/lib/renderers/index.js`; `src/lib/targets.js` and
  `src/lib/artifact-types.js` hold the pure metadata (safe for client
  import, no DB).
- **Database**: Neon Postgres via `@neondatabase/serverless`. `src/utils/db.js`
  exports a `sql` tagged-template client (Proxy lazily wraps `neon(DATABASE_URL)`
  so both `` sql`...` `` and `sql.query(...)` work). Plain-SQL migrations live
  in `src/db/migrations/*.sql` (run with `npm run db:migrate` →
  `scripts/db-migrate.mjs`), currently: `users`, `artifacts`,
  `artifact_versions`, plus additive migrations for memory/mcp artifact
  types, `files`, `command` type, and the glossary tables.
- **AI generation**: Vercel AI SDK (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`)
  with `zod` schemas via `generateObject`. Provider is chosen by which env
  key is present — Anthropic first (`ANTHROPIC_API_KEY`, default model
  `claude-opus-4-8`, prompt-cached), Agnes 2.0 as fallback
  (`AGNES_API_KEY`, default `agnes-2.0-flash`, OpenAI-compatible gateway at
  `https://apihub.agnes-ai.com/v1`, see `src/lib/agnes.js`). `src/lib/local-generate.js`
  exists alongside for a non-LLM / template-only generation path.
- **Templating**: Handlebars (`handlebars`) — artifact bodies are templates
  with `{{variableName}}` holes filled from typed `variables[]`.
- **i18n**: Lightweight custom context in `src/lib/i18n.js` (`es`/`en`,
  default `es`), persisted to `localStorage`, with a pre-hydration inline
  script (`langScript`) in `layout.jsx` to avoid a language flash — mirrors
  the theme no-flash script pattern.
- **PWA/offline**: `src/app/offline/page.jsx` is the Workbox document
  fallback; `public/manifest.json` (generated icons via
  `npm run icons:pwa`).

## Auth Pattern

GitHub OAuth App + `iron-session` cookie session (no NextAuth/Clerk/etc.).

1. `GET /api/auth/github` — requires `GITHUB_CLIENT_ID`; generates a random
   `state`, stores `gh_oauth_state` and `gh_oauth_next` as short-lived
   httpOnly cookies, redirects to GitHub's authorize URL
   (`src/lib/github.js: buildAuthorizeUrl`). Requests `repo` scope so the app
   can write artifacts into the user's repos.
2. `GET /api/auth/github/callback` — exchanges the code, verifies `state`,
   upserts the user, encrypts and stores the GitHub access token
   (`src/lib/crypto.js`, AES-256-GCM using `TOKEN_ENCRYPTION_KEY`), and
   writes the `iron-session` cookie (`hc_session`, `src/lib/session.js`).
3. `src/middleware.js` gates every route except `PUBLIC_PATHS`
   (`/login`, `/api/auth`, `/offline`): it reads the session and redirects
   unauthenticated requests to `/login?next=...`. It also defensively
   redirects to login (with `error=server_misconfigured`) if `SESSION_SECRET`
   is missing or under 32 chars, rather than letting `iron-session` throw and
   500 the whole site.
4. Route handlers call `requireAuth()` from `src/utils/auth.js` to get
   `{ session }` or a `401` `{ error: Response }`; session shape is
   `{ userId, githubId, githubLogin, name, avatarUrl }`.
5. `GET /api/auth/me` reads the current session; `POST /api/auth/logout`
   clears it (`src/components/LogoutButton.jsx`).

## Environment Variables

All read from `process.env`, documented in `.env.example`:

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `SESSION_SECRET` | iron-session cookie password, ≥32 chars |
| `TOKEN_ENCRYPTION_KEY` | 64 hex chars (32 bytes) — AES-256-GCM key for encrypting stored GitHub tokens |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth App credentials |
| `GITHUB_OAUTH_REDIRECT` | Optional override for the OAuth callback URL (defaults to `<origin>/api/auth/github/callback`) |
| `ANTHROPIC_API_KEY` | Enables Anthropic as the generator provider (preferred) |
| `GENERATOR_MODEL` | Optional Anthropic model override (default `claude-opus-4-8`) |
| `AGNES_API_KEY` | Enables Agnes 2.0 as the generator fallback when Anthropic key is absent |
| `AGNES_MODEL` | Optional Agnes model override (default `agnes-2.0-flash`) |

## Code Conventions

- Plain JavaScript/JSX throughout (no TypeScript) — `.js` for lib/API
  routes, `.jsx` for React components/pages.
- `@/*` path alias maps to `src/*`; use it instead of relative `../../` paths.
- Styling: Tailwind CSS 4 (`@theme` tokens) plus a small CSS-variable design
  system in `src/app/globals.css` shared with sibling Happy Factory apps —
  `--bg`, `--surface`, `--bark`, `--leaf`, `--sun`, `--clay`, `--cream`,
  `--line`, `--text`, `--text-muted` (light values in `:root`, overridden
  under `.dark`). Component classes are defined in `@layer components`:
  `.card`, `.btn` (+ `.btn-bark`, `.btn-ghost`). Fonts: `Fraunces` (serif,
  headings) and `DM Sans` (sans, body), loaded via Google Fonts `@import`.
  Dark mode toggles via a `.dark` class on `<html>`, set by an inline
  no-flash script in `layout.jsx` before hydration (mirrors the i18n
  no-flash pattern).
- **Gotcha**: unlike the `.card-grid` convention used elsewhere in the Happy
  Factory suite, this app currently lays out card grids with inline
  `style={{ display: "grid", gridTemplateColumns: ... }}` in several
  components (`SuggestionGallery.jsx`, `MemoryManager.jsx`,
  `MemoryGuide.jsx`, `ArtifactEditor.jsx`, `docs/memory-guide/page.jsx`,
  `docs/prompt-guide/page.jsx`). If you touch these, consider migrating to a
  shared `.card-grid` class for consistency and mobile safety.
- Route handlers return `Response.json(...)` / `NextResponse.json(...)`
  directly; auth-gated ones start with `const { session, error } = await
  requireAuth(); if (error) return error;`.
- DB access goes through the single `sql` client in `src/utils/db.js`
  (tagged-template SQL, no ORM). Migrations are hand-written, numbered
  `NNN_description.sql` files applied by `scripts/db-migrate.mjs`.
- Renderer additions for a new target CLI go in
  `src/lib/renderers/<target>.js` and must be registered in
  `src/lib/renderers/index.js`; target metadata (`TARGETS`,
  `TARGET_LABELS`) lives in `src/lib/targets.js` and must stay in sync.
- Security headers (CSP `frame-ancestors 'none'`, `X-Frame-Options: DENY`,
  etc.) are set globally in `next.config.js` — don't duplicate per-route.

## Docs

- `docs/PLAN.md` — phased build plan.
- `docs/GUIA-ARTEFACTOS.md` — artifact authoring guide (Spanish).
- `docs/specs/*.md` — feature specs (artifact manager, AI glossary, OpenSpec
  integration, token cost/savings, prompt-writing guide, skills ideas).
- `docs/specs-happy-code-ai/SPEC.md` — consolidated app spec.
