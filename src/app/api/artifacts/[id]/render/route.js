import { requireAuth } from "@/utils/auth";
import sql from "@/utils/db";
import { renderTemplate } from "@/lib/render";

/** POST /api/artifacts/:id/render — render the body template with `values`.
 *  Zero LLM tokens; this is the preferred reuse path. */
export async function POST(request, { params }) {
  const { session, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const values = body?.values || {};

  const rows = await sql`
    SELECT body_template, frontmatter, variables
    FROM artifacts WHERE id = ${id} AND user_id = ${session.userId}`;
  if (!rows.length) return Response.json({ error: "Not found" }, { status: 404 });

  try {
    const content = renderTemplate(rows[0].body_template, rows[0].variables, values);
    return Response.json({ content, frontmatter: rows[0].frontmatter });
  } catch (err) {
    return Response.json({ error: "Template error", message: String(err.message || err) }, { status: 422 });
  }
}
