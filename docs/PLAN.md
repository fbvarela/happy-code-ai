# PLAN — Happy Code (Agent Artifact Manager)

Plan de implementación por fases. Cada fase es desplegable de forma
independiente. Spec: [`specs/spec-agent-artifact-manager.md`](specs/spec-agent-artifact-manager.md).

## Fase 1 — Scaffold + Auth (HECHO)

- [x] Base de flota Next.js 16 (App Router, JS), Tailwind 4, PWA, headers de seguridad.
- [x] Neon Postgres (`src/utils/db.js`) + esquema (`users`, `artifacts`, `artifact_versions`) y `npm run db:migrate`.
- [x] iron-session (`src/lib/session.js`) + `middleware.js` de protección de rutas.
- [x] **GitHub OAuth** (login + token para commits, scope `repo`), token cifrado en reposo (AES-256-GCM).
- [x] Páginas base: `/login`, home con sesión, `/offline`.
- [ ] Iconos PWA reales en `public/icons/` (192/512) — placeholder pendiente.

## Fase 1.5 — CRUD de artefactos + plantillas (0 tokens) (HECHO)

- [x] API REST: `GET/POST /api/artifacts`, `GET/PUT/DELETE /api/artifacts/:id` (con check de propiedad / sin IDOR).
- [x] Versionado: snapshot en `artifact_versions` al crear y al actualizar (bump de `version`).
- [x] Editor de artefacto (nombre, tipo, target, tags, frontmatter JSON, cuerpo Handlebars, editor de `variables`).
- [x] `POST /api/artifacts/:id/render` — render con `values` (sin LLM) + preview en vivo client-side.
- [x] Biblioteca: lista + búsqueda por nombre/tag + filtro por tipo. Clonar y borrar (confirmación inline, sin diálogo nativo).
- [x] Validación con Zod (`src/lib/artifacts.js`), render compartido (`src/lib/render.js`).

## Fase 2 — Generador (LLMProvider) + Publish (HECHO)

- [x] Generador Claude (`src/lib/generator.js`): Vercel AI SDK · `generateObject` + Zod, salida estructurada corta, **prompt caching** del system prompt (`providerOptions.anthropic.cacheControl`). Modelo configurable (`GENERATOR_MODEL`, default `claude-opus-4-8`).
- [x] `POST /api/generate` — NL → artefacto estructurado (no persiste). 503 si no hay `ANTHROPIC_API_KEY`.
- [x] `OpenCodeRenderer` (Strategy, `src/lib/renderers/`): `render(artifact, values) → { path, content }`; frontmatter YAML para markdown, JSON crudo para mcp/config; ruta por tipo.
- [x] `GET /api/repos` (Octokit) + `POST /api/artifacts/:id/publish` (Contents API, 1 archivo, con `sha` para update; manejo 409).
- [x] UI: panel "Generar con IA" (modo nuevo) + panel "Publicar en GitHub" (modo edición) en el editor.

## Fase 3 — Local provider + Test en repo + multi-archivo

- [ ] `LocalProvider` (Ollama/LM Studio, OpenAI-compatible, llamada cliente) — ver nota CORS/`OLLAMA_ORIGINS` en el spec.
- [ ] `POST /api/artifacts/:id/test` — rama `aam/test/...` + PR opcional (Octokit).
- [ ] Git Data API: commit multi-archivo (skills con archivos de apoyo).
- [ ] Limpieza de ramas de prueba.

## Pendientes transversales / Open questions (del spec)

- OAuth App (scope `repo`) hoy → ¿migrar a GitHub App con `contents:write` acotado?
- Rotación de `TOKEN_ENCRYPTION_KEY`.
- ¿Historial completo en `artifact_versions` o solo `version` + último snapshot?
- Validar fricción del modo local (paso de setup `OLLAMA_ORIGINS`).
