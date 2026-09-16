# AGENTS.md — Happy Code Agent Instructions

> Auto-generated on repo bootstrap. Verify against current code before relying on it.

## Developer Commands (exact, non-obvious)

| Command | Purpose |
|---|---|
| `npm install` | Install deps (run once after clone) |
| `npm run dev` | Start Next.js dev server (`--webpack` flag) at http://localhost:3000 |
| `npm run build` | Run Next.js build (`--webpack`) |
| `npm start` | Start production server (`next start`) |
| `npm run lint` | Run ESLint (`next lint`) |
| `npm run db:migrate` | Apply pending Neon Postgres migrations via `scripts/db-migrate.mjs` |
| `npm run glossary:seed` | Seed glossary static data via `scripts/seed-glossary.mjs` (requires `GROQ_API_KEY`) |
| `npm run icons:pwa` | Regenerate PWA icons via `scripts/gen-pwa-icons.mjs` |

## Environment & Auth

- Copy `.env.example` to `.env.local` and fill in:
  - `SESSION_SECRET` (≥32 chars) — iron-session cookie key
  - `TOKEN_ENCRYPTION_KEY` (64 hex chars / 32 bytes) — AES-256-GCM for GitHub token encryption
  - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — OAuth App credentials
  - `ANTHROPIC_API_KEY` (optional, preferred) / `AGNES_API_KEY` (fallback)
- GitHub OAuth requires `repo` scope — the app writes artifacts into your repos
- If `SESSION_SECRET` is missing or <32 chars, the middleware redirects to login with `error=server_misconfigured`

## Architecture quick facts

- **Framework**: Next.js 16 (App Router, plain JS/JSX — no TypeScript)
- **Path alias**: `@/*` → `src/*` (set in `jsconfig.json`)
- **Data layer**: `src/lib/*.js` holds domain logic; `sql` tagged-template client in `src/utils/db.js` (Neon Postgres via `@neondatabase/serverless`)
- **Migrations**: Hand-written SQL in `src/db/migrations/*.sql`; applied via `npm run db:migrate`
- **AI generation**: Vercel AI SDK + Zod schemas via `generateObject`. Provider order: Anthropic (`ANTHROPIC_API_KEY`, default `claude-opus-4-8`) → Agnes 2.0 (`AGNES_API_KEY`, default `agnes-2.0-flash`, gateway at `https://apihub.agnes-ai.com/v1`)
- **Renderers**: One per target CLI in `src/lib/renderers/{base,claude,cursor,gemini,junie,opencode}.js`; registered in `src/lib/renderers/index.js`
- **No test runner**: No `test` script in `package.json`; manual verification only
- **Tailwind CSS 4** with design tokens: `--bg`, `--surface`, `--bark`, `--leaf`, `--sun`, `--clay`, `--cream`, `--line`, `--text`, `--text-muted`
- **PWA**: `@ducanh2912/next-pwa` configured but disabled in dev; security headers in `next.config.js`
- **i18n**: Custom context in `src/lib/i18n.js` (`es`/`en`, default `es`); pre-hydration inline script in `layout.jsx` avoids language flash
- **Dark mode**: `.dark` class on `<html>`; toggled by inline no-flash script before hydration

## Gotchas & conventions

- **Card grids** use inline `style={{ display: "grid", gridTemplateColumns: ... }}` in several components
  (`SuggestionGallery`, `MemoryManager`, `MemoryGuide`, `ArtifactEditor`, `docs/memory-guide/page.jsx`,
  `docs/prompt-guide/page.jsx`). Consider migrating to shared `.card-grid` class for consistency and mobile safety.
- **Route handlers** return `Response.json(...)` / `NextResponse.json(...)` directly; auth-gated ones start with
  `const { session, error } = await requireAuth(); if (error) return error;`
- **Renderer additions** for a new target CLI go in `src/lib/renderers/<target>.js` and must be registered in
  `src/lib/renderers/index.js`; target metadata (`TARGETS`, `TARGET_LABELS`) in `src/lib/targets.js` must stay in sync.
- **Security headers** (CSP `frame-ancestors 'none'`, `X-Frame-Options: DENY`, etc.) are set globally in `next.config.js` — don't duplicate per-route.
- **Body templates** are Handlebars (`handlebars`) with `{{variableName}}` holes filled from typed `variables[]`.

## Key files to know

- `src/app/layout.jsx` — layout with i18n/no-flash scripts, theme dark-mode script
- `src/app/globals.css` — design tokens, Tailwind base
- `src/lib/artifacts.js` — artifact CRUD schemas and versioning
- `src/lib/generator.js` — AI generation (Anthropic/Agnes), prompt schema, quality checks
- `src/lib/render.js` — Handlebars template renderer (pure function)
- `src/lib/github.js` — Octokit setup, `octokitForUser(session.userId)`
- `src/lib/session.js` — iron-session configuration
- `src/db/migrations/` — numbered migration files
- `scripts/db-migrate.mjs` — migration runner
- `src/app/api/repos/route.js` — lists user's repos for publish picker
- `src/app/api/memory/scan/route.js` — scans a GitHub repo for memory files
- `src/app/api/memory/publish/route.js` — commits memory file changes to a GitHub repo

## Open questions / TBD

- Test runner: none configured; may need to add one per project needs
- Card-grid migration: inline styles vs. shared `.card-grid` class
- PWA in production: verify Workbox runtime-caching behavior after build