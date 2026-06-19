"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const LANGS = ["es", "en"];
export const DEFAULT_LANG = "es";
const STORAGE_KEY = "lang";

// Read the persisted/desired language safely on the client.
export function readLang() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && LANGS.includes(v)) return v;
  } catch {}
  return DEFAULT_LANG;
}

// Pre-paint script (mirrors the theme no-flash script): set <html lang> from
// storage before React hydrates so the first paint matches.
export const langScript = `(function(){try{var l=localStorage.getItem('${STORAGE_KEY}');if(l==='es'||l==='en'){document.documentElement.lang=l;}}catch(e){}})();`;

const LangContext = createContext({ lang: DEFAULT_LANG, setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);

  // Adopt the persisted choice after mount (server renders DEFAULT_LANG).
  useEffect(() => {
    setLangState(readLang());
  }, []);

  const setLang = useCallback((next) => {
    if (!LANGS.includes(next)) return;
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    try {
      document.documentElement.lang = next;
    } catch {}
  }, []);

  const t = useCallback(
    (key, vars) => {
      const table = MESSAGES[lang] || MESSAGES[DEFAULT_LANG];
      let s = table[key];
      if (s === undefined) s = MESSAGES[DEFAULT_LANG][key];
      if (s === undefined) s = key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
      return s;
    },
    [lang],
  );

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useI18n() {
  return useContext(LangContext);
}

/** Pick a localized field from a data object: `field` (es) or `field_en` (en),
 *  falling back to the base field when no translation exists. */
export function pickLang(obj, field, lang) {
  if (!obj) return "";
  if (lang === "en" && obj[`${field}_en`] != null) return obj[`${field}_en`];
  return obj[field];
}

// ── UI string dictionary ───────────────────────────────────────────────────
const MESSAGES = {
  es: {
    "app.tagline": "Agent Artifact Manager",
    "nav.suggestions": "Sugerencias",
    "nav.glossary": "Glosario",
    "nav.new": "Nuevo",
    "nav.back": "Volver",
    "common.loading": "Cargando…",
    "common.save": "Guardar",
    "common.saving": "Guardando…",
    "common.cancel": "Cancelar",
    "common.edit": "Editar",
    "common.delete": "Borrar",
    "common.clone": "Clonar",
    "common.sure": "¿Seguro?",
    "common.yes": "Sí",
    "common.no": "No",
    "common.add": "Añadir",
    "common.logout": "Salir",
    "common.allCategories": "Todas las categorías",
    "theme.toLight": "Cambiar a tema claro",
    "theme.toDark": "Cambiar a tema oscuro",
    "lang.switchTo": "Cambiar a inglés",

    "library.searchPlaceholder": "Buscar por nombre o tag…",
    "library.allTypes": "Todos los tipos",
    "library.empty": "No hay artefactos todavía. Crea el primero con + Nuevo.",
    "library.confirmDelete": "Sí, borrar",

    "suggestions.title": "Sugerencias para programadores",
    "suggestions.intro": "Artefactos listos para usar en tareas de programación. Elige uno, ajústalo y guárdalo.",
    "suggestions.searchPlaceholder": "Buscar sugerencia…",
    "suggestions.empty": "No hay sugerencias para ese filtro.",
    "suggestions.use": "Usar plantilla",

    "glossary.title": "Glosario de IA",
    "glossary.intro": "Términos de IA y agentes de programación, con enlaces a las herramientas más usadas. Añade los tuyos: si dejas la definición vacía, la genera Groq.",
    "glossary.searchPlaceholder": "Buscar término…",
    "glossary.addTerm": "Añadir término",
    "glossary.empty": "No hay términos para ese filtro.",
    "glossary.yours": "tuyo",
    "glossary.termPlaceholder": "Término (p. ej. Prompt caching)",
    "glossary.generateDef": "Generar definición",
    "glossary.generating": "Generando…",
    "glossary.defPlaceholder": "Definición (o genérala con Groq; si la dejas vacía se generará al guardar)",
    "glossary.links": "Enlaces",
    "glossary.linkLabel": "etiqueta",
    "glossary.saveChanges": "Guardar cambios",
    "glossary.errWriteTermFirst": "Escribe el término primero.",
    "glossary.errTermRequired": "El término es obligatorio.",
    "glossary.errGenerate": "No se pudo generar.",
    "glossary.errSave": "No se pudo guardar.",
    "glossary.viewExtended": "Ver explicación extendida",

    "detail.back": "Volver al glosario",
    "detail.extended": "Explicación extendida",
    "detail.regenerate": "Regenerar",
    "detail.generatingExplanation": "Generando explicación…",
    "detail.noExplanation": "Sin explicación extendida.",
    "detail.notFound": "Ese término no existe o no es tuyo.",
    "detail.writeYourself": "Puedes escribirla con «Editar».",
    "detail.explanationPlaceholder": "Escribe la explicación (o pulsa Regenerar para una nueva con IA)…",
    "detail.errGenerate": "No se pudo generar la explicación.",
    "detail.errSave": "No se pudo guardar.",

    "page.newArtifact": "Nuevo artefacto",
    "offline.title": "Sin conexión",
    "offline.body": "No hay conexión a internet. Vuelve a intentarlo cuando recuperes la red.",
    "login.continueGithub": "Continuar con GitHub",
    "login.scopeNote": "Pedimos el permiso repo para poder publicar artefactos en tus repositorios.",
    "login.err.oauth_state": "La sesión de login expiró o no coincide. Inténtalo de nuevo.",
    "login.err.oauth_failed": "No se pudo completar el login con GitHub. Inténtalo de nuevo.",
    "login.err.server_misconfigured": "El servidor no está configurado (falta SESSION_SECRET). Revisa las variables de entorno.",
    "login.err.generic": "Error de autenticación.",

    "editor.aiGenerate": "Generar con IA",
    "editor.aiPromptPlaceholder": "p. ej. un subagente que escribe tests JUnit5 + Mockito siguiendo mis convenciones",
    "editor.useLocalModel": "Usar modelo local (Ollama / LM Studio) — 0 tokens",
    "editor.generateDraft": "Generar borrador",
    "editor.generating": "Generando…",
    "editor.aiHint": "Rellena el formulario; revísalo y guárdalo. O rellena los campos a mano (0 tokens).",
    "editor.aiHintLocal": "El modelo local requiere CORS (OLLAMA_ORIGINS) habilitado.",
    "editor.name": "Nombre",
    "editor.type": "Tipo",
    "editor.target": "Target (CLI)",
    "editor.howToUse": "¿Cómo se usa un {type}?",
    "editor.hideHelp": "Ocultar ayuda",
    "editor.fileIn": "Archivo en {target}:",
    "editor.format": "Formato:",
    "editor.useTemplate": "Usar plantilla base de {type}",
    "editor.tags": "Tags (separados por coma)",
    "editor.tagsPlaceholder": "java, tests",
    "editor.frontmatter": "Frontmatter (JSON)",
    "editor.body": "Cuerpo (plantilla Handlebars — usa {{variable}})",
    "editor.variables": "Variables",
    "editor.noVariables": "Sin variables. Añade las que uses en el cuerpo.",
    "editor.varName": "nombre",
    "editor.varDefault": "valor por defecto",
    "editor.extraFiles": "Archivos adicionales",
    "editor.extraFilesHint": "Se commitean junto al principal (rutas relativas a la carpeta del artefacto). Comparten las mismas variables.",
    "editor.filePathPlaceholder": "ruta, p. ej. scripts/run.sh",
    "editor.fileBodyPlaceholder": "contenido (plantilla Handlebars)",
    "editor.create": "Crear",
    "editor.preview": "Vista previa (0 tokens)",
    "editor.empty": "(vacío)",
    "editor.downloadZip": "Descargar .zip",
    "editor.downloadFile": "Descargar archivo",
    "editor.zipWithPath": ".zip (con ruta)",
    "editor.renderedNote": "Renderizado con los valores actuales (0 tokens).",
    "editor.errName": "El nombre es obligatorio.",
    "editor.errNameDownload": "Pon un nombre antes de descargar.",
    "editor.errFrontmatter": "El frontmatter no es JSON válido.",
    "editor.errSave": "Error al guardar (revisa los campos).",
    "editor.errGenerate": "No se pudo generar.",
    "editor.publishGithub": "Publicar en GitHub",
    "editor.loadRepos": "Cargar mis repos",
    "editor.branchPlaceholder": "rama (vacío = por defecto)",
    "editor.pathPlaceholder": "ruta (vacío = la del renderer)",
    "editor.publish": "Publicar",
    "editor.testBranch": "Probar en rama",
    "editor.openPr": "Abrir PR al probar",

    "nav.guide": "Guía de prompts",

    "guide.title": "Cómo escribir prompts como un dev de Claude",
    "guide.intro": "12 principios que los ingenieros de Anthropic aplican para obtener resultados más fiables, baratos y seguros.",
    "guide.checklist.title": "Checklist de calidad",
    "guide.checklist.hint": "Revísalo antes de guardar. Los ítems con ✓/✗ se comprueban automáticamente.",
    "guide.checklist.viewFull": "Ver guía completa →",
    "guide.checklist.autoNote": "auto",
    "guide.links.title": "Documentación oficial",

    "prompt.check.role": "Rol definido en la primera frase",
    "prompt.check.instructions": "Instrucciones antes del contenido (manual)",
    "prompt.check.xml": "Tags XML para separar secciones",
    "prompt.check.negative": "Al menos una instrucción negativa («no hagas…»)",
    "prompt.check.one_job": "El prompt hace UN solo trabajo (manual)",
    "prompt.check.example": "Al menos un ejemplo de formato concreto",
    "prompt.check.fallback": "El caso «no sé» está manejado explícitamente",
    "prompt.check.specificity": "Sin calificadores vagos (manual)",
    "prompt.check.variables": "Contenido variable en {{variables}}, no hardcodeado",
    "prompt.check.tested": "Probado con al menos una entrada real (manual)",
  },
  en: {
    "app.tagline": "Agent Artifact Manager",
    "nav.suggestions": "Suggestions",
    "nav.glossary": "Glossary",
    "nav.new": "New",
    "nav.back": "Back",
    "common.loading": "Loading…",
    "common.save": "Save",
    "common.saving": "Saving…",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.clone": "Clone",
    "common.sure": "Sure?",
    "common.yes": "Yes",
    "common.no": "No",
    "common.add": "Add",
    "common.logout": "Log out",
    "common.allCategories": "All categories",
    "theme.toLight": "Switch to light theme",
    "theme.toDark": "Switch to dark theme",
    "lang.switchTo": "Switch to Spanish",

    "library.searchPlaceholder": "Search by name or tag…",
    "library.allTypes": "All types",
    "library.empty": "No artifacts yet. Create the first one with + New.",
    "library.confirmDelete": "Yes, delete",

    "suggestions.title": "Suggestions for developers",
    "suggestions.intro": "Ready-to-use artifacts for coding tasks. Pick one, tweak it, and save.",
    "suggestions.searchPlaceholder": "Search suggestions…",
    "suggestions.empty": "No suggestions for that filter.",
    "suggestions.use": "Use template",

    "glossary.title": "AI Glossary",
    "glossary.intro": "AI and coding-agent terms, with links to the most-used tools. Add your own: leave the definition empty and Groq generates it.",
    "glossary.searchPlaceholder": "Search term…",
    "glossary.addTerm": "Add term",
    "glossary.empty": "No terms for that filter.",
    "glossary.yours": "yours",
    "glossary.termPlaceholder": "Term (e.g. Prompt caching)",
    "glossary.generateDef": "Generate definition",
    "glossary.generating": "Generating…",
    "glossary.defPlaceholder": "Definition (or generate it with Groq; if left empty it's generated on save)",
    "glossary.links": "Links",
    "glossary.linkLabel": "label",
    "glossary.saveChanges": "Save changes",
    "glossary.errWriteTermFirst": "Type the term first.",
    "glossary.errTermRequired": "The term is required.",
    "glossary.errGenerate": "Could not generate.",
    "glossary.errSave": "Could not save.",
    "glossary.viewExtended": "View extended explanation",

    "detail.back": "Back to glossary",
    "detail.extended": "Extended explanation",
    "detail.regenerate": "Regenerate",
    "detail.generatingExplanation": "Generating explanation…",
    "detail.noExplanation": "No extended explanation.",
    "detail.notFound": "That term doesn't exist or isn't yours.",
    "detail.writeYourself": 'You can write it with "Edit".',
    "detail.explanationPlaceholder": "Write the explanation (or click Regenerate for a new AI one)…",
    "detail.errGenerate": "Could not generate the explanation.",
    "detail.errSave": "Could not save.",

    "page.newArtifact": "New artifact",
    "offline.title": "Offline",
    "offline.body": "No internet connection. Try again once you're back online.",
    "login.continueGithub": "Continue with GitHub",
    "login.scopeNote": "We request the repo scope so we can publish artifacts to your repositories.",
    "login.err.oauth_state": "The login session expired or didn't match. Please try again.",
    "login.err.oauth_failed": "Couldn't complete GitHub login. Please try again.",
    "login.err.server_misconfigured": "The server isn't configured (SESSION_SECRET missing). Check the environment variables.",
    "login.err.generic": "Authentication error.",

    "editor.aiGenerate": "Generate with AI",
    "editor.aiPromptPlaceholder": "e.g. a subagent that writes JUnit5 + Mockito tests following my conventions",
    "editor.useLocalModel": "Use a local model (Ollama / LM Studio) — 0 tokens",
    "editor.generateDraft": "Generate draft",
    "editor.generating": "Generating…",
    "editor.aiHint": "Fill in the form; review it and save. Or fill the fields by hand (0 tokens).",
    "editor.aiHintLocal": "The local model needs CORS (OLLAMA_ORIGINS) enabled.",
    "editor.name": "Name",
    "editor.type": "Type",
    "editor.target": "Target (CLI)",
    "editor.howToUse": "How do you use a {type}?",
    "editor.hideHelp": "Hide help",
    "editor.fileIn": "File in {target}:",
    "editor.format": "Format:",
    "editor.useTemplate": "Use base template for {type}",
    "editor.tags": "Tags (comma-separated)",
    "editor.tagsPlaceholder": "java, tests",
    "editor.frontmatter": "Frontmatter (JSON)",
    "editor.body": "Body (Handlebars template — use {{variable}})",
    "editor.variables": "Variables",
    "editor.noVariables": "No variables. Add the ones you use in the body.",
    "editor.varName": "name",
    "editor.varDefault": "default value",
    "editor.extraFiles": "Extra files",
    "editor.extraFilesHint": "Committed alongside the main file (paths relative to the artifact folder). They share the same variables.",
    "editor.filePathPlaceholder": "path, e.g. scripts/run.sh",
    "editor.fileBodyPlaceholder": "content (Handlebars template)",
    "editor.create": "Create",
    "editor.preview": "Preview (0 tokens)",
    "editor.empty": "(empty)",
    "editor.downloadZip": "Download .zip",
    "editor.downloadFile": "Download file",
    "editor.zipWithPath": ".zip (with path)",
    "editor.renderedNote": "Rendered with the current values (0 tokens).",
    "editor.errName": "Name is required.",
    "editor.errNameDownload": "Set a name before downloading.",
    "editor.errFrontmatter": "Frontmatter is not valid JSON.",
    "editor.errSave": "Error saving (check the fields).",
    "editor.errGenerate": "Could not generate.",
    "editor.publishGithub": "Publish to GitHub",
    "editor.loadRepos": "Load my repos",
    "editor.branchPlaceholder": "branch (empty = default)",
    "editor.pathPlaceholder": "path (empty = renderer's)",
    "editor.publish": "Publish",
    "editor.testBranch": "Test on a branch",
    "editor.openPr": "Open PR when testing",

    "nav.guide": "Prompt guide",

    "guide.title": "How to Write Prompts Like a Claude Developer",
    "guide.intro": "12 principles Anthropic engineers apply to get more reliable, cheaper and safer results.",
    "guide.checklist.title": "Quality checklist",
    "guide.checklist.hint": "Review before saving. Items with ✓/✗ are checked automatically.",
    "guide.checklist.viewFull": "View full guide →",
    "guide.checklist.autoNote": "auto",
    "guide.links.title": "Official documentation",

    "prompt.check.role": "Role defined in the first sentence",
    "prompt.check.instructions": "Instructions before content (manual)",
    "prompt.check.xml": "XML tags to separate sections",
    "prompt.check.negative": 'At least one negative instruction ("do not…")',
    "prompt.check.one_job": "Prompt does ONE job (manual)",
    "prompt.check.example": "At least one concrete format example",
    "prompt.check.fallback": `The "I don’t know" case is handled explicitly`,
    "prompt.check.specificity": "No vague qualifiers (manual)",
    "prompt.check.variables": "Variable content in {{variables}}, not hardcoded",
    "prompt.check.tested": "Tested with at least one real input (manual)",
  },
};

/** Translated artifact type labels (used in the library + editor selects). */
export const TYPE_LABELS_I18N = {
  es: { agent: "Agente", subagent: "Subagente", skill: "Skill", command: "Slash command", config_snippet: "Config", memory: "Memoria", mcp: "MCP" },
  en: { agent: "Agent", subagent: "Subagent", skill: "Skill", command: "Slash command", config_snippet: "Config", memory: "Memory", mcp: "MCP" },
};
