import { requireAuth } from "@/utils/auth";
import { defineTerm, isGroqConfigured } from "@/lib/glossary-generator";

/** POST /api/glossary/define — generate a definition for a term via Groq.
 *  Body: { term }. Returns { definition, category, links }. Not persisted. */
export async function POST(request) {
  const { error } = await requireAuth();
  if (error) return error;

  if (!isGroqConfigured()) {
    return Response.json(
      { error: "Generación no configurada (define GROQ_API_KEY)." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const term = (body?.term || "").trim();
  if (!term) return Response.json({ error: "term es obligatorio" }, { status: 400 });

  try {
    const result = await defineTerm(term);
    return Response.json(result);
  } catch (err) {
    console.error("glossary define failed:", err);
    return Response.json({ error: "No se pudo generar la definición.", message: String(err.message || err) }, { status: 502 });
  }
}
