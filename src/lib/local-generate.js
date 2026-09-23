// Client-side artifact generation against a local model (Ollama / LM Studio)
// via their OpenAI-compatible /chat/completions endpoint. Runs in the browser,
// talking to the user's own machine — zero API tokens.
//
// Requires CORS to be allowed on the local server, e.g. Ollama started with
//   OLLAMA_ORIGINS="https://<this-app-origin>" ollama serve
// (see the spec's "Modo local desde el cliente" note).

import { ARTIFACT_TYPES, TYPE_LABELS } from "@/lib/artifact-types";
import { mergeSystemPrompt } from "@/lib/prompt-merge";

export const LOCAL_DEFAULTS = {
  baseUrl: "http://localhost:11434/v1", // Ollama; LM Studio: http://localhost:1234/v1
  model: "qwen2.5-coder",
};

function instructions(target) {
  // Pull any custom prompt from localStorage. It is APPENDED after the base
  // rules below (never replaces them) — same policy as /api/generate.
  let customPrompt = null;
  try {
    const stored = localStorage.getItem("happyCodePromptSettings");
    if (stored) {
      const parsed = JSON.parse(stored);
      customPrompt = parsed.artifactSystemPrompt || null;
    }
  } catch (err) {
    console.warn("Failed to load prompt settings from localStorage:", err);
  }

  return mergeSystemPrompt([
    `You generate configuration artifacts for the "${target}" AI coding CLI.`,
    `Types: ${ARTIFACT_TYPES.map((t) => `${t} (${TYPE_LABELS[t]})`).join(", ")}.`,
    `Reply with ONLY a JSON object, no prose, matching exactly:`,
    `{"name": string (kebab-case), "type": one of ${JSON.stringify(ARTIFACT_TYPES)},`,
    ` "target": string, "frontmatter": object of string values,`,
    ` "body_template": string (Handlebars; reusable values go in {{var}} holes),`,
    ` "variables": array of {"name": string, "label"?: string, "default"?: string, "required"?: boolean},`,
    ` "tags": array of string}.`,
    `Produce the smallest useful artifact. Every {{var}} used in body_template`,
    `MUST be declared in variables with a sensible default.`,
    `For "openspec" type the body MUST be an OpenSpec document: a`,
    `"# {{feature}} Specification" title, a "## Purpose" paragraph, a`,
    `"## Requirements" section with 3+ "### Requirement:" blocks, each stating`,
    `one "The system SHALL …" obligation, each followed by a "#### Scenario:"`,
    `block with - GIVEN / - WHEN / - THEN bullet lines.`,
  ].join("\n"), customPrompt);
}

function coerceDraft(obj, { type, target }) {
  const draft = {
    name: String(obj.name || ""),
    type: ARTIFACT_TYPES.includes(obj.type) ? obj.type : type || "agent",
    target: obj.target || target || "opencode",
    frontmatter: obj.frontmatter && typeof obj.frontmatter === "object" ? obj.frontmatter : {},
    body_template: String(obj.body_template || ""),
    variables: Array.isArray(obj.variables) ? obj.variables : [],
    tags: Array.isArray(obj.tags) ? obj.tags : [],
  };
  if (type) draft.type = type;
  draft.target = target || draft.target;
  return draft;
}

/** Generate an artifact draft from a local model. Throws on connection/parse
 *  errors (the caller surfaces a CORS/setup hint). */
export async function generateArtifactLocal({ prompt, type, target = "opencode", baseUrl, model, githubRepo }) {
  const url = `${(baseUrl || LOCAL_DEFAULTS.baseUrl).replace(/\/$/, "")}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model || LOCAL_DEFAULTS.model,
      messages: [
        { role: "system", content: instructions(target) },
        {
          role: "user",
          content:
            (type ? `Create a ${type} artifact.\n` : "") +
            (githubRepo
              ? `The artifact is for the GitHub repository \`${githubRepo}\`; ` +
                `keep it consistent with that project (do not invent its file paths).\n`
              : "") +
            `Description: ${prompt}`,
        },
      ],
      response_format: { type: "json_object" },
      stream: false,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    throw new Error(`Local model HTTP ${res.status}. ¿Está encendido y con CORS (OLLAMA_ORIGINS) permitido?`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Respuesta vacía del modelo local.");

  let obj;
  try {
    obj = JSON.parse(text);
  } catch {
    // Some models wrap JSON in code fences; salvage the first {...} block.
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("El modelo local no devolvió JSON válido.");
    obj = JSON.parse(m[0]);
  }
  return coerceDraft(obj, { type, target });
}
