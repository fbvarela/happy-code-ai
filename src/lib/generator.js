import { createAnthropic } from "@ai-sdk/anthropic";
import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";
import { ARTIFACT_TYPES, TYPE_LABELS } from "@/lib/artifact-types";

/** Pick the cloud generator provider by available key:
 *  Anthropic (best) first, then Groq (fast + cheap) as fallback. */
function selectProvider() {
  if (process.env.ANTHROPIC_API_KEY) {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return {
      name: "anthropic",
      model: anthropic(process.env.GENERATOR_MODEL || "claude-opus-4-8"),
      cache: true, // prompt-cache the system prefix
    };
  }
  if (process.env.GROQ_API_KEY) {
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
    return {
      name: "groq",
      model: groq(process.env.GROQ_MODEL || "llama-3.3-70b-versatile"),
      cache: false,
    };
  }
  return null;
}

// Schema the model must fill. Kept tight so the response stays short (token-cheap).
const genSchema = z.object({
  name: z.string().describe("short kebab-case slug for the artifact"),
  type: z.enum(ARTIFACT_TYPES),
  target: z.string().default("opencode"),
  frontmatter: z.record(z.string()).default({}),
  body_template: z
    .string()
    .describe("Handlebars template; put reusable values in {{variableName}} holes"),
  variables: z
    .array(
      z.object({
        name: z.string(),
        label: z.string().optional().default(""),
        default: z.string().optional().default(""),
        required: z.boolean().optional().default(false),
      }),
    )
    .default([]),
  tags: z.array(z.string()).default([]),
});

export function isConfigured() {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.GROQ_API_KEY);
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
    `- Respond ONLY with the structured object.`,
  ].join("\n");
}

/** Generate an artifact draft from a natural-language description.
 *  Returns the draft object (NOT persisted). */
export async function generateArtifact({ prompt, type, target = "opencode" }) {
  const provider = selectProvider();
  if (!provider) throw new Error("No generator provider configured");

  const systemMessage = { role: "system", content: systemPrompt(target) };
  // Prompt caching is Anthropic-only; skip it for Groq.
  if (provider.cache) {
    systemMessage.providerOptions = { anthropic: { cacheControl: { type: "ephemeral" } } };
  }

  const { object, usage } = await generateObject({
    model: provider.model,
    schema: genSchema,
    messages: [
      systemMessage,
      {
        role: "user",
        content:
          (type ? `Create a ${type} artifact for ${target}.\n` : "") +
          `Description: ${prompt}`,
      },
    ],
  });

  // Honor the requested type if the user pinned one.
  if (type) object.type = type;
  object.target = target;
  return { draft: object, usage, provider: provider.name };
}
