import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import { ARTIFACT_TYPES, TYPE_LABELS } from "@/lib/artifact-types";
import { isAgnesConfigured, getAgnesModel } from "@/lib/agnes";
import { autoQuality, PROMPT_LIKE_TYPES } from "@/lib/quality";

// How to fix each failed auto check, phrased for the model in the retry turn.
const CHECK_FIXES = {
  role: "the body does not open with a role — make the FIRST sentence a role definition ('You are …')",
  xml: "no XML tags — wrap each distinct section (instructions, context, output format) in <tag>…</tag>",
  negative: "no negative instruction — add at least one explicit 'do not …' guard against a common failure mode",
  example: "no concrete example — include a small fenced ``` example for any non-trivial output format",
  fallback:
    "the unknown case is unhandled — add an explicit instruction for insufficient context ('do not guess; say you don't know')",
  variables: "no {{variable}} holes — move user-tweakable values into {{variable}} holes declared in \"variables\"",
};

/** Pick the cloud generator provider by available key:
 *  Anthropic (best) first, then Agnes 2.0 (fast + cheap) as fallback. */
function selectProvider() {
  if (process.env.ANTHROPIC_API_KEY) {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return {
      name: "anthropic",
      model: anthropic(process.env.GENERATOR_MODEL || "claude-opus-4-8"),
      cache: true, // prompt-cache the system prefix
    };
  }
  if (isAgnesConfigured()) {
    return {
      name: "agnes",
      model: getAgnesModel(),
      cache: false,
    };
  }
  return null;
}

// Frontmatter values may be scalars or lists (e.g. OpenCode agents take a
// "tools: [read, write]" array). The renderers' yamlValue() handles both.
const frontmatterValue = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.union([z.string(), z.number(), z.boolean()])),
]);

// Variable label/default may come back as scalars or lists — coerce to string
// so Handlebars rendering keeps working.
const varValue = z
  .union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number(), z.boolean()]))])
  .transform((v) => (Array.isArray(v) ? v.join(", ") : String(v)));

// Schema the model must fill. Kept tight so the response stays short (token-cheap).
// Agnes is loose with field shapes, so everything it can omit or mistype is
// optional/loose here and normalized in fillDefaults / transforms.
const genSchema = z.object({
  name: z.string().describe("short kebab-case slug for the artifact").default(""),
  type: z.enum(ARTIFACT_TYPES).optional(),
  target: z.string().default("opencode"),
  frontmatter: z.record(frontmatterValue).default({}),
  body_template: z
    .string()
    .describe("Handlebars template; put reusable values in {{variableName}} holes"),
  variables: z
    .array(
      z.object({
        name: z.string(),
        label: varValue.optional().default(""),
        default: varValue.optional().default(""),
        required: z.boolean().optional().default(false),
      }),
    )
    .default([]),
  tags: z.array(z.string()).default([]),
});

export function isConfigured() {
  return !!(process.env.ANTHROPIC_API_KEY || isAgnesConfigured());
}

function systemPrompt(target) {
  // Stable prefix — eligible for prompt caching, so repeat generations are cheap.
  return [
    `You generate configuration artifacts for the "${target}" AI coding CLI.`,
    `Artifact types: ${ARTIFACT_TYPES.map((t) => `${t} (${TYPE_LABELS[t]})`).join(", ")}.`,
    `Rules:`,
    `- Produce the SMALLEST useful artifact. Do not pad.`,
    `- The body MUST be a Handlebars template. Anything the user will tweak per-use`,
    `  (descriptions, tool lists, keys, paths, framework names) goes in a {{variable}}`,
    `  hole, and every hole MUST be declared in "variables" with a sensible default.`,
    `- For "mcp" type, body is JSON for a server entry. For "memory" type, body is`,
    `  markdown. For "agent"/"subagent"/"skill", body is markdown instructions and`,
    `  "frontmatter" carries metadata (model, tools, description).`,
    `Quality gate — every generated body is machine-checked against a checklist.`,
    `For markdown-instruction bodies ("agent", "subagent", "skill", "command") it MUST:`,
    `- open with a role definition in the first sentence ("You are …"),`,
    `- use XML tags to separate sections (e.g. <instructions>, <output_format>),`,
    `- include at least one explicit negative instruction ("do not …"),`,
    `- include a concrete fenced example for any non-trivial output format,`,
    `- explicitly handle the insufficient-context case ("do not guess; say you don't know"),`,
    `- put variable content in {{variable}} holes, never hardcoded.`,
    `- Respond ONLY with the structured object.`,
  ].join("\n");
}

/** Generate an artifact draft from a natural-language description.
 *  Prompt-like bodies must pass the auto quality checks; if the first draft
 *  fails, one corrective retry is attempted and the better draft is kept.
 *  Returns the draft object (NOT persisted) plus a quality report. */
export async function generateArtifact({ prompt, type, target = "opencode" }) {
  const provider = selectProvider();
  if (!provider) throw new Error("No generator provider configured");

  const systemMessage = { role: "system", content: systemPrompt(target) };
  // Prompt caching is Anthropic-only; skip it for Agnes.
  if (provider.cache) {
    systemMessage.providerOptions = { anthropic: { cacheControl: { type: "ephemeral" } } };
  }

  const userMessage = {
    role: "user",
    content:
      (type ? `Create a ${type} artifact for ${target}.\n` : "") + `Description: ${prompt}`,
  };

  async function genOnce(extraMessages = []) {
    return generateObject({
      model: provider.model,
      schema: genSchema,
      messages: [systemMessage, userMessage, ...extraMessages],
      // Safety net: the model sometimes wraps the JSON in markdown fences or
      // prose. Extract the outermost {...} block locally — deterministic and
      // cheaper than asking the model to repair its own output.
      experimental_repairText: async ({ text }) => {
        const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        const raw = fenced ? fenced[1] : text;
        const start = raw.indexOf("{");
        const end = raw.lastIndexOf("}");
        const extracted = start >= 0 && end > start ? raw.slice(start, end + 1) : text;
        if (extracted !== text) console.warn("generate: extracted JSON from fenced/prose response");
        return extracted;
      },
    });
  }

  function qualityOf(draft) {
    if (!PROMPT_LIKE_TYPES.includes(draft.type)) return null;
    return autoQuality(draft.body_template);
  }

  // Fill in what the model may have omitted: type (pinned > inferred > default)
  // and a kebab-case name derived from the prompt.
  function fillDefaults(object) {
    if (!object.type) {
      object.type =
        type ||
        (/\bspec\b|openspec/i.test(prompt)
          ? "openspec"
          : /\bconfig\b|settings\.json/i.test(prompt)
            ? "config_snippet"
            : "skill");
    }
    if (!object.name.trim()) {
      object.name =
        prompt
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .split("-")
          .slice(0, 4)
          .join("-") || "generated-artifact";
    }
    object.target = target;
  }

  const first = await genOnce();
  fillDefaults(first.object);

  let best = first;
  let quality = qualityOf(best.object);
  let attempts = 1;

  if (quality && quality.failed.length > 0) {
    attempts = 2;
    try {
      const retry = await genOnce([
        { role: "assistant", content: JSON.stringify(best.object) },
        {
          role: "user",
          content:
            `Your draft failed these machine-checked quality rules:\n` +
            quality.failed.map((k) => `- ${CHECK_FIXES[k]}`).join("\n") +
            `\nRegenerate the FULL artifact fixing every point above. Keep everything` +
            ` else (type, variables, overall structure) intact.`,
        },
      ]);
      if (type) retry.object.type = type;
      fillDefaults(retry.object);

      const retryQuality = qualityOf(retry.object);
      // Keep whichever draft scores better on the auto checks.
      if (!retryQuality || retryQuality.failed.length < quality.failed.length) {
        best = retry;
        quality = retryQuality;
      }
      // Aggregate token usage across both attempts.
      best.usage = {
        promptTokens:
          (first.usage?.promptTokens || 0) + (retry.usage?.promptTokens || 0),
        completionTokens:
          (first.usage?.completionTokens || 0) + (retry.usage?.completionTokens || 0),
        totalTokens: (first.usage?.totalTokens || 0) + (retry.usage?.totalTokens || 0),
      };
    } catch (err) {
      // Retry failed (rate limit, schema error, …) — keep the first draft.
      console.warn("generate quality retry failed:", err);
    }
  }

  const report = quality
    ? { applicable: true, score: `${quality.passed}/${quality.total}`, failed: quality.failed, attempts }
    : { applicable: false, score: null, failed: [], attempts };

  const { object: draft, usage } = best;
  return { draft, usage, provider: provider.name, quality: report };
}
