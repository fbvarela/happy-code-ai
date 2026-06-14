import { requireAuth } from "@/utils/auth";
import sql from "@/utils/db";
import { entryInput, ensureDefinition } from "@/lib/glossary-entry";

/** PUT /api/glossary/:id — update one of the caller's own entries. */
export async function PUT(request, { params }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const parsed = entryInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Payload inválido", details: parsed.error.flatten() }, { status: 400 });
  }
  const e = parsed.data;

  try {
    await ensureDefinition(e);
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
  const rows = await sql`
    DELETE FROM glossary_entries
    WHERE id = ${id} AND user_id = ${session.userId}
    RETURNING id`;

  if (!rows.length) return Response.json({ error: "No encontrado" }, { status: 404 });
  return Response.json({ ok: true, id: rows[0].id });
}
