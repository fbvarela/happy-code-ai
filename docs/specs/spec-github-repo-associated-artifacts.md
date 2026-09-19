# Spec — GitHub Repo–Associated Artifact Creation

> Status: **Implemented** (repo context + branch picker, 2026-09-19) · Author: fbvarela · Created: 2026-09-16

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

> **Implemented** — see `src/lib/repo-context.js`, `src/lib/generator.js`, `src/app/api/generate/route.js`.

When `generateArtifact` is called and the artifact has a `github_repo` value, the system will:

1. `generateArtifact` accepts `octokit` (the artifact owner's client, resolved in `/api/generate`) and `repoContextBranch` (branch to read docs from; empty = default branch).
2. `getRepoMemoryContext(githubRepo, octokit, branch)` fetches the repo's memory files using the same path conventions as `/api/memory/scan` (via `src/lib/memory-paths.js`), formats them as a compact digest (per-file and total char budgets to stay token-cheap), and returns `{ digest, branch, status }` where status is `"loaded"` / `"empty"` / `"unavailable"` (never throws).
3. The digest is appended to the system prompt inside a `--- Repo context ---` block with grounding instructions; when unavailable, the prompt explicitly tells the model NOT to hallucinate repo-specific paths.
4. `/api/generate` returns `repoContext: { status, branch }` so the UI can show a status line (loaded / empty / unavailable) after generation.
5. Opt-out: the client can send `withRepoContext: false` (no GitHub calls); the editor exposes this as a checkbox when a repo is linked.

Branch selection: the UI offers a branch picker next to the repo-context checkbox (branches loaded lazily from `GET /api/repos/branches`), and the chosen branch is sent as `repo_context_branch` and used to resolve the git tree the docs are read from.

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

3. **Generate with repo context** (when artifact has `github_repo`) — **Implemented**:
   - The editor pre-fills the repo field from the user's last-used repo (`hc:lastRepo` in localStorage, set by MemoryManager/ConfigManager and the editor itself), and sends `github_repo` + `withRepoContext` + optional `repo_context_branch` to `/api/generate`.
   - The generator prompt includes the repo's memory docs as a digest, with a status line shown after generation (loaded from branch X / no memory files / couldn't read).
   - The user can uncheck "Use {repo}'s memory as context" to skip the fetch entirely.
   - The SuggestionGallery AI prompt also sends the last-used repo so drafts generated there are grounded too.

4. **View artifact details**:
   - Artifact page shows a badge "Linked repo: `owner/name`" if a repo is associated; otherwise no badge.

### Renderers / target impact

- No renderer changes needed. The repo association is metadata; renderers continue to work as before. If the generated artifact references the repo (e.g., a skill that lists repo files), the renderer handles it normally.

### Failure modes

- **Repo not found / inaccessible** — if the user types an invalid `owner/name` or the repo is not accessible with the stored token, the association is silently ignored (no error shown at create time; error may surface later when generation tries to scan the repo).
- **Memory scan fails** — `getRepoMemoryContext` never throws; it returns status `"unavailable"` (or `"empty"` when the repo is reachable but has no memory files) and generation proceeds without repo context. The editor shows a non-blocking status line (`editor.repoCtxLoaded` / `editor.repoCtxEmpty` / `editor.repoCtxUnavailable`).
- **Unknown branch requested** — the `getRef` call fails and the context falls back to status `"unavailable"` with the default-branch behavior; the branch selector drops vanished branches on next load.
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
- Should the generator **automatically** include repo memory when `github_repo` is set, or require user opt-in ("Generate with repo context")? — **Decision**: opt-out checkbox in the editor (checked by default) when a repo is linked; unchecking sends `withRepoContext: false` and makes zero GitHub calls.
- What happens if the linked repo is deleted or the token loses `repo` scope? — **Decision**: the `github_repo` field is just stored text; no cascading delete. If generation fails due to auth/scan errors, the UI Surface shows a warning but the artifact is unaffected.