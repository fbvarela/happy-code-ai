import { z } from "zod";
import { requireAuth } from "@/utils/auth";
import sql from "@/utils/db";
import { GLOSSARY_CATEGORY_IDS } from "@/lib/glossary";
import { defineTerm, isGroqConfigured } from "@/lib/glossary-generator";

const entryInput = z.object({
  term: z.string().trim().min(1, "El término es obligatorio").max(120),
  category: z.enum(GLOSSARY_CATEGORY_IDS).default("concept"),
  definition: z.string().default(""),
  aliases: z.array(z.string().trim()).default([]),
  links: z.array(z.object({ label: z.string().trim(), url: z.string().url() })).max(5).default([]),
});

/** GET /api/glossary — the current user's manually-added entries. */
export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const rows = await sql`
    SELECT id, term, category, definition, aliases, links, created_at
    FROM glossary_entries
    WHERE user_id = ${session.userId}
    ORDER BY term ASC`;

  return Response.json(rows);
}

/** POST /api/glossary — add an entry. If `definition` is blank, backfill it
 *  with Groq before inserting so the cached definition is never empty. */
export async function POST(request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const parsed = entryInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Payload inválido", details: parsed.error.flatten() }, { status: 400 });
  }
  const e = parsed.data;

  if (!e.definition.trim()) {
    if (!isGroqConfigured()) {
      return Response.json({ error: "Falta la definición y Groq no está configurado." }, { status: 400 });
    }
    try {
      const gen = await defineTerm(e.term);
      e.definition = gen.definition;
      if (!e.links.length) e.links = gen.links || [];
      if (e.category === "concept" && gen.category) e.category = gen.category;
    } catch (err) {
      console.error("glossary define (on save) failed:", err);
      return Response.json({ error: "No se pudo generar la definición.", message: String(err.message || err) }, { status: 502 });
    }
  }

  const rows = await sql`
    INSERT INTO glossary_entries (user_id, term, category, definition, aliases, links)
    VALUES (${session.userId}, ${e.term}, ${e.category}, ${e.definition},
            ${e.aliases}, ${JSON.stringify(e.links)}::jsonb)
    RETURNING id, term, category, definition, aliases, links, created_at`;

  return Response.json(rows[0], { status: 201 });
}
