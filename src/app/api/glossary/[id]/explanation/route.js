import { requireAuth } from "@/utils/auth";
import sql from "@/utils/db";
import { GLOSSARY_SEED } from "@/lib/glossary";

const SEED_IDS = new Set(GLOSSARY_SEED.map((e) => e.id));
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A valid term key is a known seed slug or a uuid (a user entry). Anything else
// is junk and gets a 404 rather than creating an orphan row.
function isValidKey(id) {
  return SEED_IDS.has(id) || UUID_RE.test(id);
}

/** GET /api/glossary/:id/explanation — the caller's saved extended explanation
 *  for this term, or { explanation: null } if none has been saved yet. */
export async function GET(_request, { params }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  if (!isValidKey(id)) return Response.json({ error: "No encontrado" }, { status: 404 });

  const rows = await sql`
    SELECT explanation, updated_at FROM glossary_explanations
    WHERE user_id = ${session.userId} AND term_key = ${id}`;

  return Response.json(rows.length ? rows[0] : { explanation: null });
}

/** PUT /api/glossary/:id/explanation — save (upsert) the caller's explanation. */
export async function PUT(request, { params }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  if (!isValidKey(id)) return Response.json({ error: "No encontrado" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const explanation = typeof body?.explanation === "string" ? body.explanation : null;
  if (explanation === null) return Response.json({ error: "explanation es obligatorio" }, { status: 400 });

  const rows = await sql`
    INSERT INTO glossary_explanations (user_id, term_key, explanation, updated_at)
    VALUES (${session.userId}, ${id}, ${explanation}, now())
    ON CONFLICT (user_id, term_key)
    DO UPDATE SET explanation = EXCLUDED.explanation, updated_at = now()
    RETURNING explanation, updated_at`;

  return Response.json(rows[0]);
}
