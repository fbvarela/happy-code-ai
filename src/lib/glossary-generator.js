import { createGroq } from "@ai-sdk/groq";
import { generateObject, generateText } from "ai";
import { z } from "zod";

import { GLOSSARY_CATEGORY_IDS } from "@/lib/glossary";

// Tight schema → short, cheap, structured output validated before use.
const defSchema = z.object({
  definition: z.string().describe("Definición clara de 2-3 frases, en español, sin relleno."),
  category: z.enum(GLOSSARY_CATEGORY_IDS).default("concept"),
  links: z
    .array(z.object({ label: z.string(), url: z.string().url() }))
    .max(3)
    .default([]),
});

export function isGroqConfigured() {
  return !!process.env.GROQ_API_KEY;
}

/** Generate a glossary definition for `term` using Groq (fast + cheap).
 *  Returns { definition, category, links }. Throws if no key / on failure. */
export async function defineTerm(term) {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY no configurado");

  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
  const { object } = await generateObject({
    model: groq(process.env.GROQ_MODEL || "llama-3.3-70b-versatile"),
    schema: defSchema,
    messages: [
      {
        role: "system",
        content:
          "Escribes entradas de glosario sobre términos de IA y de agentes de programación. " +
          "Sé preciso y neutral, en español. Si no estás seguro de que el término exista, dilo en la definición. " +
          "Incluye solo enlaces oficiales o autoritativos (o ninguno).",
      },
      { role: "user", content: `Define el término: ${term}` },
    ],
  });
  return object;
}

/** Generate an extended, developer-grade explanation of a term using Groq.
 *  Returns plain text with paragraphs (and optional "- " bullets). The short
 *  `definition` is passed as context so the explanation expands beyond it. */
export async function explainTerm(term, definition = "") {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY no configurado");

  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
  const { text } = await generateText({
    model: groq(process.env.GROQ_MODEL || "llama-3.3-70b-versatile"),
    messages: [
      {
        role: "system",
        content:
          "Explicas conceptos de IA, machine learning y agentes de programación a desarrolladores de software. " +
          "Escribe en español, con rigor técnico pero claro. Devuelve 3-5 párrafos cortos; usa intuición, un ejemplo o " +
          "analogía concreta, y menciona cómo se usa o por qué importa en la práctica. Si encaja, incluye una breve lista " +
          "con viñetas '- '. No uses encabezados Markdown ni repitas literalmente la definición breve. Solo el texto.",
      },
      {
        role: "user",
        content: `Término: ${term}\n${definition ? `Definición breve: ${definition}\n` : ""}\nEscribe la explicación extendida.`,
      },
    ],
  });
  return text.trim();
}
