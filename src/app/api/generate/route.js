import { requireAuth } from "@/utils/auth";
import { generateArtifact, isConfigured } from "@/lib/generator";
import { ARTIFACT_TYPES } from "@/lib/artifact-types";

/** POST /api/generate — natural language -> structured artifact draft (not saved). */
export async function POST(request) {
  const { error } = await requireAuth();
  if (error) return error;

  if (!isConfigured()) {
    return Response.json(
      { error: "Generator not configured (set ANTHROPIC_API_KEY or AGNES_API_KEY)." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const prompt = (body?.prompt || "").trim();
  if (!prompt) return Response.json({ error: "prompt is required" }, { status: 400 });

  const type = ARTIFACT_TYPES.includes(body?.type) ? body.type : undefined;
  const target = (body?.target || "opencode").trim();

  try {
    const { draft, usage, provider, quality } = await generateArtifact({ prompt, type, target });
    return Response.json({ draft, usage, provider, quality });
  } catch (err) {
    console.error("generate failed:", err.message);
    if (err.text) console.error("generate raw text:", JSON.stringify(err.text).slice(0, 2000));
    if (err.cause) console.error("generate cause:", err.cause);
    return Response.json({ error: "Generation failed", message: String(err.message || err) }, { status: 502 });
  }
}
