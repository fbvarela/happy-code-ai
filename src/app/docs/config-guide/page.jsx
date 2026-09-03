"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { TARGET_LABELS } from "@/lib/targets";

// ── Content ─────────────────────────────────────────────────────────────────

const SECTIONS_EN = [
  {
    slug: "opencode",
    label: "OpenCode project config",
    tag: "opencode.json",
    tagColor: "var(--leaf, #2a7a2a)",
    when: "The project-level OpenCode config placed at the repo root. Overrides the global user config (~/.config/opencode/opencode.json) for this project only. Safe to commit to version control.",
    path: "opencode.json",
    example: `{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "autoupdate": true,
  "server": {
    "port": 4096
  },
  "mcp": {
    "postgres": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"],
      "args": ["postgres://localhost/mydb"]
    }
  },
  "plugins": ["opencode-ponytail"]
}`,
  },
  {
    slug: "settings",
    label: "Settings (per CLI)",
    tag: "settings.json",
    tagColor: "var(--bark)",
    when: "Every CLI reads a settings.json in its own directory. This is where model defaults, temperature, tool permissions, and other runtime options live.",
    path: ".claude/settings.json",
    example: `{
  "model": "claude-opus-4-6",
  "temperature": 0.2,
  "maxTokens": 8192,
  "permissions": {
    "allow": ["Bash(git *)", "Read(/**)"],
    "deny": ["Bash(rm -rf /)", "WebFetch"]
  }
}`,
  },
  {
    slug: "mcp-project",
    label: "MCP servers (project-level)",
    tag: ".mcp.json",
    tagColor: "var(--leaf, #2a7a2a)",
    when: "Claude Code reads .mcp.json at the repo root to discover MCP servers. Other CLIs use target-specific paths. MCP servers expose external tools (databases, APIs, filesystems) to the agent.",
    path: ".mcp.json",
    example: `{
  "mcpServers": {
    "postgres": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"],
      "args": ["postgres://user:pass@localhost:5432/mydb"],
      "env": { "PGSSLMODE": "require" }
    },
    "github": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "<GITHUB_TOKEN>" }
    }
  }
}`,
  },
  {
    slug: "mcp-opencode",
    label: "MCP servers (OpenCode-specific)",
    tag: ".opencode/mcp/*.json",
    tagColor: "var(--leaf, #2a7a2a)",
    when: "OpenCode looks for individual MCP configs in .opencode/mcp/. Each file is one server definition, making it easier to version and review individual servers separately.",
    path: ".opencode/mcp/postgres.json",
    example: `{
  "type": "local",
  "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"],
  "args": ["postgres://user:pass@localhost:5432/mydb"],
  "environment": {
    "PGSSLMODE": "require"
  }
}`,
  },
  {
    slug: "global-mcp",
    label: "Global MCP (cross-tool)",
    tag: ".mcp.json (root)",
    tagColor: "var(--sun)",
    when: "A single .mcp.json at the repo root is read by Claude Code, Cursor, and other tools that support it. Use this when you want one MCP config shared across multiple CLIs without duplication.",
    path: ".mcp.json",
    example: `{
  "mcpServers": {
    "fs": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/projects"]
    }
  }
}`,
  },
  {
    slug: "cursor-rules",
    label: "Cursor rules (config-like)",
    tag: ".cursor/settings.json",
    tagColor: "var(--clay)",
    when: "Cursor doesn't use settings.json for model config in the same way — it reads settings from .cursor/settings.json for IDE-level preferences and from .cursor/rules/ for agent behavior. MCP lives in .cursor/mcp.json.",
    path: ".cursor/settings.json",
    example: `{
  "disableQueryTelemetry": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.insertSpaces": true
}`,
  },
  {
    slug: "gemini-settings",
    label: "Gemini CLI settings",
    tag: ".gemini/settings.json",
    tagColor: "var(--clay)",
    when: "Gemini CLI stores all project config in a single .gemini/settings.json: model, tools, MCP servers, and agent instructions. It's the canonical config file for Gemini.",
    path: ".gemini/settings.json",
    example: `{
  "model": "gemini-2.5-pro",
  "tools": ["bash", "read", "write", "edit"],
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgres://localhost/db"]
    }
  }
}`,
  },
  {
    slug: "junie-config",
    label: "JetBrains Junie config",
    tag: ".junie/config.json",
    tagColor: "var(--clay)",
    when: "Junie uses .junie/config.json for its own settings and .junie/mcp/mcp.json for MCP servers. Keep model and tool config separate from agent definitions which live in .junie/agents/.",
    path: ".junie/config.json",
    example: `{
  "model": "claude-sonnet-4-20250514",
  "temperature": 0.3,
  "maxTokens": 4096,
  "permissions": {
    "autoApprove": ["Read(*)"],
    "deny": ["Bash(rm -rf *)"]
  }
}`,
  },
];

const SECTIONS_ES = [
  {
    slug: "opencode",
    label: "Config del proyecto OpenCode",
    tag: "opencode.json",
    tagColor: "var(--leaf, #2a7a2a)",
    when: "El config de proyecto de OpenCode en la raíz del repo. Sobreescribe el config global del usuario (~/.config/opencode/opencode.json) solo para este proyecto. Seguro para commitear al version control.",
    path: "opencode.json",
    example: `{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "autoupdate": true,
  "server": {
    "port": 4096
  },
  "mcp": {
    "postgres": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"],
      "args": ["postgres://localhost/mydb"]
    }
  },
  "plugins": ["opencode-ponytail"]
}`,
  },
  {
    slug: "settings",
    label: "Ajustes (por CLI)",
    tag: "settings.json",
    tagColor: "var(--bark)",
    when: "Cada CLI lee un settings.json en su propio directorio. Aquí van los valores por defecto del modelo, temperatura, permisos de herramientas y otras opciones de ejecución.",
    path: ".claude/settings.json",
    example: `{
  "model": "claude-opus-4-6",
  "temperature": 0.2,
  "maxTokens": 8192,
  "permissions": {
    "allow": ["Bash(git *)", "Read(/**)"],
    "deny": ["Bash(rm -rf /)", "WebFetch"]
  }
}`,
  },
  {
    slug: "mcp-project",
    label: "Servidores MCP (nivel proyecto)",
    tag: ".mcp.json",
    tagColor: "var(--leaf, #2a7a2a)",
    when: "Claude Code lee .mcp.json en la raíz del repo para descubrir servidores MCP. Otros CLIs usan rutas específicas. Los servidores MCP exponen herramientas externas (bbdd, APIs, sistema de archivos) al agente.",
    path: ".mcp.json",
    example: `{
  "mcpServers": {
    "postgres": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"],
      "args": ["postgres://user:pass@localhost:5432/mydb"],
      "env": { "PGSSLMODE": "require" }
    },
    "github": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "<GITHUB_TOKEN>" }
    }
  }
}`,
  },
  {
    slug: "mcp-opencode",
    label: "Servidores MCP (OpenCode)",
    tag: ".opencode/mcp/*.json",
    tagColor: "var(--leaf, #2a7a2a)",
    when: "OpenCode busca configuraciones MCP individuales en .opencode/mcp/. Cada archivo es un servidor, lo que facilita versionar y revisar cada uno por separado.",
    path: ".opencode/mcp/postgres.json",
    example: `{
  "type": "local",
  "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"],
  "args": ["postgres://user:pass@localhost:5432/mydb"],
  "environment": {
    "PGSSLMODE": "require"
  }
}`,
  },
  {
    slug: "global-mcp",
    label: "MCP global (multi-herramienta)",
    tag: ".mcp.json (raíz)",
    tagColor: "var(--sun)",
    when: "Un único .mcp.json en la raíz del repo es leído por Claude Code, Cursor y otras herramientas que lo soportan. Úsalo cuando quieras un config MCP compartido entre varios CLIs sin duplicación.",
    path: ".mcp.json",
    example: `{
  "mcpServers": {
    "fs": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/projects"]
    }
  }
}`,
  },
  {
    slug: "cursor-rules",
    label: "Reglas de Cursor (config)",
    tag: ".cursor/settings.json",
    tagColor: "var(--clay)",
    when: "Cursor no usa settings.json para config de modelo como tal — lee preferencias del IDE desde .cursor/settings.json y comportamiento del agente desde .cursor/rules/. MCP va en .cursor/mcp.json.",
    path: ".cursor/settings.json",
    example: `{
  "disableQueryTelemetry": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.insertSpaces": true
}`,
  },
  {
    slug: "gemini-settings",
    label: "Ajustes de Gemini CLI",
    tag: ".gemini/settings.json",
    tagColor: "var(--clay)",
    when: "Gemini CLI almacena toda la config de proyecto en un solo .gemini/settings.json: modelo, herramientas, servidores MCP e instrucciones del agente. Es el archivo canónico para Gemini.",
    path: ".gemini/settings.json",
    example: `{
  "model": "gemini-2.5-pro",
  "tools": ["bash", "read", "write", "edit"],
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgres://localhost/db"]
    }
  }
}`,
  },
  {
    slug: "junie-config",
    label: "Config de JetBrains Junie",
    tag: ".junie/config.json",
    tagColor: "var(--clay)",
    when: "Junie usa .junie/config.json para sus propios ajustes y .junie/mcp/mcp.json para servidores MCP. Mantén el config de modelo y herramientas separado de las definiciones de agente que van en .junie/agents/.",
    path: ".junie/config.json",
    example: `{
  "model": "claude-sonnet-4-20250514",
  "temperature": 0.3,
  "maxTokens": 4096,
  "permissions": {
    "autoApprove": ["Read(*)"],
    "deny": ["Bash(rm -rf *)"]
  }
}`,
  },
];

const PRACTICES_EN = [
  { ok: true,  text: "Keep settings.json minimal — only override what differs from the CLI defaults." },
  { ok: true,  text: "Use environment variables (e.g. $GITHUB_TOKEN) in MCP configs; never hardcode secrets." },
  { ok: true,  text: "One MCP server per use-case: database, API, filesystem. Don't bundle everything into one file." },
  { ok: true,  text: "Commit config files to version control — they are project artifacts, not personal preferences." },
  { ok: true,  text: "Use .mcp.json at the repo root when multiple CLIs need the same servers — avoids drift." },
  { ok: true,  text: "Test MCP connections after publishing — a broken server blocks the agent from using its tools." },
  { ok: false, text: "Don't put large tool definitions or prompts in settings.json — use agent/skill artifacts for that." },
  { ok: false, text: "Don't mix target-specific config into a shared .mcp.json — keep per-CLI overrides in their own files." },
  { ok: false, text: "Don't store API keys directly in config files — use environment variables or your OS keychain." },
  { ok: false, text: "Don't let settings.json grow past 50 lines — split into targeted files or move to artifacts." },
  { ok: false, text: "Don't commit .mcp.json files that contain credentials — use placeholder values and document the real ones in AGENTS.md." },
  { ok: false, text: "Don't duplicate the same MCP config across all 5 CLI targets manually — use Sync to propagate changes." },
];

const PRACTICES_ES = [
  { ok: true,  text: "Mantén settings.json minimal — sobreescribe solo lo que difiera de los valores por defecto del CLI." },
  { ok: true,  text: "Usa variables de entorno (ej. $GITHUB_TOKEN) en configs MCP; nunca metas secrets en duro." },
  { ok: true,  text: "Un servidor MCP por caso de uso: base de datos, API, sistema de archivos. No agrupes todo en un archivo." },
  { ok: true,  text: "Committea archivos de config al version control — son artefactos del proyecto, no preferencias personales." },
  { ok: true,  text: "Usa .mcp.json en la raíz del repo cuando varios CLIs necesitan los mismos servidores — evita drift." },
  { ok: true,  text: "Prueba las conexiones MCP después de publicar — un servidor roto bloquea las herramientas del agente." },
  { ok: false, text: "No pongas definiciones grandes de herramientas o prompts en settings.json — usa artefactos de agente/skill para eso." },
  { ok: false, text: "No mezcles config específica de un target en un .mcp.json compartido — mantén sobrescrituras por-CLI en sus propios archivos." },
  { ok: false, text: "No almacenes API keys directamente en archivos de config — usa variables de entorno o el llavero del SO." },
  { ok: false, text: "No dejes que settings.json supere las 50 líneas — separa en archivos dirigidos o migra a artefactos." },
  { ok: false, text: "No commitees .mcp.json que contengan credenciales — usa valores placeholder y documenta los reales en AGENTS.md." },
  { ok: false, text: "No dupliques el mismo config MCP en los 5 CLIs manualmente — usa Sincronizar a para propagar cambios." },
];

const ROOT_VS_TARGETED_EN = {
  title: "Global config vs. target-specific config",
  global: {
    label: "Global / shared (repo root)",
    items: [
      ".mcp.json — MCP servers shared across all CLIs",
      "AGENTS.md / CLAUDE.md / GEMINI.md — root memory files",
      "Read by any CLI that supports the standard path",
      "Best for: servers, shared tools, project-wide context",
    ],
    tip: "When in doubt, put it at the root. More CLIs recognize root-level files than target-specific directories.",
  },
  targeted: {
    label: "Target-specific (per CLI directory)",
    items: [
      ".claude/settings.json — Claude Code model & permission overrides",
      "opencode.json — OpenCode project config (root)",
      ".cursor/settings.json — Cursor IDE preferences",
      ".gemini/settings.json — Gemini CLI model + tools + MCP",
      ".junie/config.json — Junie model & permission config",
    ],
    tip: "Use target-specific files when a CLI has unique options the global config can't express. The Config manager scans all of these automatically.",
  },
};

const ROOT_VS_TARGETED_ES = {
  title: "Config global vs. config por target",
  global: {
    label: "Global / compartida (raíz del repo)",
    items: [
      ".mcp.json — servidores MCP compartidos entre todos los CLIs",
      "AGENTS.md / CLAUDE.md / GEMINI.md — archivos de memoria raíz",
      "Leído por cualquier CLI que soporte la ruta estándar",
      "Ideal para: servidores, herramientas compartidas, contexto global del proyecto",
    ],
    tip: "Si tienes dudas, ponlo en la raíz. Más CLIs reconocen archivos a nivel raíz que directorios específicos.",
  },
  targeted: {
    label: "Específica por target (directorio por CLI)",
    items: [
      ".claude/settings.json — modelo y permisos de Claude Code",
      "opencode.json — config del proyecto OpenCode (raíz)",
      ".cursor/settings.json — preferencias del IDE Cursor",
      ".gemini/settings.json — modelo, herramientas y MCP de Gemini CLI",
      ".junie/config.json — config de modelo y permisos de Junie",
    ],
    tip: "Usa archivos específicos cuando un CLI tenga opciones únicas que el config global no pueda expresar. El gestor de config escanea todos automáticamente.",
  },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function ConfigGuidePage() {
  const { lang, t } = useI18n();
  const sections = lang === "en" ? SECTIONS_EN : SECTIONS_ES;
  const practices = lang === "en" ? PRACTICES_EN : PRACTICES_ES;
  const rvts = lang === "en" ? ROOT_VS_TARGETED_EN : ROOT_VS_TARGETED_ES;

  const title = lang === "en" ? "Configuration Guide" : "Guía de configuración";
  const intro = lang === "en"
    ? "Practical examples and best practices for agent configuration files — settings, MCP servers, and per-CLI overrides."
    : "Ejemplos prácticos y mejores prácticas para archivos de configuración de agentes: settings, servidores MCP y sobrescrituras por CLI.";
  const sectionsTitle = lang === "en" ? "Configuration file examples" : "Ejemplos de archivos de configuración";
  const whenLabel = lang === "en" ? "When to use" : "Cuándo usarlo";
  const practicesTitle = lang === "en" ? "Best practices" : "Buenas prácticas";

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>{title}</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/config" style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <BookOpen size={14} /> {t("nav.config")}
          </Link>
          <Link href="/" style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <ArrowLeft size={14} /> {t("nav.back")}
          </Link>
        </div>
      </div>
      <p style={{ color: "var(--text-muted)", marginBottom: 32, fontSize: "0.95rem", lineHeight: 1.6 }}>{intro}</p>

      {/* Root vs target-specific */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: 16 }}>{rvts.title}</h2>
        <div className="grid2" style={{ gap: 14 }}>
          {[rvts.global, rvts.targeted].map((col, i) => (
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

      {/* Section examples */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: 16 }}>{sectionsTitle}</h2>
        <div style={{ display: "grid", gap: 16 }}>
          {sections.map((sec) => (
            <div key={sec.slug} className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{sec.label}</h3>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: sec.tagColor, background: `color-mix(in srgb, ${sec.tagColor} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${sec.tagColor} 30%, transparent)`, borderRadius: 4, padding: "2px 8px" }}>{sec.tag}</span>
              </div>

              <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: 14, lineHeight: 1.55 }}>
                <strong>{whenLabel}:</strong> {sec.when}
              </p>

              <pre style={codeStyle}>{sec.example}</pre>

              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 10, fontFamily: "monospace" }}>
                {sec.path}
              </p>
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
    </div>
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
