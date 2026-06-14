// Shared validation + definition-backfill for glossary entry writes (POST/PUT).
import { z } from "zod";
import { GLOSSARY_CATEGORY_IDS } from "@/lib/glossary";
import { defineTerm, isGroqConfigured } from "@/lib/glossary-generator";

export const entryInput = z.object({
  term: z.string().trim().min(1, "El término es obligatorio").max(120),
  category: z.enum(GLOSSARY_CATEGORY_IDS).default("concept"),
  definition: z.string().default(""),
  aliases: z.array(z.string().trim()).default([]),
  links: z.array(z.object({ label: z.string().trim(), url: z.string().url() })).max(5).default([]),
});

/** Ensure the entry has a definition; if blank, generate one with Groq.
 *  Throws an Error with a `.status` (400/502) on failure. Mutates + returns e. */
export async function ensureDefinition(e) {
  if (e.definition.trim()) return e;
  if (!isGroqConfigured()) {
    const err = new Error("Falta la definición y Groq no está configurado.");
    err.status = 400;
    throw err;
  }
  try {
    const gen = await defineTerm(e.term);
    e.definition = gen.definition;
    if (!e.links.length) e.links = gen.links || [];
    if (e.category === "concept" && gen.category) e.category = gen.category;
  } catch (err) {
    console.error("glossary definition backfill failed:", err);
    const wrapped = new Error("No se pudo generar la definición.");
    wrapped.status = 502;
    throw wrapped;
  }
  return e;
}
