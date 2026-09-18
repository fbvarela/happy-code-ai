import { requireAuth } from "@/utils/auth";
import { defineTerm, isAgnesConfigured } from "@/lib/glossary-generator";

/** POST /api/glossary/define — generate a definition for a term via Agnes.
 *  Body: { term, lang?, glossaryDefinePromptEs?, glossaryDefinePromptEn? }.
 *  Returns { definition, category, links }. Not persisted. */
export async function POST(request) {
  const { error } = await requireAuth();
  if (error) return error;

  if (!isAgnesConfigured()) {
    return Response.json(
      { error: "Generación no configurada (define AGNES_API_KEY)." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const term = (body?.term || "").trim();
  const lang = body?.lang === "en" ? "en" : "es";
  if (!term) return Response.json({ error: "term es obligatorio" }, { status: 400 });

  // Custom system prompt from Prompt Settings, for the requested language.
  const customPrompt =
    (lang === "en" ? body?.glossaryDefinePromptEn : body?.glossaryDefinePromptEs) || null;

  try {
    const result = await defineTerm(term, lang, typeof customPrompt === "string" && customPrompt.trim() ? customPrompt : undefined);
    return Response.json(result);
  } catch (err) {
    console.error("glossary define failed:", err);
    return Response.json({ error: "No se pudo generar la definición.", message: String(err.message || err) }, { status: 502 });
  }
}
