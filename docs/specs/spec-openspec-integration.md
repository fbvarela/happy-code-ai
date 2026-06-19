# Spec — OpenSpec Integration

> Status: Draft · Author: fbvarela · Created: 2026-06-19

## Context

[OpenSpec](https://openspec.dev/) is a lightweight spec-driven framework that acts as a
universal planning layer for coding agents. Specs live as Markdown files in
`openspec/specs/` inside the repo and use a structured format — a **Purpose**
block, **Requirements** stated as `The system SHALL…` assertions, and
**Scenarios** in Gherkin (`GIVEN / WHEN / THEN`). When code changes, OpenSpec
generates "spec deltas" so reviewers see intent changes, not just diffs.

The Agent Artifact Manager already lets users create, version, and publish prompt
artifacts (skills, agents, configs) to GitHub. Adding OpenSpec as a first-class
artifact type means the same workflow — write once, publish to the right path,
reuse with variables — now applies to feature specifications. Coding agents that
read `openspec/specs/` get richer context; product teams get living documentation.

Related docs:
- `docs/specs/spec-agent-artifact-manager.md` — core artifact model
- `docs/specs/spec-useful-skills-ideas.md` — suggestion catalogue precedent

## Workflow — spec to final code

The full cycle, from the moment a developer has an idea to the moment a coding
agent ships tested, compliant code:

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. DRAFT                                                           │
│  Open a suggestion template in Happy Code (e.g. "Feature spec")    │
│  Fill variables: feature name, actor, requirements, scenarios       │
│  Preview the rendered OpenSpec Markdown in the editor               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. PUBLISH                                                         │
│  Click "Publish to GitHub" in the editor                           │
│  Renderer writes openspec/specs/<slug>.md to the target repo        │
│  via the GitHub Contents API — no local clone needed               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. BRIEF THE AGENT                                                 │
│  In your terminal / IDE, invoke the coding agent:                  │
│                                                                     │
│  > claude "implement openspec/specs/user-auth.md"                  │
│  > opencode "implement openspec/specs/user-auth.md"                │
│                                                                     │
│  The agent reads the spec, maps each SHALL requirement to code     │
│  tasks, and uses Gherkin scenarios as acceptance criteria           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. AGENT IMPLEMENTS                                                │
│  Agent creates a branch, writes code + tests, opens a PR           │
│  OpenSpec CLI (run locally or in CI) generates a "spec delta":     │
│    → which requirements are now satisfied                          │
│    → which are partial or untouched                                │
│  Reviewers see intent changes, not just line diffs                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. REVIEW & ITERATE                                                │
│  If requirements change: update artifact in Happy Code, re-publish │
│  The spec file updates in the same PR (or a follow-up commit)      │
│  Agent re-runs with updated requirements until all SHALLs pass     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  6. MERGE                                                           │
│  All scenarios green, spec delta shows 100% requirement coverage   │
│  Code + spec land together — documentation never drifts from code  │
└─────────────────────────────────────────────────────────────────────┘
```

### What each participant does

| Step | Developer | Happy Code | Coding agent | Repo |
|---|---|---|---|---|
| Draft | Fills template variables | Renders preview | — | — |
| Publish | Clicks "Publish" | Commits via API | — | `openspec/specs/*.md` created |
| Brief | Types one command | — | Reads spec file | — |
| Implement | Reviews PR | — | Creates branch, writes code + tests | Branch + PR |
| Iterate | Updates artifact | Re-publishes spec | Re-implements delta | Spec updated in PR |
| Merge | Approves | — | — | Code + spec merged together |

### Key insight

The spec file acts as a **shared contract** between the developer and the agent.
The developer writes intent (SHALLs + scenarios); the agent writes implementation.
Because both live in the same repo, they are reviewed and versioned together —
the spec never becomes a stale Google Doc.

## Goals

- Add `openspec` as a valid artifact `type` with a dedicated renderer that
  outputs Markdown to `openspec/specs/<slug>.md` in the target repo.
- Ship at least 5 OpenSpec suggestion templates in the gallery (feature, API
  endpoint, auth flow, data model, background job).
- Add a `/docs/openspec` guide page: what OpenSpec is, when to use it, the
  format anatomy with annotated example, and tips for writing good SHALL
  statements and Gherkin scenarios.
- Export/publish via the existing GitHub commit flow — no new infrastructure.

## Non-goals

- OpenSpec CLI integration (running `openspec diff`, generating "spec deltas"
  automatically) — too much surface area for MVP; users run the CLI separately.
- Parsing or importing existing `openspec/specs/` files from a repo.
- Locking the Gherkin format — the renderer produces the standard skeleton but
  users edit freely; no scenario validator.

## Proposed design

### 1. New artifact type: `openspec`

Add `"openspec"` to `ARTIFACT_TYPES` in `src/lib/artifact-types.js`.

Frontmatter fields for this type (stored in `artifact.frontmatter` jsonb):

```json
{
  "feature": "User Authentication",
  "version": "1.0",
  "status": "draft",
  "agents": ["claude-code", "opencode"],
  "description": "One-line summary of what this spec covers."
}
```

### 2. Renderer: `OpenSpecRenderer`

New strategy in `src/lib/renderers/openspec.js`:

```
render(artifact, values) → {
  path: "openspec/specs/<slug>.md",
  content: <rendered Markdown>
}
```

The rendered Markdown follows the OpenSpec format:

```markdown
# <feature> Specification
<!-- version: <version> | status: <status> | agents: <agents> -->

## Purpose

<description resolved from variables>

## Requirements

### Requirement: <RequirementName>

The system SHALL <body_template with variables resolved>.

#### Scenario: <ScenarioName>

- GIVEN <precondition>
- WHEN <action>
- THEN <outcome>
```

The `body_template` is a Handlebars template. Variables let the user parameterise
requirement names, actors, actions, and outcomes without editing the template
directly.

`slug` for the output path is derived from `artifact.name` (lowercase,
hyphenated), matching OpenSpec's directory convention.

### 3. Suggestion templates (gallery)

Five new entries in `src/lib/suggestions.js` under a new category `openspec`:

| id | Title (EN) | What it covers |
|---|---|---|
| `os-feature` | Feature specification | Full feature with 3 requirements + 2 scenarios each |
| `os-api-endpoint` | REST API endpoint spec | One endpoint: request, response, auth, error scenarios |
| `os-auth-flow` | Authentication flow spec | Magic-link / OAuth flow with success + failure scenarios |
| `os-data-model` | Data model spec | Schema constraints, validation rules, migration scenarios |
| `os-background-job` | Background job spec | Scheduling, retry, idempotency, failure alerting |

Each entry has `artifact` (ES) and `artifact_en` (EN) fields following the
existing bilingual pattern.

### 4. Guide page: `/docs/openspec`

New route `src/app/docs/openspec/page.jsx` (client component, `useI18n()`):

Sections:
1. **What is OpenSpec** — one paragraph + link to openspec.dev
2. **When to use it** — before starting a feature, when briefing a coding agent,
   when reviewing an AI-generated PR
3. **Format anatomy** — annotated example with callouts for each section
4. **Writing good SHALLs** — 4 rules: one verb, measurable outcome, no
   implementation details, testable
5. **Gherkin scenarios** — GIVEN sets state, WHEN is one action, THEN is one
   observable outcome; avoid conjunctions
6. **Publishing to your repo** — shows how publish flow writes to
   `openspec/specs/`, links to GitHub Publish panel in the editor

Add nav button in `ArtifactLibrary.jsx` (alongside Suggestions, Glossary, Prompt
guide) with the `FileCode` Lucide icon.

### 5. Type label

Add `openspec` label to `TYPE_LABELS_I18N` in `src/lib/i18n.js`:
- ES: `"OpenSpec"`
- EN: `"OpenSpec"`

### Failure modes

- If `artifact.frontmatter` is missing `feature`, renderer falls back to
  `artifact.name`.
- If `artifact.name` produces an empty slug, renderer uses `spec` as fallback
  path segment.
- Publish follows existing Contents API path — if the file exists in the repo it
  updates it (using `sha`); no special handling needed.

## Alternatives considered

**Add OpenSpec as a `target` value instead of a new `type`.**
Rejected: `type` controls the renderer and the form UI (which frontmatter fields
to show). Using `target` would require the user to manually set the right path
and format, duplicating effort across every artifact. A dedicated `type` gives a
guided experience.

**Embed OpenSpec templates in the existing `skill`/`agent` types.**
Rejected: The output format and destination path are structurally different.
Mixing them pollutes the type selector and makes filtering by type ambiguous.

## Risks & open questions

- OpenSpec format may evolve; the renderer should be easy to update. Keep the
  template in a plain string constant (not a compiled template), easy to patch.
- `openspec` as a type name is a brand name. If the standard renames itself or
  forks, we rename the type label only (the internal id can stay `openspec`).
- Should the guide page live at `/docs/openspec` or be a section of
  `/docs/prompt-guide`? Separate page keeps routing clean and is easier to link
  from the nav; proceed with that unless it feels isolated after implementation.

## Rollout plan

**Phase 1** — type + renderer + suggestions (one PR):
Add `openspec` to `ARTIFACT_TYPES`, implement `OpenSpecRenderer`, wire it into
`getRenderer()` in `src/lib/renderers/index.js`, add 5 suggestion entries.

**Phase 2** — guide page + nav link (one PR):
Add `/docs/openspec` page and nav button in `ArtifactLibrary`.

No feature flags needed — the type simply appears in the type selector. Existing
artifacts are unaffected.

## Success metrics

- At least one OpenSpec artifact created and published to GitHub in the first
  week after launch (visible in usage logs or user report).
- Guide page viewed (can infer from Vercel analytics if enabled).
- Zero renderer crashes on publish — the rendered Markdown should always be valid
  UTF-8 with the correct path prefix.
