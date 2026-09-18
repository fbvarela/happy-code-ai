import { requireAuth } from "@/utils/auth";
import sql from "@/utils/db";
import { entryInput, ensureDefinition } from "@/lib/glossary-entry";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Custom glossary-define system prompt from Prompt Settings, for `lang`. */
function glossaryPromptOverride(raw, lang) {
  const p = lang === "en" ? raw?.glossaryDefinePromptEn : raw?.glossaryDefinePromptEs;
  return typeof p === "string" && p.trim() ? p : undefined;
}

/** GET /api/glossary/:id — fetch one of the caller's own entries (for the
 *  detail page on direct load / refresh; seed entries are resolved client-side). */
export async function GET(_request, { params }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  // Non-uuid ids (e.g. a seed slug, or junk) are never user entries — 404,
  // not a Postgres uuid-cast 500.
  if (!UUID_RE.test(id)) return Response.json({ error: "No encontrado" }, { status: 404 });
  const rows = await sql`
    SELECT id, term, category, definition, aliases, links, created_at
    FROM glossary_entries
    WHERE id = ${id} AND user_id = ${session.userId}`;

  if (!rows.length) return Response.json({ error: "No encontrado" }, { status: 404 });
  return Response.json(rows[0]);
}

/** PUT /api/glossary/:id — update one of the caller's own entries. */
export async function PUT(request, { params }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  if (!UUID_RE.test(id)) return Response.json({ error: "No encontrado" }, { status: 404 });
  const raw = await request.json().catch(() => null);
  const parsed = entryInput.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: "Payload inválido", details: parsed.error.flatten() }, { status: 400 });
  }
  const e = parsed.data;
  const lang = raw?.lang === "en" ? "en" : "es";

  try {
    await ensureDefinition(e, lang, glossaryPromptOverride(raw, lang));
  } catch (err) {
    return Response.json({ error: err.message }, { status: err.status || 502 });
  }

  const rows = await sql`
    UPDATE glossary_entries
    SET term = ${e.term}, category = ${e.category}, definition = ${e.definition},
        aliases = ${e.aliases}, links = ${JSON.stringify(e.links)}::jsonb
    WHERE id = ${id} AND user_id = ${session.userId}
    RETURNING id, term, category, definition, aliases, links, created_at`;

  if (!rows.length) return Response.json({ error: "No encontrado" }, { status: 404 });
  return Response.json(rows[0]);
}

/** DELETE /api/glossary/:id — remove one of the caller's own entries. */
export async function DELETE(_request, { params }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  if (!UUID_RE.test(id)) return Response.json({ error: "No encontrado" }, { status: 404 });
  const rows = await sql`
    DELETE FROM glossary_entries
    WHERE id = ${id} AND user_id = ${session.userId}
    RETURNING id`;

  if (!rows.length) return Response.json({ error: "No encontrado" }, { status: 404 });
  return Response.json({ ok: true, id: rows[0].id });
}
