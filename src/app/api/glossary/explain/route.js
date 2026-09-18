import { requireAuth } from "@/utils/auth";
import { explainTerm, isAgnesConfigured } from "@/lib/glossary-generator";

/** POST /api/glossary/explain — extended Agnes explanation for a term.
 *  Body: { term, definition?, lang?, glossaryExplainPromptEs?, glossaryExplainPromptEn? }.
 *  Returns { explanation }. Not persisted. */
export async function POST(request) {
  const { error } = await requireAuth();
  if (error) return error;

  if (!isAgnesConfigured()) {
    return Response.json({ error: "Generación no configurada (define AGNES_API_KEY)." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const term = (body?.term || "").trim();
  const definition = (body?.definition || "").trim();
  const lang = body?.lang === "en" ? "en" : "es";
  if (!term) return Response.json({ error: "term es obligatorio" }, { status: 400 });

  // Custom system prompt from Prompt Settings, for the requested language.
  const customPrompt =
    (lang === "en" ? body?.glossaryExplainPromptEn : body?.glossaryExplainPromptEs) || null;

  try {
    const explanation = await explainTerm(
      term, definition, lang,
      typeof customPrompt === "string" && customPrompt.trim() ? customPrompt : undefined,
    );
    return Response.json({ explanation });
  } catch (err) {
    console.error("glossary explain failed:", err);
    return Response.json({ error: "No se pudo generar la explicación.", message: String(err.message || err) }, { status: 502 });
  }
}
