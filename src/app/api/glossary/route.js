import { requireAuth } from "@/utils/auth";
import sql from "@/utils/db";
import { entryInput, ensureDefinition } from "@/lib/glossary-entry";

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

  const raw = await request.json().catch(() => null);
  const parsed = entryInput.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: "Payload inválido", details: parsed.error.flatten() }, { status: 400 });
  }
  const e = parsed.data;
  const lang = raw?.lang === "en" ? "en" : "es";

  try {
    await ensureDefinition(e, lang);
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 502 });
  }

  const rows = await sql`
    INSERT INTO glossary_entries (user_id, term, category, definition, aliases, links)
    VALUES (${session.userId}, ${e.term}, ${e.category}, ${e.definition},
            ${e.aliases}, ${JSON.stringify(e.links)}::jsonb)
    RETURNING id, term, category, definition, aliases, links, created_at`;

  return Response.json(rows[0], { status: 201 });
}
