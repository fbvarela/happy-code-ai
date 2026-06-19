# Spec — Token Budget Awareness per Target Agent

> Status: Draft · Created: 2026-06-19

## Context

Different AI coding agents have very different context-window limits. An agent definition that comfortably fits inside Claude Code's 200 K-token window might silently overflow Codex's much smaller budget, or eat 30 % of GitHub Copilot's effective workspace. Today the app gives users no feedback on this — they write a 4 KB agent body and have no idea whether the target CLI will be able to hold it.

The fix is to show, live as the user types, how many tokens the artifact body occupies and how that compares to the context window of each target agent — specifically Anthropic (Claude Code), Codex (OpenAI CLI), and GitHub Copilot.

## Goals

- Show a live token count for the artifact body (and optionally frontmatter) as the user edits.
- Display that count against the context-window limit of the selected target agent.
- Warn when the artifact is approaching or exceeding the agent's safe limit.
- Provide at least one actionable suggestion for trimming tokens when over budget.

## Non-goals

- Full context simulation (user prompt + conversation history + system prompt overhead) — too speculative.
- USD cost display (separate concern; may be a follow-up spec).
- Token tracking for the Generate AI flow (that's the generate route's `usage`, different concern).
- Support for every possible model variant — cover the three named agents with their primary/default model.

## Proposed design

### 1. Agent context-window table

New file `src/lib/agent-limits.js`:

```js
// Context-window limits for target agents (tokens).
// "safe" = recommended max for an artifact to leave headroom for the live session.
export const AGENT_LIMITS = {
  opencode:  { label: "OpenCode",        window: 200_000, safe: 40_000 },
  claude:    { label: "Claude Code",     window: 200_000, safe: 40_000 },
  cursor:    { label: "Cursor",          window: 128_000, safe: 24_000 },
  gemini:    { label: "Gemini CLI",      window: 1_000_000, safe: 100_000 },
  copilot:   { label: "GitHub Copilot", window:  64_000, safe: 12_000 },
  codex:     { label: "Codex CLI",       window:   8_000, safe:  2_000 },
};
```

Notes:
- **Codex CLI** (the original `openai/codex` repo, now archived) used `code-davinci-002` with an 8 K token limit. Most users on "codex" today likely mean Codex-as-concept, not the deprecated CLI — so surface a clear deprecation note in the UI (consistent with how the agent-comparison table already marks it deprecated).
- **GitHub Copilot** context is shared between the editor file context, diff, and the inline chat; 64 K is the practical ceiling for a `.github/copilot-instructions.md` or agent-mode system prompt.
- **Claude Code / OpenCode** share the same underlying Claude models (200 K); the safe cap is set conservatively to leave room for the coding session.

### 2. Client-side token estimator

Token counting without shipping a full tokenizer (tiktoken/claude-tokenizer adds ~200 KB to the bundle). Use character-based heuristics — accurate enough for a budget gauge:

```js
// src/lib/token-estimate.js
export function estimateTokens(text) {
  if (!text) return 0;
  // ~4 chars/token for English prose; code is denser (~3.5), comments looser (~4.5).
  // Split difference at 3.8 for mixed artifact bodies.
  return Math.ceil(text.length / 3.8);
}
```

For higher precision (opt-in, Anthropic-only): call `POST /api/token-count` with the artifact body, which proxies `anthropic.messages.countTokens()` server-side. This is a lightweight endpoint — no model run, no generation cost. Use it on blur (not on every keystroke).

### 3. UI — TokenMeter component

Inline below the artifact body editor in `ArtifactEditor`. Shows:

```
Claude Code  ████████░░░░░░  4 200 / 40 000 tokens  ✓ fits
Codex CLI    ████████████████████  4 200 / 2 000 tokens  ⚠ over budget
```

- Bar is a simple `<progress>`-like div, colored green/amber/red (using `--leaf`, `--sun`, `--clay`).
- Only shows the selected target by default; a "compare all agents" toggle expands the full table.
- Over-budget state shows a one-line tip: "Codex CLI limit is 2 000 tokens. Consider splitting this agent into smaller subagents."

### 4. Token reduction tips (contextual)

When `estimateTokens(body) > AGENT_LIMITS[target].safe`, display one of:

| Condition | Tip |
|---|---|
| Long frontmatter | "Move static metadata to a separate memory artifact" |
| Many tool declarations | "Split into a focused agent + subagents per domain" |
| Large example blocks | "Put examples in a linked skill instead of inline" |
| Body > 2× safe limit | "Consider targeting a higher-context agent (Claude Code, Gemini)" |

### 5. API route (optional, Phase 2)

`POST /api/token-count` — accepts `{ text, model? }`, returns `{ tokens: number }`. Wraps `anthropic.messages.countTokens()` from the Anthropic SDK. Requires `ANTHROPIC_API_KEY`. Gracefully falls back to the character-heuristic if key is absent.

### 6. Data model / schema changes

None. Token estimates are ephemeral UI state — no persistence needed.

## Alternatives considered

**Ship tiktoken (the OpenAI tokenizer) as a client-side WASM bundle.** Rejected: adds ~250 KB to the bundle, overkill for a gauge whose purpose is directional, not exact.

**Show only the selected target, never a multi-agent comparison.** Too limiting — the point is to help users choose the right target or realize their artifact is too large. The comparison table (collapsed by default) adds little cost and significant value.

## Risks & open questions

- Codex CLI is deprecated and most "codex" users probably mean the concept, not the CLI. The `AGENT_LIMITS` entry is kept for completeness and clearly labeled; the guide agent-comparison already marks it deprecated. May be worth renaming the target key to `codex-legacy` to avoid confusion with newer OpenAI reasoning models.
- GitHub Copilot's effective window for agent-mode instructions is poorly documented — 64 K is a conservative estimate from community testing. Flag with a `// unconfirmed` comment in the source.
- Character-heuristic error can be ±20 % for heavily commented or non-English content. The optional `/api/token-count` route fixes this but requires an Anthropic key.

## Rollout plan

**Phase 1** — one PR: add `src/lib/agent-limits.js`, `src/lib/token-estimate.js`, and the `<TokenMeter>` component. Wire it into `ArtifactEditor` below the body textarea. Show only the selected target. Use character heuristic only.

**Phase 2** — follow-up: add the "compare all agents" expanded view, contextual trim tips, and the `/api/token-count` route for Anthropic-backed precision.

## Success metrics

- `<TokenMeter>` renders on every artifact editor page (no blank states, no crashes on empty body).
- Users see a warning before saving an artifact that exceeds the selected target's safe limit.
- At least one documented case where the meter prompted a user to switch targets or split an agent.
