# Guía de artefactos — Happy Code (OpenCode)

Cómo usar cada artefacto que genera la app: **qué archivo crea**, **en qué
carpeta cae** dentro de tu repo, y **cómo lo invoca OpenCode**.

> Todas las rutas son relativas a la raíz del repo donde publicas. La app las
> calcula sola a partir del **tipo** y el **nombre** (slug en minúsculas con
> guiones). El renderer está en [`src/lib/renderers/opencode.js`](../src/lib/renderers/opencode.js).

---

## Resumen rápido

| Tipo | Archivo generado | Formato | Cómo se usa en OpenCode |
|------|------------------|---------|--------------------------|
| **Agente** | `.opencode/agent/<slug>.md` | Markdown + frontmatter | Agente principal; lo eliges al iniciar sesión |
| **Subagente** | `.opencode/agent/<slug>.md` | Markdown + frontmatter | Delegado; lo llama un agente o `@<slug>` |
| **Skill** | `.opencode/skill/<slug>/SKILL.md` | Markdown + frontmatter | Capacidad reutilizable cargada bajo demanda |
| **Slash command** | `.opencode/command/<slug>.md` | Markdown + frontmatter | Prompt con nombre que lanzas con `/<slug>` |
| **Memoria** | `AGENTS.md` o `.opencode/memory/<slug>.md` | Markdown | Contexto persistente del proyecto |
| **MCP** | `.opencode/mcp/<slug>.json` | JSON | Servidor de herramientas externas |
| **Config** | `.opencode/<slug>.json` | JSON | Fragmento de configuración de OpenCode |

---

## 1. Agente — `.opencode/agent/<slug>.md`

Un **agente** es la personalidad/instrucciones principales con las que hablas.

**Carpeta:** `.opencode/agent/`
**Archivo:** un `.md` por agente (ej. `revisor-java.md`).
**Formato:** frontmatter YAML (modelo, herramientas, descripción) + cuerpo con
las instrucciones en lenguaje natural.

```markdown
---
description: Revisor de código Java Spring Boot
model: claude-opus-4-8
temperature: 0.2
---

Eres un revisor senior de Java/Spring Boot. Prioriza...
```

**Cómo se usa:** al arrancar OpenCode en el repo, el agente aparece como opción.
Cámbialo con el selector de agente (o `Tab` según tu config).

---

## 2. Subagente — `.opencode/agent/<slug>.md`

Mismo archivo y carpeta que un agente: la diferencia es **el rol**. Un subagente
está pensado para que **otro agente lo delegue** una tarea acotada (revisar,
buscar, planificar), no para conversar tú directamente.

**Cómo se usa:**
- Un agente principal lo invoca cuando su `description` encaja con la tarea.
- Manualmente: `@<slug>` en el chat (ej. `@buscador-tests encuentra...`).

> Mantén la `description` muy concreta: es lo que el agente padre lee para
> decidir si delegar.

---

## 3. Skill — `.opencode/skill/<slug>/SKILL.md`

Una **skill** es una capacidad reutilizable (un procedimiento, una checklist, un
formato de salida) que OpenCode carga **solo cuando hace falta**.

**Carpeta:** `.opencode/skill/<slug>/` — **una carpeta por skill**.
**Archivo principal:** `SKILL.md` (frontmatter + instrucciones).
**Archivos de apoyo:** cualquier extra que añadas en "Archivos adicionales" cae
**dentro de la misma carpeta**, con rutas relativas:

```
.opencode/skill/migrar-flyway/
├── SKILL.md
├── plantilla.sql        ← archivo adicional
└── checklist.md         ← archivo adicional
```

**Cómo se usa:** se activa por su `description` (carga progresiva) o se nombra
explícitamente. Los archivos de apoyo los referencia el `SKILL.md` por su ruta
relativa (`plantilla.sql`).

> Por eso esta es la única que vive en **su propia carpeta**: para agrupar el
> `SKILL.md` con sus recursos.

---

## 4. Slash command — `.opencode/command/<slug>.md`

Un **slash command** es un prompt con nombre que lanzas escribiendo `/<slug>` en
el chat: encapsula una instrucción que repites mucho (generar tests, refactor,
explicar un diff…).

**Carpeta:** `.opencode/command/`
**Archivo:** un `.md` por comando (ej. `tests.md` → se invoca `/tests`).
**Formato:** frontmatter YAML (`description`, opcional `agent`/`model`) + cuerpo
con el prompt. Usa **`$ARGUMENTS`** para inyectar lo que escribas tras el comando.

```markdown
---
description: Genera tests para el archivo indicado
---

Escribe tests unitarios para:

Argumentos del usuario: $ARGUMENTS
```

**Cómo se usa:** en el chat de OpenCode escribes `/tests src/Foo.java` y el
`$ARGUMENTS` se sustituye por `src/Foo.java` antes de enviar el prompt.

> El scaffold de la app deja la `description` en la frontmatter (edítala como
> JSON) y la instrucción como variable `{{instruction}}` del cuerpo.

---

## 5. Memoria — `AGENTS.md` o `.opencode/memory/<slug>.md`

Contexto **persistente** que OpenCode lee siempre: convenciones del proyecto,
comandos de build, reglas de estilo.

**Regla de ruta especial:**
- Si llamas al artefacto **`agents`** → se publica como **`AGENTS.md`** en la
  raíz del repo (el archivo que OpenCode carga por defecto).
- Cualquier otro nombre → `.opencode/memory/<slug>.md` (memoria con nombre,
  útil para temas concretos: `despliegue.md`, `convenciones-tests.md`).

**Cómo se usa:** `AGENTS.md` se inyecta automáticamente. Las memorias con nombre
las referencias o las consolidas en `AGENTS.md` según las necesites.

---

## 6. MCP — `.opencode/mcp/<slug>.json`

Configuración de un **servidor MCP** (Model Context Protocol): conecta
herramientas externas (Postgres, GitHub, un linter…) al agente.

**Carpeta:** `.opencode/mcp/`
**Archivo:** `.json` con el comando que arranca el servidor y su entorno.

```json
{
  "mi-postgres": {
    "type": "local",
    "command": ["npx", "-y", "@scope/mcp-server"],
    "environment": { "DATABASE_URL": "postgres://..." }
  }
}
```

**Cómo se usa:** OpenCode arranca el servidor declarado y expone sus
herramientas al agente. Útil para dar acceso a tu base de datos o APIs sin
escribir código pegamento.

> El scaffold de la app ya rellena `type: "local"`, `command` y un par de
> variables de entorno como huecos `{{...}}`.

---

## 7. Config — `.opencode/<slug>.json`

Un **fragmento de configuración** suelto de OpenCode (no es un servidor MCP ni un
agente): ajustes, permisos, atajos, lo que quieras versionar como JSON.

**Carpeta:** `.opencode/` (raíz de la config).
**Archivo:** `.json` con el nombre que le des.

**Cómo se usa:** OpenCode lee la config de `.opencode/`. Úsalo para trozos de
configuración que quieras compartir entre el equipo vía el repo.

---

## Cómo publicar (los 3 botones)

Desde el editor de la app, una vez creado el artefacto:

1. **Publicar en GitHub** — commitea el/los archivo(s) directo a una rama (por
   defecto la principal del repo elegido). 1 archivo va por la Contents API;
   varios archivos (skill con apoyos) van en **un commit atómico** por la Git
   Data API.
2. **Probar en rama** — crea una rama desechable `aam/test/<slug>-<timestamp>`,
   commitea ahí y opcionalmente abre un PR. No toca tu rama principal: ideal
   para revisar antes de adoptar.
3. **Variables** — antes de publicar, rellena las variables del artefacto; el
   render sustituye los `{{huecos}}` sin gastar tokens.

---

## Estructura final típica en tu repo

```
tu-repo/
├── AGENTS.md                          ← memoria "agents"
└── .opencode/
    ├── agent/
    │   ├── revisor-java.md            ← agente
    │   └── buscador-tests.md          ← subagente
    ├── skill/
    │   └── migrar-flyway/
    │       ├── SKILL.md               ← skill + apoyos
    │       └── plantilla.sql
    ├── command/
    │   └── tests.md                   ← slash command (/tests)
    ├── memory/
    │   └── despliegue.md              ← memoria con nombre
    ├── mcp/
    │   └── mi-postgres.json           ← MCP
    └── permisos.json                  ← config
```
