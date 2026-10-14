import { requireAuth } from "@/utils/auth";
import { generateArtifact, isConfigured } from "@/lib/generator";
import { octokitForUser } from "@/lib/github";
import { ARTIFACT_TYPES } from "@/lib/artifact-types";

/** Rate-limit errors surface as the AI SDK's RetryError wrapping one or more
 *  provider 429s. Detect them anywhere in the message/chain so the UI gets an
 *  actionable hint instead of the raw gateway text. */
function isRateLimit(err) {
  const parts = [
    err?.message,
    err?.cause?.message,
    ...(Array.isArray(err?.reasons) ? err.reasons.map((e) => e?.message) : []),
  ].filter(Boolean).join(" ");
  return /rate limit|429|too many requests/i.test(parts);
}

/** POST /api/generate — natural language -> structured artifact draft (not saved). */
export async function POST(request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  if (!isConfigured()) {
    return Response.json(
      { error: "Generator not configured (set ANTHROPIC_API_KEY, AGNES_API_KEY or COHERE_API_KEY)." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const prompt = (body?.prompt || "").trim();
  if (!prompt) return Response.json({ error: "prompt is required" }, { status: 400 });

  const type = ARTIFACT_TYPES.includes(body?.type) ? body.type : undefined;
  const target = (body?.target || "opencode").trim();
  const artifactSystemPrompt = body?.artifactSystemPrompt || null;

  try {
    const githubRepo = body?.github_repo || null;
    // Repo context: when a repo is linked, ground generation in its memory
    // docs (AGENTS.md, CLAUDE.md, …). The client can opt out via
    // withRepoContext: false (0 extra GitHub calls).
    const withRepoContext = body?.withRepoContext !== false;
    const repoContextBranch = typeof body?.repo_context_branch === "string" ? body.repo_context_branch.trim() : "";
    let octokit = null;
    if (githubRepo && withRepoContext) {
      try {
        octokit = await octokitForUser(session.userId);
      } catch (err) {
        console.warn("generate: no octokit for repo context:", err.message);
      }
    }
    const { draft, usage, provider, quality, repoContext } = await generateArtifact({
      prompt,
      type,
      target,
      systemPromptOverride: artifactSystemPrompt,
      githubRepo,
      octokit,
      withRepoContext,
      repoContextBranch,
    });
    return Response.json({ draft, usage, provider, quality, repoContext });
  } catch (err) {
    console.error("generate failed:", err.message);
    if (err.text) console.error("generate raw text:", JSON.stringify(err.text).slice(0, 2000));
    if (err.cause) console.error("generate cause:", err.cause);
    if (isRateLimit(err)) {
      return Response.json(
        {
          error: "Rate limit",
          message:
            "The AI provider's key has hit its rate limit (free tier). " +
            "Set a paid ANTHROPIC_API_KEY in the deployment environment, or " +
            "upgrade the Agnes key to a Token Plan, then try again in a few minutes.",
        },
        { status: 429 },
      );
    }
    return Response.json({ error: "Generation failed", message: String(err.message || err) }, { status: 502 });
  }
}
