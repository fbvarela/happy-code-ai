# Spec — Agent Artifact Manager

> Status: Draft · Author: fbvarela · Created: 2026-06-12

## Context

Crear artefactos para CLIs de agentes de IA (OpenCode, Claude Code, etc.) hoy
significa editar a mano archivos de texto con frontmatter YAML, dispersos por
distintas rutas (`.opencode/agent/*.md`, `~/.config/opencode/`, carpetas de
skills) y re-derivar las mismas convenciones en cada proyecto. No hay un sitio
central para guardar, versionar y reutilizar estos artefactos, ni una forma
rápida de generar uno nuevo a partir de una descripción y soltarlo en el repo
correcto.

**Agent Artifact Manager** es una app de la flota Happy Factory que cubre ese
hueco: un almacén versionado de artefactos (agentes, subagentes, skills,
snippets de config), plantillas con variables para reutilizar sin gastar tokens,
un generador por lenguaje natural con salida estructurada, y commit directo a
repos de GitHub vía API (sin clonar). El MVP apunta a **OpenCode**; la
arquitectura deja la puerta abierta a otros CLIs.

Requisito transversal del producto: **minimizar el gasto de tokens de LLM** sin
sacrificar calidad. Eso condiciona el diseño (plantillas que rellenan huecos sin
LLM, salida estructurada corta, prompt caching, y un proveedor de modelo local
opcional con coste cero).

Documentos relacionados:
- `memory/HAPPY-FACTORY-CONTEXT.md` — patrones de flota (auth, deploy, design).
- `docs/specs/spec-ai-chat-rollout.md` — spec hermano en este mismo árbol.

## Goals

- Almacenar artefactos versionados con tipo, target (CLI destino), frontmatter
  flexible (jsonb) y cuerpo/plantilla, con tags para búsqueda.
- Reutilizar artefactos como **plantillas con variables** (Handlebars), donde
  rellenar huecos cuesta **0 tokens** de LLM.
- **Generar** un artefacto a partir de una descripción en lenguaje natural,
  produciendo salida **estructurada** (frontmatter + cuerpo) validada con Zod.
- **Commitear** el artefacto renderizado a un repo de GitHub del usuario en la
  ruta correcta del target, sin clonar el repo (serverless-friendly).
- **Probar en un repo elegido**: publicar el artefacto en una **rama de prueba**
  (temporal) del repo seleccionado y, opcionalmente, abrir un PR — para verlo en
  un repo real sin tocar `main`.
- **Auth con GitHub OAuth**: el mismo token sirve para login y para los commits.
- Soportar un **LLMProvider enchufable**: Claude (nube, default) y un modelo
  local opcional (Ollama / LM Studio) con coste cero de tokens.
- Renderizado por target desacoplado (patrón Strategy); **OpenCode** en el MVP.

## Non-goals

- **Sin premium / sin Stripe** en esta fase: ni tiers, ni `subscriptions`, ni
  `/api/tier`, ni `<PremiumGate>`.
- No **ejecutar** los agentes/skills desde la app — solo crearlos y publicarlos.
- No editor visual avanzado (WYSIWYG); edición de texto + formulario de
  variables es suficiente para el MVP.
- No multi-usuario/colaboración, ni marketplace público de artefactos.
- No soporte simultáneo de múltiples CLIs en el MVP: solo **OpenCode**
  (la abstracción de renderers queda lista, pero solo se implementa uno).
- No flujo de GitHub App con permisos finos en el MVP (ver Open Questions);
  se parte de OAuth App con scope `repo`.

## Proposed design

### Stack

- **Next.js 16 (App Router)** desplegado en **Vercel**, como el resto de la flota.
- **Neon Postgres** para persistencia; frontmatter en columna **jsonb**.
- **iron-session** para la sesión (cookie), poblada tras OAuth de GitHub.
- **Vercel AI SDK** (`generateObject`) + **Zod** para el generador.
- **Octokit** para escribir en repos vía API de GitHub.
- **Handlebars** como motor de plantillas.

### Modelo de datos

`artifacts`
| campo          | tipo        | notas                                                        |
|----------------|-------------|--------------------------------------------------------------|
| id             | uuid PK     |                                                              |
| user_id        | uuid FK     | dueño (de `users`)                                           |
| name           | text        | nombre legible / slug del artefacto                          |
| type           | text        | `agent` \| `subagent` \| `skill` \| `config_snippet` \| `memory` \| `mcp` |
| target         | text        | `opencode` (MVP); futuros: `claude`, …                       |
| frontmatter    | jsonb       | metadatos del artefacto (model, tools, description, …)       |
| body_template  | text        | cuerpo en Handlebars (con `{{variables}}`)                   |
| variables      | jsonb       | declaración de huecos: nombre, label, default, requerido     |
| tags           | text[]      | búsqueda/filtrado                                            |
| version        | int         | incrementa en cada cambio (ver versionado)                   |
| created_at     | timestamptz |                                                              |
| updated_at     | timestamptz |                                                              |

`artifact_versions` (historial)
| campo        | tipo        | notas                                              |
|--------------|-------------|----------------------------------------------------|
| id           | uuid PK     |                                                    |
| artifact_id  | uuid FK     |                                                    |
| version      | int         |                                                    |
| frontmatter  | jsonb       | snapshot                                           |
| body_template| text        | snapshot                                           |
| created_at   | timestamptz |                                                    |

`users`
| campo        | tipo        | notas                                              |
|--------------|-------------|----------------------------------------------------|
| id           | uuid PK     |                                                    |
| github_id    | bigint      | único                                              |
| github_login | text        |                                                    |
| access_token | text (cifrado) | token OAuth de GitHub (scope `repo`)            |
| created_at   | timestamptz |                                                    |

El token de GitHub se guarda cifrado en reposo (clave en env var de Vercel).

### Auth — GitHub OAuth

1. `/api/auth/github` → redirige a GitHub OAuth solicitando scope **`repo`**
   (necesario para escribir contenidos en repos privados/públicos del usuario).
2. `/api/auth/github/callback` → intercambia el `code` por `access_token`,
   crea/actualiza `users`, cifra y guarda el token, abre sesión iron-session.
3. La sesión guarda `user_id`; el `access_token` se lee de BD (descifrado) solo
   cuando hace falta para una operación Git.

El mismo token cubre **login** y **commits** — una sola integración.

### Plantillas (0 tokens)

Un artefacto es una plantilla Handlebars + una declaración de `variables`. La UI
muestra un formulario con esos huecos; al rellenarlos se renderiza el cuerpo
final **sin llamar al LLM**. Este es el camino preferente y el que más ahorra:
clonar una plantilla curada y tunear 2 campos = coste cero.

### Generador (LLMProvider enchufable)

Interfaz `LLMProvider.generate(prompt, schema) → structured object`, con dos
implementaciones intercambiables por config:

- **`ClaudeProvider`** (default): Vercel AI SDK + API key propia. Activa
  **prompt caching** del system prompt (convenciones + formato del target) para
  abaratar de la 2ª llamada en adelante.
- **`LocalProvider`** (opt-in, 0 tokens): Ollama / LM Studio vía su API
  **OpenAI-compatible** (`baseURL` a `localhost`). Misma llamada
  `generateObject` + Zod; el JSON Schema funciona igual.

Reglas de coste:
- El LLM **no escribe el archivo entero**: rellena solo los campos del schema
  (description, lista de tools, instrucciones), respetando la plantilla del
  target → respuesta corta.
- Salida **estructurada** (Zod), nunca markdown libre que haya que parsear.

**Topología local:** la app desplegada en Vercel no alcanza `localhost`. El
`LocalProvider` se invoca **desde el cliente** (el navegador del usuario llama a
su propio Ollama/LM Studio) y la app persiste el resultado; requiere CORS en
Ollama (`OLLAMA_ORIGINS`). El `ClaudeProvider` corre server-side y funciona
desde cualquier lugar. Default = Claude, para que la app sea usable sin depender
de un modelo local encendido.

### Renderers por target (Strategy)

Interfaz `ArtifactRenderer.render(artifact, values) → { path, content }`, que
conoce la **ruta** y el **formato** de cada CLI:

- **`OpenCodeRenderer`** (MVP): genera el frontmatter YAML + cuerpo y la ruta
  destino (p. ej. `.opencode/agent/<name>.md` o carpeta de skill con
  `SKILL.md`).
- Futuros: `ClaudeRenderer`, etc. — sin tocar el resto del sistema.

### GitHub (Octokit, sin clonar)

- **Un archivo**: Contents API — `PUT /repos/{owner}/{repo}/contents/{path}`
  con `message`, `content` (base64) y `sha` si actualiza. Una sola llamada.
- **Varios archivos** (p. ej. skill con archivos de apoyo): Git Data API —
  crear blobs → tree → commit → update ref. Un commit atómico.
- Nada toca el filesystem de la función serverless → compatible con Vercel.

### Probar en un repo elegido (rama de prueba)

Modo de publicación "prueba" para validar un artefacto en un repo real sin
tocar `main`. **No ejecuta** nada (sigue el non-goal); solo deja el archivo en
el repo en una rama aislada para que el usuario lo pruebe con su CLI localmente
o lo revise vía PR.

Flujo (todo vía Octokit, sin clonar):
1. Resolver el `sha` del `HEAD` de la rama base (default branch o la elegida):
   `GET /repos/{owner}/{repo}/git/ref/heads/{base}`.
2. Crear una **rama de prueba** desde ese sha:
   `POST /repos/{owner}/{repo}/git/refs` con
   `ref: refs/heads/aam/test/<artifact-name>-<timestamp>`.
3. Commitear el artefacto renderizado en esa rama (Contents API para un archivo,
   Git Data API para varios) — misma lógica que el publish normal, distinto ref.
4. **Opcional**: abrir un PR `aam/test/... → base`
   (`POST /repos/{owner}/{repo}/pulls`) con cuerpo que describe el artefacto;
   devolver la URL del PR a la UI.

Sin clonar, sin filesystem → compatible con serverless. La elección del repo
reutiliza `GET /api/repos`. El prefijo de rama `aam/test/` permite limpiar
ramas de prueba fácilmente (y es candidato a borrado automático — ver Open
Questions).

### API surface (rutas)

- `GET/POST /api/artifacts` — listar / crear.
- `GET/PUT/DELETE /api/artifacts/:id` — leer / actualizar (versiona) / borrar.
- `POST /api/artifacts/:id/render` — renderizar con `values` (0 tokens).
- `POST /api/generate` — generar artefacto desde NL (LLMProvider server-side;
  el modo local se resuelve en cliente).
- `POST /api/artifacts/:id/publish` — commit a `{repo, path, message}` vía Octokit.
- `POST /api/artifacts/:id/test` — publicar en una **rama de prueba** de
  `{repo, base, openPr?}`; crea `aam/test/...`, commitea y (opcional) abre PR;
  devuelve `{ branch, prUrl? }`.
- `GET /api/repos` — listar repos del usuario (para elegir destino).
- `GET /api/auth/github`, `GET /api/auth/github/callback`, `POST /api/auth/logout`.

### UI flow

1. Login con GitHub.
2. Biblioteca de artefactos (lista + búsqueda por tags/type/target).
3. Crear: desde cero, clonando una plantilla, o **generando** desde NL.
4. Rellenar variables → preview del archivo renderizado.
5. Elegir repo + ruta → **Publish** (commit a la ruta) o **Probar** (rama de
   prueba `aam/test/...`, opción de abrir PR; se muestra el enlace al PR/rama).

### Failure modes

- **Token sin scope `repo` / revocado** → 401 de GitHub al publicar; detectar y
  pedir re-login. Distinguir de "repo sin permiso de escritura".
- **Conflicto de `sha` en Contents API** (archivo cambió en remoto) → reintentar
  leyendo el `sha` actual; si difiere, avisar al usuario antes de sobrescribir.
- **LocalProvider inalcanzable** (Ollama apagado / CORS) → error claro en
  cliente y fallback sugerido a Claude.
- **Salida del LLM que no valida el schema** → reintento acotado; si falla, se
  muestra el borrador para edición manual (no se pierde trabajo).

## Alternatives considered

- **Backend en Spring Boot + JGit** (stack nativo del usuario): descartado por
  romper la consistencia de flota (auth/deploy/design reutilizables) y porque
  JGit (clone/commit/push) no encaja en serverless. La API de GitHub vía Octokit
  resuelve el commit con menos código y sin filesystem.
- **Auth magic-link (convención de flota)**: descartado porque la app necesita
  el token de GitHub para su función core (commits); GitHub OAuth cubre login y
  token en una sola integración. Ver Open Questions.
- **Generar el archivo completo con el LLM**: descartado por coste de tokens; el
  enfoque plantilla + huecos estructurados produce respuestas mucho más cortas.
- **Solo modelo local / solo nube**: descartado en favor del proveedor
  enchufable, que da coste cero cuando hay modelo local y disponibilidad
  universal con Claude por defecto.

## Risks & open questions

- **Desviación de la convención de flota (magic-link only).** El `CLAUDE.md`
  global manda magic-link y "no OAuth unless explicitly needed". Aquí está
  **explícitamente justificado**: la app necesita el token de GitHub para
  commitear, así que OAuth de GitHub no es un lujo sino el requisito core. Queda
  anotado como decisión consciente.
- **Scope del token**: `repo` (OAuth App) es amplio. Alternativa "bien hecha" =
  **GitHub App** con `contents:write` acotado a repos elegidos por el usuario,
  a coste de más infra. ¿MVP con OAuth App y migración posterior a GitHub App? OAuth
- **Cifrado del token en reposo**: confirmar mecanismo (clave en env Vercel) y
  rotación. no sé
- **Modo local desde el cliente — paso de setup del usuario.** Como el modelo
  local lo llama el **navegador** a `localhost` (no el servidor de Vercel), el
  navegador bloqueará esa petición por **CORS** (origen distinto) salvo que el
  usuario autorice la web en su servidor local: en Ollama, arrancar con
  `OLLAMA_ORIGINS="https://<dominio-de-la-app>"` (LM Studio tiene su ajuste
  equivalente). Pendiente: (a) **documentar** ese paso de configuración con
  claridad — el error de CORS es críptico y sin esto el modo local "no funciona"
  sin motivo aparente; (b) **validar la experiencia** — comprobar con uso real
  si pedir ese ajuste es fricción aceptable, o si conviene detectar el fallo de
  CORS y mostrar las instrucciones dentro de la propia app.
- **Versionado**: ¿historial completo en `artifact_versions` desde el día 1 o
  basta con `version` incremental + último snapshot? lo segundo
- **Limpieza de ramas de prueba** (`aam/test/...`): ¿borrado manual, botón en la
  UI, o limpieza automática (al cerrar/mergear el PR, o por antigüedad)? Riesgo
  de acumular ramas si no se gestiona. borrado manual

## Rollout plan

App nueva, sin migración de datos. Fase 1: scaffold de flota (Next.js 16 + Neon
+ iron-session) **sin** Stripe/premium, auth GitHub OAuth, CRUD de artefactos y
plantillas (0 tokens). Fase 2: generador con `ClaudeProvider` + publish vía
Octokit (Contents API, un archivo). Fase 3: `LocalProvider` (Ollama/LM Studio)
y Git Data API (multi-archivo para skills). Cada fase es desplegable de forma
independiente; el `LocalProvider` y los renderers extra van detrás de su propia
config para no bloquear el MVP.

## Success metrics

- Crear y publicar un artefacto de OpenCode a un repo en **< 1 min** desde la
  biblioteca, sin tocar el filesystem.
- **% de creaciones vía plantilla (0 tokens)** vs. generación — objetivo: la
  mayoría por plantilla.
- **Tokens medios por generación** por debajo de un umbral fijado (gracias a
  salida estructurada + prompt caching); 0 cuando se usa `LocalProvider`.
- Tasa de commits con éxito a la primera (sin conflictos de `sha` no resueltos).
