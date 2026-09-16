# Spec — GitHub Repo–Associated Artifact Creation

> Status: Draft · Author: fbvarela · Created: 2026-09-16

## Context

Artifacts are currently created independently of any GitHub repository context. When a user wants to generate an artifact (agent, skill, config, etc.) that is meaningful for a specific repository — e.g. a skill that operates on that repo's code, a memory file pattern, or a config snippet tied to the project — there is no way to associate the artifact with that repo. The AI generator has no visibility into the repo's memory docs (`AGENTS.md`, `CLAUDE.md`, etc.) or the repo's structure, making generation less relevant and requiring the user to manually supply context.

This spec adds **optional repo association** to artifacts, so the AI can generate artifacts grounded in a particular repository's memory/docs context. The association is opt-in: existing artifacts remain unchanged, and new artifacts may or may not carry a repo link.

## Goals

- Allow an artifact to optionally reference a GitHub repository (`owner/name`).
- When a repo is associated, the AI generator can optionally include the repo's scanned memory files (`AGENTS.md`, `CLAUDE.md`, etc.) as context, reducing the need for manual prompt setup.
- The repo association lives on the artifact record (minimal DB change: add `github_repo` text column, nullable).
- Extend the generator prompt to include repo memory context when an artifact has a repo association.
- Provide a repo picker in the UI (reuse `GET /api/repos`).
- Keep the feature **opt-in** / optional — artifacts without a repo work exactly as before.

## Non-goals

- **Mandatory repo association** — artifacts may be created without referencing any repo.
- **Changing the artifact type system** — existing types (`agent`, `subagent`, `skill`, `command`, `config_snippet`, `memory`, `mcp`, `openspec`) remain; only the repo link is added.
- **Automatic repo detection** — the user must explicitly select/select a repo; no auto-discovery on create.
- **Modifying the publish flow** — publishing still commits to whatever repo the user chooses at publish time; the artifact's linked repo is informational/contextual only.
- **Cross-user repo sharing** — the repo link is per-artifact, visible only to the owner.

## Proposed design

### Data model

Add a nullable column to the `artifacts` table:

| campo | tipo | notas |
|-------|------|-------|
| `github_repo` | text | `owner/name` format, e.g. `"myorg/my-repo"`; `NULL` when no repo is associated. This column has **no CHECK constraint** — any string is allowed, the app trusts the user/repo picker.

The existing migration `004_add_command_type.sql` pattern is followed: a new migration will add this column. Since the column is nullable, no default value or constraint change is needed for existing rows.

### Generator prompt enhancement

When `generateArtifact` is called and the artifact has a `github_repo` value, the system will:

1. Call `GET /api/memory/scan` (or a new lightweight endpoint) to fetch the repo's memory files.
2. Append the repo's memory section content to the system prompt as "Repo memory context".
3. The generator can then reference `{{repo_memory}}` or inline the scanned content in the prompt, allowing the model to create artifacts tailored to that repo.

A new helper function `getRepoMemoryContext(githubRepo)` will fetch and format the memory files similarly to `src/app/api/memory/scan/route.js` but returning just the parsed sections (headings + content) as a string.

### API surface (new/changed routes)

- **`GET /api/artifacts`** — existing; filtering by `github_repo` may be added later.
- **`POST /api/artifacts`** — existing; the payload accepts an optional `github_repo` field (string, nullable). No schema change needed in `artifactInput` Zod if we treat it as optional extra data, OR we add it to the schema as an optional string field.
- **`GET /api/repos`** — existing; used to pick the repo when creating/associating an artifact.
- **`POST /api/memory/scan`** — existing; can be reused to scan a repo's memory files.
- **New: `GET /api/artifacts/:id`** — existing; now also returns `github_repo` if set.
- **New: `POST /api/artifacts/:id/associate-repo`** — optional endpoint to set/change the repo association after creation. Body: `{ github_repo: "owner/name" }`. This can be combined with the update flow.

Alternatively, the `github_repo` field can be passed directly in the `POST /api/artifacts` body alongside the other fields, and the artifact update (`PUT /api/artifacts/:id`) will also support updating it.

### UI flow

1. **Create artifact flow** (modified):
   - User clicks "Create artifact" → sees the usual form (name, type, target, frontmatter, variables, tags).
   - New field: **GitHub repo** (optional, text input with "owner/name" format, or a picker button).
   - If the user types a repo or picks one, the field is stored with the artifact.
   - If the user leaves it empty, the artifact is created as before (no repo association).

2. **Repo picker** (optional UI improvement):
   - A button opens a small modal listing the user's repos via `GET /api/repos`.
   - User selects a repo → the `github_repo` field is auto-filled with `owner/name`.

3. **Generate with repo context** (when artifact has `github_repo`):
   - After artifact is created (or during generation), if `github_repo` is set, the UI can call `GET /api/memory/scan` to fetch memory files.
   - The generator prompt includes the repo's memory sections (headings + content) as context.
   - The user can choose "Generate with repo context" or the system does it automatically based on a toggle.

4. **View artifact details**:
   - Artifact page shows a badge "Linked repo: `owner/name`" if a repo is associated; otherwise no badge.

### Renderers / target impact

- No renderer changes needed. The repo association is metadata; renderers continue to work as before. If the generated artifact references the repo (e.g., a skill that lists repo files), the renderer handles it normally.

### Failure modes

- **Repo not found / inaccessible** — if the user types an invalid `owner/name` or the repo is not accessible with the stored token, the association is silently ignored (no error shown at create time; error may surface later when generation tries to scan the repo).
- **Memory scan fails** — if the scan API fails during generation, the generator proceeds without repo context, and the UI shows a non-blocking warning.
- **Token scope issues** — the GitHub token must have `repo` scope; if missing, the scan will 401 and the user will be prompted to re-auth.

## Rollout plan

1. **DB migration**: Add `github_repo text` column to `artifacts` table (nullable, no constraint).
2. **Backend**: Extend `artifactInput` schema (or handle informally) to accept optional `github_repo`; pass it through `POST /api/artifacts` and `PUT /api/artifacts/:id`.
3. **Generator**: Enhance `generateArtifact` in `src/lib/generator.js` to optionally include repo memory context when the artifact has `github_repo`.
4. **UI**: Add repo field to the artifact creation/edition forms; add optional repo picker using `GET /api/repos`.
5. **Test**: Verify that artifacts created without `github_repo` behave identically to before; verify that artifacts with `github_repo` can have memory context injected during generation.

## Success metrics

- % of newly created artifacts that include a `github_repo` association (target: optional, no forced adoption).
- When `github_repo` is set, % of generations that successfully include repo memory context (target: >80% success without errors).
- User satisfaction: users who try the repo association find it helpful for repo-specific artifacts (qualitative feedback).
- No regression in artifact creation or generation for artifacts without a repo association.

## Open questions

- Should the repo association be **visibly editable** after artifact creation (a dedicated "Associate repo" action), or only via the edit form? — **Decision**: expose it in the edit form + optional "Associate repo" button for quick access.
- Should the generator **automatically** include repo memory when `github_repo` is set, or require user opt-in ("Generate with repo context")? — **Decision**: require user opt-in initially; auto-inclusion can be added later once the pattern is validated.
- What happens if the linked repo is deleted or the token loses `repo` scope? — **Decision**: the `github_repo` field is just stored text; no cascading delete. If generation fails due to auth/scan errors, the UI Surface shows a warning but the artifact is unaffected.