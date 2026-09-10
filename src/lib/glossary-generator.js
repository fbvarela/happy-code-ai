import { generateObject, generateText } from "ai";
import { z } from "zod";

import { GLOSSARY_CATEGORY_IDS } from "@/lib/glossary";
import { isAgnesConfigured, getAgnesModel } from "@/lib/agnes";

// Tight schema → short, cheap, structured output validated before use.
const defSchema = z.object({
  definition: z.string().describe("Definición clara de 2-3 frases, en español, sin relleno."),
  category: z.enum(GLOSSARY_CATEGORY_IDS).default("concept"),
  links: z
    .array(z.object({ label: z.string(), url: z.string().url() }))
    .max(3)
    .default([]),
});

export { isAgnesConfigured };

/** Generate a glossary definition for `term` using Agnes 2.0 (fast + cheap).
 *  `lang` ('es' | 'en') controls the output language.
 *  `systemPromptOverride` allows customizing the system prompt.
 *  Returns { definition, category, links }. Throws if no key / on failure. */
export async function defineTerm(term, lang = "es", systemPromptOverride) {
  const model = getAgnesModel();
  if (!model) throw new Error("AGNES_API_KEY no configurado");

  const system = systemPromptOverride ||
    (lang === "en"
      ? "You write glossary entries about AI and coding-agent terms. Be accurate and neutral, in English. " +
        "If you're not sure the term exists, say so in the definition. Include only official/authoritative links (or none)."
      : "Escribes entradas de glosario sobre términos de IA y de agentes de programación. " +
        "Sé preciso y neutral, en español. Si no estás seguro de que el término exista, dilo en la definición. " +
        "Incluye solo enlaces oficiales o autoritativos (o ninguno).");

  const { object } = await generateObject({
    model,
    schema: defSchema,
    messages: [
      { role: "system", content: system },
      { role: "user", content: lang === "en" ? `Define the term: ${term}` : `Define el término: ${term}` },
    ],
  });
  return object;
}

/** Generate an extended, developer-grade explanation of a term using Agnes 2.0.
 *  `lang` ('es' | 'en') controls the output language. Returns plain text with
 *  paragraphs (and optional "- " bullets). The short `definition` is context. */
export async function explainTerm(term, definition = "", lang = "es", systemPromptOverride) {
  const model = getAgnesModel();
  if (!model) throw new Error("AGNES_API_KEY no configurado");

  const system = systemPromptOverride ||
    (lang === "en"
      ? "You explain AI, machine-learning and coding-agent concepts to software developers. Write in English, " +
        "technically rigorous but clear. Return 3-5 short paragraphs; use intuition, a concrete example or analogy, " +
        "and mention how it's used or why it matters in practice. If it fits, include a short '- ' bullet list. " +
        "No Markdown headings, don't repeat the short definition verbatim. Text only."
      : "Explicas conceptos de IA, machine learning y agentes de programación a desarrolladores de software. " +
        "Escribe en español, con rigor técnico pero claro. Devuelve 3-5 párrafos cortos; usa intuición, un ejemplo o " +
        "analogía concreta, y menciona cómo se usa o por qué importa en la práctica. Si encaja, incluye una breve lista " +
        "con viñetas '- '. No uses encabezados Markdown ni repitas literalmente la definición breve. Solo el texto.");

  const user =
    lang === "en"
      ? `Term: ${term}\n${definition ? `Short definition: ${definition}\n` : ""}\nWrite the extended explanation.`
      : `Término: ${term}\n${definition ? `Definición breve: ${definition}\n` : ""}\nEscribe la explicación extendida.`;

  const { text } = await generateText({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return text.trim();
}
