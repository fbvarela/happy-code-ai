import { requireAuth } from "@/utils/auth";
import sql from "@/utils/db";
import { artifactInput, snapshotVersion } from "@/lib/artifacts";

/** GET /api/artifacts/:id — full artifact (owner only). */
export async function GET(_request, { params }) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const rows = await sql`SELECT * FROM artifacts WHERE id = ${id} AND user_id = ${session.userId}`;
    if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(rows[0]);
  } catch (err) {
    console.error("GET /api/artifacts/:id failed:", err);
    return Response.json({ error: "Could not load artifact" }, { status: 502 });
  }
}

/** PUT /api/artifacts/:id — update, bump version, snapshot. */
export async function PUT(request, { params }) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  const parsed = artifactInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }
  const a = parsed.data;

  try {
    const rows = await sql`
      UPDATE artifacts SET
        name          = ${a.name},
        type          = ${a.type},
        target        = ${a.target},
        frontmatter   = ${JSON.stringify(a.frontmatter)}::jsonb,
        body_template = ${a.body_template},
        variables     = ${JSON.stringify(a.variables)}::jsonb,
        files         = ${JSON.stringify(a.files)}::jsonb,
        tags          = ${a.tags},
        github_repo   = ${a.github_repo || null},
        version       = version + 1,
        updated_at    = now()
      WHERE id = ${id} AND user_id = ${session.userId}
      RETURNING *`;

    if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });
    await snapshotVersion(rows[0]);
    return Response.json(rows[0]);
  } catch (err) {
    console.error("PUT /api/artifacts/:id failed:", err);
    return Response.json(
      { error: "Could not save artifact", message: String(err.message || err) },
      { status: 502 },
    );
  }
}

/** DELETE /api/artifacts/:id — remove (cascades versions). */
export async function DELETE(_request, { params }) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const rows = await sql`
      DELETE FROM artifacts WHERE id = ${id} AND user_id = ${session.userId} RETURNING id`;
    if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ deleted: rows[0].id });
  } catch (err) {
    console.error("DELETE /api/artifacts/:id failed:", err);
    return Response.json({ error: "Could not delete artifact" }, { status: 502 });
  }
}
