import { requireAuth } from "@/utils/auth";
import sql from "@/utils/db";

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
