# Happy Code — Agent Artifact Manager

App de la flota Happy Factory para **crear, almacenar, plantillar, generar y
publicar artefactos de agentes de IA** (agentes, subagentes, skills, snippets de
config) para CLIs como **OpenCode** (MVP). Objetivo transversal: producir código
de calidad con el **mínimo de tokens** (plantillas con variables, salida
estructurada, modelo local opcional).

Spec completo: [`docs/specs/spec-agent-artifact-manager.md`](docs/specs/spec-agent-artifact-manager.md)
· Plan por fases: [`docs/PLAN.md`](docs/PLAN.md)

## Stack

Next.js 16 (App Router, JS) · Neon Postgres · iron-session · Vercel AI SDK + Zod
· Octokit · Handlebars · Tailwind 4 · PWA. Deploy en Vercel.

## Puesta en marcha (dev)

```bash
npm install

# 1. Variables de entorno — .env.local ya trae las de Neon.
#    Faltan: SESSION_SECRET, TOKEN_ENCRYPTION_KEY, GITHUB_CLIENT_ID/SECRET.
#    Ver .env.example.

# 2. Crear el esquema en Neon
npm run db:migrate

# 3. Arrancar
npm run dev   # http://localhost:3000
```

### GitHub OAuth App

Crea una OAuth App en <https://github.com/settings/developers>:

- **Homepage URL:** `http://localhost:3000`
- **Authorization callback URL:** `http://localhost:3000/api/auth/github/callback`

Copia el *Client ID* y genera un *Client Secret* en `.env.local`
(`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`). Se pide el scope `repo` porque la
app necesita escribir artefactos en tus repositorios.

## Estado

Fase 1 (scaffold): auth GitHub OAuth + sesión, esquema de datos, base UI/PWA.
Siguiente: CRUD de artefactos y plantillas (Fase 1.5), generador y publish a
GitHub (Fases 2–3). Ver [`docs/PLAN.md`](docs/PLAN.md).
