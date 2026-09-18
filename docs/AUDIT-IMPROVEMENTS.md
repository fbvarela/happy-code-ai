# Audit — Issues & Improvements

> Review of the app's logic, UX/organization, and CSS as of 2026-09-18.
> **No code was changed** — this document is the backlog. Severity:
> 🔴 bug/correctness · 🟠 risk/tech-debt · 🟡 UX/consistency improvement.
> Items marked **✅ FIXED** were resolved after the initial audit.

---

## 1. Logic & correctness issues

### 1.1 API / server

- 🔴 ~~**`memory.publish` / `config.publish` don't validate or sanitize `files[].path`.**~~ **✅ FIXED**
  Both routes now validate every `files[].path` via the shared `src/lib/safe-path.js`
  (`safeRepoPath`): traversal (`..`), backslash/absolute paths, control chars and
  overlong paths are rejected with a 400 (`{ error: "Unsafe file path", path }`) before
  anything touches GitHub. Defense in depth: `commitFiles()` re-validates every path at
  the chokepoint. **Follow-up hardening also done:** a server-side convention allowlist
  (`isPublishableMemoryPath` / `isPublishableConfigPath`, derived from the same pure-data
  maps the scan routes use) now restricts memory/config publishes to recognized agent
  locations only — traversal and arbitrary writes (`.github/workflows`, `README.md`, …)
  are both rejected with a 400.
- 🔴 ~~**Artifact `files[].path` and publish `path` override are path-injection vectors too.**~~ **✅ FIXED**
  The `body.path` override in `/api/artifacts/:id/publish` **and** `/api/artifacts/:id/test`
  (same hole) is now validated with `safeRepoPath` → 400 on unsafe input. Extra-file paths
  are sanitized in the renderer (`renderers/base.js`) so stored traversal can never escape
  the artifact directory, and `fileSchema` rejects unsafe paths at save time. Verified:
  `a/../../.env` is rejected; 18-case sanitizer test suite passes; `npm run build` green.
- 🟠 ~~**Filtering happens in JS, not SQL — the whole table is shipped to the client.**~~ **✅ FIXED**
  `GET /api/artifacts` now filters in SQL: `type =`/`target =` predicates, `name ILIKE` and
  per-tag `EXISTS (SELECT 1 FROM unnest(tags) tg WHERE tg ILIKE …)` for `q` (LIKE wildcards
  `% _ \` escaped so user queries match literally), scoped to `user_id` as before.
  Pagination added: `page` (1-based) + `limit` (default 50, max 100) with `LIMIT/OFFSET`,
  and `count(*) OVER ()` carries the total in the same roundtrip. Response shape is now
  `{ items, total, page, limit, hasMore }`; `ArtifactLibrary` was updated — it shows a
  "Showing X of Y" line and a "Load more" button, keeps debounced replace-on-filter
  behavior, and no longer assumes a bare array. Verified: 15-case logic test (escaping,
  page/limit clamping, offset/hasMore math, `total_count` stripping) + `npm run build`.
  (Live SQL run pending — no `DATABASE_URL` in this environment; query is standard
  Postgres and mirrors the tested logic.)
- 🟠 **Duplicate GET /api/repos fetches; no request dedupe or cache.**
  `ArtifactEditor` has both `loadRepos()` and `selectRepo()` doing the same fetch (and
  `selectRepo` silently overwrites `pub.repo` while the publish panel uses its own copy);
  `MemoryManager` and `ConfigManager` each fetch repos on mount. A `useRepos()` hook with
  cache (or server component passing repos down) removes 3 copies.
- 🟠 **Publish success in Memory/Config managers silently re-scans and destroys edit state.**
  After `publish()` they call `scan()`, which resets `editedFiles`, `publishResult`, and
  can clear `publishResult` mid-render race (`setPublishResult(data)` then `scan()` →
  `setPublishResult(null)`). Users lose context of what was just published.
- 🟠 **`ArtifactEditor.save()` has no confirmation when changing type/target of an existing
  artifact** — the renderer's destination path changes silently on publish. Cheap guard:
  confirm when `type` or `target` differs from the loaded values.
- 🟠 **Unbounded payload sizes.** No max length on `body_template`, `variables`, `files[]`,
  or the memory/config publish `files[]` (a user could push a 50 MB blob via the Git Data
  API in one request). Add zod `max()` constraints mirroring what GitHub allows.
- 🟠 **`artifact_versions` rows never list or restore** — versions bump and snapshots
  accumulate, but there's no API/UI to view or roll back. Either ship a minimal history
  drawer or stop snapshotting on every PUT (currently doubles write volume).
- 🟡 ~~**`GET /api/artifacts` returns 500-shaped errors as raw Neon errors** on DB failure
  (no try/catch, unlike publish/scan routes). Wrap and return a friendly 502.~~ **✅ FIXED** —
  The list GET is wrapped (friendly `{ error: "Could not load artifacts" }` 502), and the
  same treatment was applied to `GET /api/artifacts/:id` and `DELETE /api/artifacts/:id`,
  which had the identical hole.
- 🟡 **`sessions` maxAge 30 days with no refresh** — long-lived users get logged out
  mid-work on day 31; consider rolling the cookie on activity.
- 🟡 **CSP is minimal** (`frame-ancestors 'none'` only). Adding
  `default-src 'self'; script-src 'self' 'unsafe-inline'` (inline needed for the no-flash
  scripts) would meaningfully harden the app.

### 1.2 Generator / quality

- 🟠 ~~**`systemPromptOverride` lets the browser replace the entire safety/quality system
  prompt.**~~ **✅ FIXED** — Overrides are now APPENDED after the base rules instead of
  replacing them, via a shared pure helper `mergeSystemPrompt()` (`src/lib/prompt-merge.js`):
  base prompt first (quality gate, structured-output requirement survive every override),
  then a labeled marker, then the user text — CRLF-normalized, edge-trimmed, and hard-capped
  at 4,000 chars with a line-boundary cut. Blank/whitespace/non-string overrides return the
  base prompt untouched. Applied in **both** paths that had the replace-everything pattern:
  `/api/generate` (`generator.js`) and the local-model path (`local-generate.js`, which read
  the override from localStorage client-side). `PromptManager`'s reset text and the i18n
  descriptions now describe the field as "extra instructions" to match the semantics.
  Verified with a 13-case logic test (base rules survive every override) + `npm run build`.
- 🟠 ~~**Custom glossary prompts are sent but ignored.**~~ **✅ FIXED** — The overrides are
  now threaded through: `/api/glossary/define` and `/api/glossary/explain` pass the
  language-matched custom prompt to `defineTerm`/`explainTerm` (which already supported a
  `systemPromptOverride`), and the save-time backfill path (`ensureDefinition`, used by
  glossary POST/PUT) accepts it too — `GlossaryList.save()` now sends the prompts. Blank or
  whitespace-only prompts fall back to the built-in system prompts. `ArtifactEditor` no
  longer sends the (irrelevant) glossary prompts to `/api/generate`, and the four now-dead
  `glossary*Prompt*` fields were removed from the `/api/generate` handler too.
- 🟠 ~~**`lintBody().role` only matches Spanish/English first-person openers** —
  `^(eres|you are|you're|sos)\b` misses "Actúa como…", "Eres un…" only at position 0
  (a leading `#` heading or `---` frontmatter fails the check). Loosen to first 200 chars
  and add common role verbs.~~ **✅ FIXED** — `lintBody().role` now scans a 200-char window
  (not just position 0) with a much wider opener list in both languages: EN `you are/you're`,
  `you will act/be`, `act(s) as`, `acting as`, `your role/task/job/mission/goal/purpose/function/responsibility`,
  `assume/take (on) the role`, `serves/works as`; ES `eres/serás/sos`, `actúa/actua` (accent-optional),
  `tu rol/tarea/trabajo/misión/función/objetivo/propósito/responsabilidad`, `asume el rol/papel`,
  `toma el rol`. Leading YAML frontmatter (`--- … ---`) and markdown heading markers (`#`)
  are stripped first, so `---\nmodel: …\n---\n# Eres un…` passes. The `PromptChecklist` label
  (ES/EN) was updated to match ("defined near the start"). Verified with a 21-case test
  (old failures now pass, no new false positives, other auto checks untouched) + build.
- 🟠 **`quality` check `negative` regex is fragile** — `\bno\b.{0,40}[.;\n]` matches
  unrelated prose ("…no. "), and non-Spanish/English artifacts (e.g. JSON bodies) can
  never pass `role`/`xml`. That's gated by `PROMPT_LIKE_TYPES` today, but the generated
  `type` is model-chosen — a misclassified `memory` body skips the gate entirely.
- 🟠 **Token usage aggregation double-counts on retry.** `best.usage` is set to the sum of
  both attempts, but if `best` remains `first` (retry didn't win), the reported usage still
  includes the retry's tokens. Report per-attempt usage instead.
- 🟡 **`estimateTokens` (chars/3.8) is applied to the raw template**, including Handlebars
  holes; a body full of `{{very_long_variable_names}}` reads hotter than the rendered
  output. Minor, but the TokenMeter could render-then-estimate.
- 🟡 **Agent limits data is stale-risk**: "Codex CLI deprecated, 8k window" and Copilot's
  "unconfirmed" note will age; source-stamp the table (date + link) so future edits know
  what to re-verify.

### 1.3 Client components

- 🔴 **`ConfigGuide` step numbers are broken.**
  `steps.indexOf({ key })` — `indexOf` compares by reference, so it's always `-1`,
  meaning every card shows step number **0**. Map with index instead.
- 🟠 **`PromptChecklist`/`SpecChecklist` manual-checkbox state resets on re-render of the
  body** (state lives in the component, but the `passed` count recomputes from `manual`
  while editing — fine — yet any unmount/remount wipes it). Low priority, but persisting
  per-artifact would be more useful.
- 🟠 ~~**`ArtifactEditor` publishes **saved** artifact + live `values`, not current edits.**~~ **✅ FIXED** —
  The editor now tracks a saved-form snapshot (set on load and after every successful save).
  When the form differs from the snapshot (`isDirty`), the publish panel shows an amber
  "unsaved changes" badge, and Publish/Test-on-branch ask for confirmation first, then
  **save the current edits** before rendering/committing — so GitHub receives exactly what
  the preview showed. If save fails (validation/network), the publish is aborted. i18n
  strings (`editor.unsavedDirty`, `editor.unsavedBadge`) added in ES/EN. Verified with an
  8-case dirty-detection test + `npm run build`.
- 🟠 **`MemoryManager.syncSection` writes to root files only.** Sync targets the
  `<module>/<root>` file; syncing into a *named* memory file isn't possible, and there's
  no conflict UI when the target section exists (it's silently overwritten).
- 🟡 **`SuggestionGallery` → editor handoff via sessionStorage is fragile** — the editor
  consumes `hc:suggestion` on mount but a hard refresh after picking loses it
  (key removed) and shows an empty form with no way back except browser-back.
  Consider `?from=<suggestion-id>` (suggestions are static data).
- 🟡 **Delete flows don't handle failure**: `ArtifactLibrary.remove` and glossary delete
  `await fetch(... DELETE)` without checking `res.ok`; a 403/500 leaves the optimistic
  UI consistent but the artifact still exists on reload.
- 🟡 **`MemoryManager`/`ConfigManager` lose unsaved edits on repo switch / re-scan with
  no warning.** `scan()` resets `editedFiles` without confirming.
- 🟡 **`ArtifactLibrary` debounce reloads on every keystroke even when filters don't
  change the query** (typing fast still fires a request per 150 ms pause). Minor.

### 1.4 Data / schema

- 🟠 **`artifacts.type` CHECK constraint must be extended every time a type is added**
  (migrations 002 and 004 are both just this). Either drop the CHECK (validate in zod,
  which already gates inserts) or keep it but document the chore.
- 🟡 **No `updated_at` trigger** — `updated_at = now()` is set manually in PUT only;
  glossary PUT path (`UPDATE ... SET term=...`) never bumps any timestamp for the entry.
- 🟡 **`glossary_explanations` has no FK to a terms table** (by design, seed slugs) but
  also no cleanup when a user entry is deleted → orphan rows accumulate. Add
  `ON DELETE CASCADE` via a trigger or delete explanation rows in the DELETE handler.
- 🟡 **Migration runner `splitStatements` strips `--` comments then splits on `;`** —
  a semicolon inside a string literal or a `$$` function body would break it. Fine for
  current files; document the limitation in the runner header.

### 1.5 Misc / config

- 🟠 ~~**`scripts/seed-glossary.mjs` still imports `@ai-sdk/groq` and needs `GROQ_API_KEY`,
  but the runtime moved to Agnes** (`AGNES_API_KEY`). The package isn't even in
  `package.json` — the script crashes on import.~~ **✅ FIXED** — The script now uses the
  same Agnes gateway/model as the runtime generator (imports `isAgnesConfigured`/
  `getAgnesModel` from `src/lib/agnes.js` relatively, honoring `AGNES_MODEL`), so there's
  no extra provider or key to maintain. Also made per-entry fault-tolerant: a flaky
  response logs `FAILED: …` for that term instead of killing a long curation run. Verified:
  imports resolve (previously crashed at import), unconfigured-key guard exits 1 with the
  correct message, `npm run build` green.
- 🟠 ~~**`package.json` declares `uuid` (v13) but nothing imports it** — dead dependency.~~
  **✅ FIXED** — Removed via `npm uninstall uuid` (package.json + lockfile clean; the
  remaining "uuid" mentions in the codebase are Postgres column types and comments, not
  the package).
- 🟡 **`README.md`/`CLAUDE.md` mention `api/auth/me`** — exists, fine — but CLAUDE.md's
  architecture notes (Groq glossary, "no `files` column") lag behind the code; refresh it.
- 🟡 ~~**PWA `manifest.json` colors (`#f5f0e8` / `#3d2b1f` brown theme) don't match the
  current blue palette** (`--bg #f4f7fb`, `--bark #2563eb`) and `theme_color` in
  `layout.jsx` (`#3d2b1f`) is likewise the old brown.~~ **✅ FIXED** — Manifest now uses
  `background_color #f4f7fb` / `theme_color #2563eb`. The stale brown also lived in the
  favicon (`src/app/icon.svg`) and the PWA icon generator (`scripts/gen-pwa-icons.mjs`,
  old green/yellow glyph) — both refreshed to the `--bark` blue square with white +
  `--sun` glyph, and the committed PNGs regenerated via `npm run icons:pwa` (pixel-verified:
  90.5% exact #2563eb, white+yellow glyph). `npm run build` green.
- 🟡 ~~**`viewport.themeColor` doesn't adapt to dark mode**; Next supports
  `viewport.themeColor = [{ media: "(prefers-color-scheme: dark)", color: ... }, ...]`.~~
  **✅ FIXED** — `layout.jsx` now exports adaptive values: `#60a5fa` (dark-mode `--bark`)
  for `(prefers-color-scheme: dark)` and `#2563eb` for light, matching the pre-paint
  dark-mode script.

---

## 2. UX & user-friendly reorganization

### 2.1 Navigation & IA

- 🟡 ~~**Two competing navigation systems on the home page.** `SideMenu` (sidebar) already
  links Suggestions / Memory / Glossary / Config / Guides, but `ArtifactLibrary` renders a
  second row of quick-nav buttons doing the same thing (plus a Guides dropdown whose items
  are also in the sidebar).~~ **✅ FIXED** — The quick-nav row is gone; the toolbar now holds
  only search + type filter + one "+ Nuevo" button. The empty state became a CTA card with
  an inline "+ New artifact" button (also closes the §2.4 `library.empty` item). The guides
  dropdown was removed with the row, which also retires its a11y gap (no Escape/blur close —
  §4). New i18n keys `library.newArtifact` (ES/EN); `library.empty` shortened so the button
  carries the call to action.
- 🟡 ~~**The home page duplicates header info.** `page.jsx` shows avatar/@login/Logout while
  the sidebar footer shows a fake "System ready v1" status — the status line is noise;
  move login info into the sidebar footer (logout included) and drop the page header.~~ **✅ FIXED** —
  The sidebar footer now carries the real identity: avatar (with `&s=64` sizing per §5),
  `@githubLogin`, and a compact icon-only logout button (`.side-menu-logout` with clay hover);
  the fake "System ready v1" status line is gone (the fake status dot §4 mentioned is retired
  with it). `SideMenu` fetches `/api/auth/me` client-side (middleware guarantees the sidebar
  only renders behind auth; a failed fetch degrades to a neutral `v1` footer). The home page
  header keeps only title + tagline — the title/tagline stay (page context), the duplicated
  login cluster is dropped. Mobile unaffected: identity lives inside the slide-in sidebar.
- 🟡 ~~**Back-links are inconsistent**: glossary/suggestions use a small `← Volver` next to
  the H1; memory/config use the same but bigger; editor uses a ghost button at the *bottom*
  of a long form.~~ **✅ FIXED** — New shared `<BackLink href label>` component
  (`src/components/BackLink.jsx` + `.back-link` class in `globals.css`): bark-colored link
  with arrow, always the first element above the page title. Deployed on all 11 surfaces
  (suggestions, glossary, prompt-settings, memory, config, the 4 doc guides, glossary
  detail → `/glossary`, and the artifact editor — whose old bottom-of-form ghost button is
  gone). The config/memory guide pages keep their secondary tool link (right-aligned on the
  same row). This also removes the §4 Escape/blur note's last context — no dropdown left.
- 🟡 **`/docs/memory-guide` and `/docs/config-guide` are reachable only via dropdown/
  guide pages** while `/docs/openspec` and `/docs/prompt-guide` are top-level sidebar
  items — asymmetric. Either all four in the sidebar "Guías" group (they are: prompt,
  config, openspec — memory-guide is missing) or none.

### 2.2 Artifact editor

- 🟡 **Form order doesn't match user flow.** Current order: AI generate → name → type/
  target → help → template → tags → repo → frontmatter → body → variables → extra files.
  More natural: generate → **type/target** (affects everything downstream) → name → body
  → variables → tags → frontmatter (advanced) → extra files. At minimum move
  frontmatter *below* body — JSON frontmatter is the most intimidating field for
  non-experts and currently sits mid-form.
- 🟡 **Publish panel is buried** at the bottom of the sticky preview column, below the
  checklists — new users won't find it. Promote to its own card/section (or a "Publish"
  tab beside Preview).
- 🟡 **The GitHub-repo field has a "Load my repos" button whose label becomes the selected
  repo** (`{pub.repo ? pub.repo : t("editor.loadRepos")}`) — looks like a status chip but
  is a button that re-fetches. Use a `<select>` or make the label static.
- 🟡 **No unsaved-changes guard** on route change (`router.push` / browser back) despite a
  long form; a `beforeunload` or Next `useBlocker`-style confirm is cheap.
- 🟡 **Hardcoded strings in editor**: error `"No se pudo cargar el artefacto."`,
  `"Cargando…"`, `"Error al publicar"`, aria-labels `"Quitar variable"/"Quitar archivo"`,
  the `title="Formato: owner/name…"`. Route them through i18n like the rest.
- 🟡 **Publish result shows raw branch/commit but for multi-file artifacts only the
  primary path** (`pub.result.path`) — show all paths (API already returns `paths`).

### 2.3 Managers (memory/config)

- 🟡 **Diff preview renders whole-file line-by-line diff** — a one-word change highlights
  the whole paragraph. A simple LCS/word-level diff would make review far faster.
- 🟡 **Memory editor: no heading rename or reorder**; "New Section" creates a literal
  `"New Section"` heading (should localize). Section delete isn't possible (clearing text
  leaves the heading).
- 🟡 **Config editor: no JSON validation before publish** — invalid JSON is committed
  verbatim (guide even warns users to "keep valid syntax" manually). Validate
  `JSON.parse` on save/publish for `.json` paths and block with an inline error.
- 🟡 **No mobile-friendly fallback for the 5-column target grid** — it does wrap
  (auto-fill) but 5 cards at 280px on tablet = awkward 2+2+1; consider tabs or an
  accordion per CLI on small screens.

### 2.4 Empty/loading/error states

- 🟡 **Skeletons instead of "Cargando…" text** for repos/library would reduce perceived
  latency (tiny `pulse` class would do).
- 🟡 **`library.empty` tells users to press "+ Nuevo"** but the button is far away in the
  toolbar; make the empty state a call-to-action card with the button inline.
- 🟡 **Publish/generate errors surface as raw strings** (`data.message || data.error`) —
  GitHub API messages can be long JSON-ish; map common ones (409 conflict, 403 rate
  limit, branch protection) to friendly i18n text with a "details" expander.

---

## 3. CSS & visual style

- 🟠 ~~**Design-token drift: two parallel token systems.** `@theme` (Tailwind 4:
  `--color-bark`, `--color-muted`…) and hand-rolled `:root` (`--bark`, `--text-muted`…)
  duplicate the same palette, and `.dark` re-declares a *subset* of the `@theme` vars
  (`--color-bg`, `--color-surface`…) — the Tailwind-colored utilities and CSS-var-using
  inline styles can disagree in dark mode if one is updated and not the other.~~ **✅ FIXED** —
  Single source of truth now: the `@theme` color block (16 vars incl. never-used `-light`
  variants) and the `.dark` `--color-*` re-declarations were **deleted**; the short `:root`
  vars are the only palette. Kept from `@theme` into `:root` (merged, deduped): fonts,
  `--radius-sm` (was only there), `--shadow-lg` (was only there; `--shadow-card`/
  `--radius-card` were consumed by nothing and dropped). Verified safe first: zero
  `var(--color-*)` refs, zero Tailwind brand utilities (`bg-bark`, `text-muted`, `dark:`),
  no `@apply` in the codebase. Emitted CSS checked post-build: all 14 token groups present,
  `.dark` overrides intact (`--bark:#60a5fa` etc.), no `--color-*` residue, and app classes
  (`.back-link`, `.btn-bark`, `.spin`…) untouched.
- 🟠 **Tailwind is installed and configured but ~unused.** Components style everything
  with inline `style={{...}}`; the utility layer adds weight and confusion. Either adopt
  Tailwind classes in components or drop the plugin (keep tokens as plain CSS).
- 🟠 **Massive inline-style duplication** — `inputStyle`, `badgeStyle`, `modBadge`,
  `newBadge`, `fileBtn`, `smallBtn`… are re-declared (with drift!) in 6+ components:
  - `minHeight: 44` vs `36` vs `34` inputs/buttons across files,
  - `borderRadius: 8` vs `var(--radius-sm)` (6px) vs `6`,
  - MemoryManager `modBadge`/`newBadge` use **hardcoded colors** (`#b8860b`,
    `rgba(60,140,60,.15)`, `#2a7a2a`) that break dark-mode contrast — everything else
    uses tokens. Move to `globals.css` classes (`.input`, `.badge`, `.badge-mod`,
    `.badge-new`, `.file-btn`) — the AGENTS.md card-grid note is the same story.
- 🟡 **`.card-grid` exists but several grids bypass it** with inline
  `gridTemplateColumns: repeat(auto-fill, minmax(280px,1fr))` (ConfigManager,
  PromptManager, MemoryGuide's CLI table). Use the shared class (already in the
  AGENTS.md open questions).
- 🟡 **Dark-mode contrast issues beyond the badges**: `DiffPreview` line colors
  `rgba(180,60,40,.12)` on `--bg #0d1422` is fine, but its added-text color falls back
  `var(--leaf, #2a7a2a)` — the fallbacks suggest missing vars; normalize to tokens.
- 🟡 **`.btn-bark` hardcodes hover/light-mode colors** (`#1d4ed8`, `#93c5fd`,
  `rgba(37,99,235,.18)` shadow) — should derive from `--bark` (`color-mix`) like the
  side-menu active state does.
- 🟡 **`.spin` class is used (`RefreshCw className="spin"`) but never defined** in
  `globals.css` — the scanning/saving icons don't animate at all. Add:
  `@keyframes spin { to { transform: rotate(360deg) } } .spin { animation: spin 1s linear infinite; }`
  (respecting `prefers-reduced-motion`).
- 🟡 **Focus ring only via `box-shadow: var(--focus)`** — inputs also get border-color
  change, fine, but buttons with `background: none` (checklist headers, term links)
  rely on it; verify contrast in dark mode. Also `::selection` color is light-theme
  only (`rgba(37,99,235,.2)`) — add a `.dark` variant.
- 🟡 **Scrollbar styling is WebKit-only** (`::-webkit-scrollbar`); add
  `scrollbar-width: thin; scrollbar-color: var(--line) transparent` for Firefox.
- 🟡 **No `font-display: swap` control / FOUT handling** beyond the Google Fonts URL
  (the `display=swap` param is there — good); consider `size-adjust` fallbacks or
  `next/font` to self-host and remove the external request (CSP will need
  `font-src fonts.gstatic.com` otherwise).
- 🟡 **Floating toggles overlap content on mobile**: Theme/Language buttons are `fixed`
  top-right while the mobile menu toggle is top-left — on the editor's 2-col layout at
  ~820px they can cover the publish panel's select. Give `main` right padding ≥ 120px
  on small screens or move toggles into the sidebar footer.

---

## 4. Accessibility

- 🟡 **Icon-only buttons lack labels in places**: `TokenMeter` expand ("▲/▼"),
  `ArtifactEditor` variable/file remove buttons have labels only in Spanish hardcoded,
  `SuggestionGallery` has none for the category select (it has a placeholder option, ok).
- 🟡 **Checklist headers are `<button>`s with only chevron icons + text — good — but the
  guides dropdown in `ArtifactLibrary` opens on click and doesn't close on Escape or
  focus-out** (only outside-mousedown). Add `onKeyDown` Escape + `blur` handling.
- 🟡 **`<main>` landmarks**: `layout.jsx` wraps children in `<main className="app-shell">`
  but pages *also* render their own `<main>` → nested mains. Change page wrappers to
  `<div>` or the layout to `<div>`.
- 🟡 **Color-only status**: "modified/new" badges rely on color + text (text present —
  good), but `TokenMeter`'s ✓/⚠ works; the side-menu "status dot" is decorative — give
  it `aria-hidden`.
- 🟡 **Language toggle shows target language abbreviation (EN/ES) with `title`** — fine,
  but consider `lang` attribute on the button text for screen readers.

---

## 5. Performance & robustness

- 🟡 **`/api/repos` pagination caps at 100** with no paging — users with >100 repos see
  a truncated list silently. Loop `page=1..n` while `data.length === 100`.
- 🟡 **`memory/scan` fetches every blob content in parallel** — a repo with many memory
  files hammers the API; chunk with `p-limit`-style concurrency (e.g. 8) and consider
  `If-None-Match`/ETag reuse for re-scans.
- 🟡 **`commitFiles` does 5+ sequential API calls** (ref → commit → blobs×N → tree →
  commit → ref); fine, but a failure mid-way (e.g. `updateRef` 409) leaves orphan blobs —
  harmless, but the error message should tell the user "branch may have moved, retry".
- 🟡 **No client-side request cancellation** (AbortController) on the library search
  debounce or repo scan; fast filter typing can race responses out of order
  (last-response-wins isn't guaranteed).
- 🟡 **Session avatar loaded from GitHub CDN without sizing params** — append `&s=72` to
  avatars for crispness (minor).

---

## 6. Suggested priority order

1. ~~**Security**: path validation on all publish routes (1.1)~~ **✅ DONE** — smallest diff, biggest risk.
2. **Bugs**: ConfigGuide step numbers (1.3), `.spin` keyframes (3), glossary custom
   prompts ignored (1.2), publish-overwrites-edits guard (1.3) — **all ✅ done**.
3. **Quick wins**: dedupe token systems (3), extract shared input/badge classes (3),
   remove quick-nav row on home (2.1), ~~refresh manifest colors (1.5)~~ **✅ done**, ~~drop `uuid` dep +
   port seed script (1.5)~~ **✅ done**.
4. **Structural**: server-side artifact filtering + pagination (1.1), repos hook (1.1),
   editor form reorder (2.2), history UI or stop snapshotting (1.1).
5. **Polish**: skeletons, empty-state CTAs, error mapping, a11y items (2.4, 4).
