import { requireAuth } from "@/utils/auth";
import sql from "@/utils/db";
import { artifactInput, snapshotVersion } from "@/lib/artifacts";

const MAX_LIMIT = 100;

/** GET /api/artifacts — filtered + paginated list for the current user.
 *  Filtering happens in SQL (the whole table is no longer shipped to the client).
 *  Query params: q (substring of name/tags), type, target, page (1-based), limit (<= 100).
 *  Returns { items, total, page, limit, hasMore }. */
export async function GET(request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const type = searchParams.get("type") || null;
  const target = searchParams.get("target") || null;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get("limit") || "50", 10) || 50));
  const offset = (page - 1) * limit;

  // Escape LIKE wildcards so a user query like "50%" matches literally.
  const like = q ? `%${q.replace(/[\\%_]/g, "\\$&")}%` : null;

  try {
    // count(*) OVER () returns the total across all pages in the same
    // roundtrip; null only when the page is empty.
    const rows = await sql`
      SELECT id, name, type, target, tags, version, updated_at,
             (count(*) OVER ())::int AS total_count
      FROM artifacts
      WHERE user_id = ${session.userId}
        AND (${type}::text IS NULL OR type = ${type})
        AND (${target}::text IS NULL OR target = ${target})
        AND (
          ${like}::text IS NULL
          OR name ILIKE ${like}
          OR EXISTS (SELECT 1 FROM unnest(tags) tg WHERE tg ILIKE ${like})
        )
      ORDER BY updated_at DESC
      LIMIT ${limit}::int OFFSET ${offset}::int`;

    const total = rows.length ? rows[0].total_count : 0;
    const items = rows.map(({ total_count, ...a }) => a);
    return Response.json({ items, total, page, limit, hasMore: offset + items.length < total });
  } catch (err) {
    console.error("GET /api/artifacts failed:", err);
    return Response.json({ error: "Could not load artifacts" }, { status: 502 });
  }
}

/** POST /api/artifacts — create. */
export async function POST(request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const parsed = artifactInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }
  const a = parsed.data;

  try {
    const rows = await sql`
      INSERT INTO artifacts (user_id, name, type, target, frontmatter, body_template, variables, files, tags, github_repo)
      VALUES (${session.userId}, ${a.name}, ${a.type}, ${a.target},
              ${JSON.stringify(a.frontmatter)}::jsonb, ${a.body_template},
              ${JSON.stringify(a.variables)}::jsonb, ${JSON.stringify(a.files)}::jsonb, ${a.tags},
              ${a.github_repo || null})
      RETURNING *`;

    await snapshotVersion(rows[0]);
    return Response.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("POST /api/artifacts failed:", err);
    return Response.json(
      { error: "Could not save artifact", message: String(err.message || err) },
      { status: 502 },
    );
  }
}
