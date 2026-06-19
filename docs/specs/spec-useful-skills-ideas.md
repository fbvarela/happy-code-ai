# Spec — Useful Claude Code Skills: Ideas, Patterns & Examples

> Status: Draft · Created: 2026-06-19

## Context

Claude Code (and compatible CLIs like OpenCode) support **skills** — Markdown files the agent
loads on demand when their description matches the current task. A skill is not a command the
user types; it is a reusable procedure the agent applies automatically.

This spec collects concrete skill ideas organised by developer workflow area, explains what
makes a skill effective, and provides full example templates. The goal is to give happy-code-ai
users a curated reference they can turn into artifacts in-app.

Related: `spec-agent-artifact-manager.md` (artifact taxonomy), `GUIA-ARTEFACTOS.md` (usage guide).

## Goals

- Identify the highest-value skill categories for software developers.
- Explain what makes a skill well-designed (description, trigger precision, body structure).
- Provide at least one complete, copy-pasteable example per category.
- Give enough material for the Suggestions gallery to grow beyond its current 11 entries.

## Non-goals

- Implementation of new gallery entries (that is a follow-up task).
- Skills for non-developer use cases (content writing, design, etc.).
- Agent or slash-command templates (covered by existing suggestions).

## What makes a skill effective

A skill has three levers:

| Lever | Guidance |
|---|---|
| **Description** | One sentence that describes *when* to load it. Be specific about the trigger condition, not the content. "Use before committing" beats "commit helper". |
| **Body** | A numbered procedure or checklist the agent follows step by step. Short sections > one long blob. |
| **Variables** | Only for values that genuinely change per invocation. Hardcode everything else. |

Skills are loaded *lazily* — the more precise the description, the less context-window cost.

---

## Proposed design: skill catalog by area

### 1. Code quality

#### 1a. Pre-commit checklist
```
description: Run this skill before every git commit to catch common mistakes.
```
```markdown
# Pre-commit checklist

Before committing, verify all of the following:

1. **Tests pass** — run `{{test_cmd}}` and confirm green.
2. **No debug artifacts** — grep for `console.log`, `debugger`, `TODO REMOVE`, `FIXME`.
3. **No secrets** — scan staged files for API keys, tokens, passwords.
4. **Lint clean** — run `{{lint_cmd}}`.
5. **Commit message** — follows Conventional Commits (`type(scope): summary ≤ 72 chars`).

If any check fails, fix it before committing. Report which checks passed and which failed.
```
Variables: `test_cmd`, `lint_cmd`.

#### 1b. Dead-code detector
```
description: Identify unused exports, unreachable code paths and stale feature flags in the touched files.
```
```markdown
# Dead-code detector

For each file in the current changeset:

1. List all exported symbols not imported anywhere in the codebase.
2. Identify `if (false)` / constant-condition branches.
3. Flag feature flags whose rollout is 0% or 100% (hardcoded).
4. Report each finding as: `file:line — reason — suggested action`.

Do not delete anything; only report.
```

---

### 2. Testing

#### 2a. Test-gap analyser
```
description: After writing or editing code, identify which branches and edge cases lack test coverage.
```
```markdown
# Test-gap analyser

Given the changed functions/methods:

1. List every distinct execution path (happy path + each branch).
2. Cross-reference with existing tests in `{{test_dir}}`.
3. For each untested path, write a one-line description of the missing test.
4. Prioritize: error paths and security boundaries first.

Output a checklist the developer can turn into actual test cases.
```
Variable: `test_dir` (default: `tests/` or `__tests__/`).

#### 2b. Mutation-test advisor
```
description: After unit tests are written, suggest mutations that would detect weak assertions.
```
```markdown
# Mutation-test advisor

For the provided test suite:

1. Identify assertions that would still pass if the sign (`>`, `<`, `===`) were flipped.
2. Identify return values that could be swapped with `null` / `undefined` without failing tests.
3. Suggest strengthening each weak assertion with a concrete rewrite.

Focus on the top 5 highest-risk mutations; do not exhaustively list every possibility.
```

---

### 3. Documentation

#### 3a. Changelog entry writer
```
description: After a feature is complete, draft the CHANGELOG entry for this version.
```
```markdown
# Changelog entry

From the git log since `{{since_tag}}` and the staged diff, draft a CHANGELOG entry
in Keep a Changelog format (https://keepachangelog.com).

Sections to populate if relevant: Added, Changed, Deprecated, Removed, Fixed, Security.
- One bullet per user-visible change.
- Omit internal refactors unless they affect the API.
- Link to PRs or issues where available.

Return only the new version section block, ready to paste into CHANGELOG.md.
```
Variable: `since_tag` (default: latest git tag).

#### 3b. ADR writer (Architecture Decision Record)
```
description: When a significant architectural decision is made, capture it as an ADR.
```
```markdown
# Architecture Decision Record

Write an ADR for the decision just made. Use this structure:

## Title
ADR-{{number}}: <short imperative title>

## Status
Proposed

## Context
What situation or constraint forced this decision?

## Decision
What was decided, in one or two sentences.

## Consequences
- Positive: what becomes easier or better.
- Negative: what becomes harder, what debt is taken on.
- Neutral: what changes but is neither better nor worse.

Save to `docs/adr/ADR-{{number}}-<slug>.md`.
```
Variables: `number`.

---

### 4. Security

#### 4a. Dependency audit
```
description: When new npm/pip/cargo packages are added, evaluate their security posture.
```
```markdown
# Dependency audit

For each newly added dependency:

1. Check the package's last publish date and release cadence (stale = risk).
2. Note the number of maintainers (single-maintainer = bus-factor risk).
3. Check if it has known CVEs (search `{{registry_url}}/advisories`).
4. Verify the import is scoped (no `import *` from untrusted packages).
5. Flag any package that requests unusual OS permissions (native bindings, network on install).

Summarize as: package name | risk level (low/medium/high) | reason | recommendation.
```
Variable: `registry_url` (default: `https://www.npmjs.com`).

#### 4b. Input-boundary validator
```
description: When adding a new API route or form handler, check that all inputs are validated at the boundary.
```
```markdown
# Input-boundary validator

For each new or changed request handler:

1. List every field taken from `req.body`, `req.params`, `req.query`, or form data.
2. Confirm each field is validated (type, length, range, allowlist) before use.
3. Confirm each field is sanitized before being passed to a query, template, or subprocess.
4. Flag any field that flows into SQL, shell, HTML, or file paths without validation.

Report: field name | source | validated? | sanitized? | risk.
```

---

### 5. Performance

#### 5a. N+1 detector
```
description: When reviewing database-touching code, identify N+1 query patterns.
```
```markdown
# N+1 query detector

Scan the changed code for N+1 patterns:

1. Find any loop that executes a DB query on each iteration.
2. Find ORM calls inside `.map()`, `.forEach()`, or array comprehensions.
3. For each hit: show the file:line, explain the N+1, and suggest the batch/eager-load fix.

If the codebase uses {{orm}}, prefer its built-in eager loading (`include`, `joinedload`, etc.).
```
Variable: `orm` (default: `the project's ORM`).

#### 5b. Bundle-size watchdog
```
description: After adding a new import, estimate its impact on the JS bundle.
```
```markdown
# Bundle-size watchdog

For each new `import` added in the diff:

1. Check if the package has a tree-shakeable ESM build.
2. Estimate the min+gzip size using bundlephobia data (package@version).
3. If > 10 kB, suggest a lighter alternative or dynamic import (`import()`).
4. If the import is used only in a single route, suggest lazy loading.

Report: package | estimated size | tree-shakeable | recommendation.
```

---

### 6. Git / workflow

#### 6a. Branch hygiene
```
description: Before opening a PR, verify the branch is clean and ready for review.
```
```markdown
# Branch hygiene

Before opening a PR from this branch:

1. Confirm the branch is up to date with `{{base}}` (no diverged commits).
2. Check for merge commits in the branch history (prefer rebase).
3. Confirm there are no `.env`, credential, or build-output files staged.
4. Verify the number of commits is reasonable (squash if > {{max_commits}} for a small change).
5. Run the test suite one final time.

Report pass/fail for each check.
```
Variables: `base` (default: `main`), `max_commits` (default: `5`).

#### 6b. Rollback plan writer
```
description: Before deploying a breaking change, document the rollback procedure.
```
```markdown
# Rollback plan

For the change about to be deployed, write a rollback runbook:

1. **Detection** — what metric or alert signals the deploy went wrong.
2. **Decision threshold** — at what point to roll back (error rate, latency, …).
3. **Rollback steps** — ordered commands/actions to revert, including DB migrations if any.
4. **Verification** — how to confirm the rollback succeeded.
5. **Owner** — who is on call and how to reach them.

Keep it short enough to execute under pressure.
```

---

### 7. AI-agent specific

#### 7a. Prompt hygiene reviewer
```
description: When editing a system prompt or agent body, review it for common prompt-quality issues.
```
```markdown
# Prompt hygiene reviewer

Review the provided prompt for:

1. **Contradiction** — instructions that conflict with each other.
2. **Ambiguity** — verbs like "handle", "deal with", "manage" without a concrete definition.
3. **Missing failure mode** — what the agent should do when input is unexpected or missing.
4. **Scope creep** — the prompt asks the agent to do more than one clearly defined job.
5. **Token waste** — repeated or verbose phrasing that could be tightened.

Return a diff-style rewrite with inline comments explaining each change.
```

#### 7b. Tool-schema validator
```
description: When defining a new MCP tool or function-calling schema, validate it before use.
```
```markdown
# Tool-schema validator

For the provided JSON tool schema:

1. Verify every parameter has a `description` (models use these for routing).
2. Verify required fields are listed in the `required` array.
3. Confirm no parameter name shadows a reserved word in the target runtime.
4. Check that enum values are exhaustive and lowercase.
5. Confirm the tool `description` states *when* to call it, not just *what* it does.

Report each issue with a suggested fix.
```

---

## Alternatives considered

**Ship these as slash commands instead of skills.** Slash commands require the user to remember
to invoke them. Skills load automatically when relevant, which is the stronger ergonomic. For
procedural checklists (pre-commit, branch hygiene) the auto-loading model is clearly better.

**One mega-skill with all checks.** Rejected: a large skill wastes context tokens on every load.
Small, focused skills are cheaper and easier to maintain.

## Risks & open questions

- Some skills reference external URLs (bundlephobia, npm advisories) — the agent may not have
  network access in all environments. Skills should gracefully note when a lookup isn't possible.
- The mutation-test advisor and N+1 detector require reading the full codebase, which may exceed
  context for large repos. A scope variable (file or directory) mitigates this.
- Skills that produce file writes (ADR writer, rollback plan) should prompt the user to confirm
  before writing.

## Rollout plan

These ideas feed the Suggestions gallery. Prioritize by frequency of developer pain:
1. Pre-commit checklist, test-gap analyser, branch hygiene (high-frequency, clear ROI).
2. Security skills (dependency audit, input-boundary validator) — high value, less frequent.
3. AI-agent skills (prompt hygiene, tool-schema validator) — niche but on-brand for this app.

Each skill becomes a new entry in `SUGGESTIONS` in `src/lib/suggestions.js`, following the
existing `artifact` / `artifact_en` pattern.

## Success metrics

- At least 5 of these skills are added to the gallery and used (prefill → save) by a user.
- Average skill body length stays under 400 tokens (cheap to load).
- Zero user reports of a skill loading when it shouldn't (false-positive triggers).
