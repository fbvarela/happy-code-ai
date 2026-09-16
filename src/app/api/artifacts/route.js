import { requireAuth } from "@/utils/auth";
import sql from "@/utils/db";
import { artifactInput, snapshotVersion } from "@/lib/artifacts";

/** GET /api/artifacts — list (optionally filtered) for the current user. */
export async function GET(request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const type = searchParams.get("type");
  const target = searchParams.get("target");

  const rows = await sql`
    SELECT id, name, type, target, tags, version, updated_at
    FROM artifacts
    WHERE user_id = ${session.userId}
    ORDER BY updated_at DESC`;

  const filtered = rows.filter((a) => {
    if (type && a.type !== type) return false;
    if (target && a.target !== target) return false;
    if (q) {
      const hay = `${a.name} ${(a.tags || []).join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return Response.json(filtered);
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

  const rows = await sql`
    INSERT INTO artifacts (user_id, name, type, target, frontmatter, body_template, variables, files, tags, github_repo)
    VALUES (${session.userId}, ${a.name}, ${a.type}, ${a.target},
            ${JSON.stringify(a.frontmatter)}::jsonb, ${a.body_template},
            ${JSON.stringify(a.variables)}::jsonb, ${JSON.stringify(a.files)}::jsonb, ${a.tags},
            ${a.github_repo || null})
    RETURNING *`;

  await snapshotVersion(rows[0]);
  return Response.json(rows[0], { status: 201 });
}
