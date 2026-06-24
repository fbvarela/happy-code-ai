"use client";

import { useEffect, useMemo, useState } from "react";
import { Brain, RefreshCw, Upload, ChevronLeft, Plus, Copy, Check } from "lucide-react";
import { TARGETS, TARGET_LABELS } from "@/lib/targets";
import { MEMORY_PATHS, SHARED_ROOTS, parseMemorySections, renderSections } from "@/lib/memory-paths";
import { useI18n } from "@/lib/i18n";
import DiffPreview from "@/components/DiffPreview";

export default function MemoryManager() {
  const { t } = useI18n();

  // ── Repo selection ──
  const [repos, setRepos] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [branch, setBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // ── Scan state ──
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [memoryFiles, setMemoryFiles] = useState(null);
  const [scannedBranch, setScannedBranch] = useState("");

  // ── Editing ──
  const [editedFiles, setEditedFiles] = useState({});
  const [activeFile, setActiveFile] = useState(null);

  // ── Sync ──
  const [syncSource, setSyncSource] = useState(null);

  // ── New file creation ──
  const [newFileTarget, setNewFileTarget] = useState(null);
  const [newSlug, setNewSlug] = useState("");

  // ── Publish ──
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [showDiff, setShowDiff] = useState(false);
  const [commitMsg, setCommitMsg] = useState("");

  // Load repos on mount
  useEffect(() => {
    fetch("/api/repos")
      .then((r) => (r.ok ? r.json() : []))
      .then(setRepos);
  }, []);

  // Load branches when repo changes
  useEffect(() => {
    if (!selectedRepo) { setBranches([]); setBranch(""); return; }
    setLoadingBranches(true);
    setBranches([]);
    setBranch("");
    fetch(`/api/repos/branches?repo=${encodeURIComponent(selectedRepo)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        setBranches(list);
        // pre-select default branch from repos list
        const repo = repos?.find((r) => r.full_name === selectedRepo);
        const def = repo?.default_branch || (list[0] ?? "");
        setBranch(def);
      })
      .finally(() => setLoadingBranches(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepo]);

  // ── Scan ──
  async function scan() {
    if (!selectedRepo || scanning) return;
    setScanning(true);
    setScanError(null);
    setMemoryFiles(null);
    setEditedFiles({});
    setActiveFile(null);
    setPublishResult(null);
    setPublishError(null);
    try {
      const res = await fetch("/api/memory/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: selectedRepo, branch: branch.trim() || undefined }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMemoryFiles(data.files);
      setScannedBranch(data.branch);
    } catch {
      setScanError(t("memory.errScan"));
    } finally {
      setScanning(false);
    }
  }

  // ── Edit helpers ──
  function getContent(path) {
    if (path in editedFiles) return editedFiles[path];
    const f = memoryFiles?.find((f) => f.path === path);
    return f?.content || "";
  }

  function setContent(path, content) {
    setEditedFiles((prev) => ({ ...prev, [path]: content }));
  }

  function isModified(path) {
    if (!(path in editedFiles)) return false;
    const orig = memoryFiles?.find((f) => f.path === path);
    return editedFiles[path] !== (orig?.content || "");
  }

  function isNew(path) {
    return !memoryFiles?.some((f) => f.path === path);
  }

  // ── Group files by target ──
  const filesByTarget = useMemo(() => {
    if (!memoryFiles) return {};
    const map = {};
    for (const target of TARGETS) map[target] = [];
    for (const f of memoryFiles) {
      if (map[f.target]) map[f.target].push(f);
    }
    // Include new files from editedFiles
    for (const path of Object.keys(editedFiles)) {
      if (memoryFiles.some((f) => f.path === path)) continue;
      const target = TARGETS.find((t) => {
        const p = MEMORY_PATHS[t];
        return path === p.root || path.startsWith(p.dir + "/");
      });
      if (target && map[target]) {
        const slug = path.split("/").pop().replace(/\.[^.]+$/, "");
        map[target].push({ target, path, isRoot: false, slug, content: "", sha: null });
      }
    }
    return map;
  }, [memoryFiles, editedFiles]);

  // ── Changed files for publish ──
  const changedFiles = useMemo(() => {
    const result = [];
    for (const [path, content] of Object.entries(editedFiles)) {
      const orig = memoryFiles?.find((f) => f.path === path);
      if (!orig || orig.content !== content) {
        result.push({ path, content, original: orig?.content || "", isNew: !orig });
      }
    }
    return result;
  }, [editedFiles, memoryFiles]);

  // ── Create new memory file ──
  function createNewFile(target) {
    if (!newSlug.trim()) return;
    const slug = newSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const paths = MEMORY_PATHS[target];
    const path = `${paths.dir}/${slug}${paths.ext}`;
    setContent(path, `# ${slug}\n\n`);
    setActiveFile(path);
    setNewFileTarget(null);
    setNewSlug("");
  }

  // ── Sync section to other targets ──
  function syncSection(sectionContent, heading, fromTarget) {
    for (const target of TARGETS) {
      if (target === fromTarget) continue;
      if (!syncSource?.targets?.[target]) continue;

      const paths = MEMORY_PATHS[target];
      const rootPath = paths.root;
      const currentContent = getContent(rootPath);

      if (!currentContent && !memoryFiles?.some((f) => f.path === rootPath)) {
        const block = heading ? `## ${heading}\n\n${sectionContent}\n` : sectionContent + "\n";
        setContent(rootPath, block);
        continue;
      }

      const sections = parseMemorySections(currentContent);
      const idx = sections.findIndex((s) => s.heading === heading);
      if (idx >= 0) {
        sections[idx] = { heading, content: sectionContent };
      } else {
        sections.push({ heading, content: sectionContent });
      }
      setContent(rootPath, renderSections(sections));
    }
    setSyncSource(null);
  }

  // ── Publish ──
  async function publish() {
    if (!changedFiles.length || publishing) return;
    setPublishing(true);
    setPublishError(null);
    setPublishResult(null);
    try {
      const res = await fetch("/api/memory/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: selectedRepo,
          branch: scannedBranch,
          message: commitMsg.trim() || t("memory.defaultCommitMsg"),
          files: changedFiles.map((f) => ({ path: f.path, content: f.content })),
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPublishResult(data);
      // Re-scan to refresh shas
      scan();
    } catch {
      setPublishError(t("memory.errPublish"));
    } finally {
      setPublishing(false);
    }
  }

  // ── Render ──

  // Repo selector
  if (!memoryFiles) {
    return (
      <section>
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: "0.95rem", marginBottom: 12, fontWeight: 600 }}>
            <Brain size={18} style={{ display: "inline", verticalAlign: "-3px", marginRight: 8 }} />
            {t("memory.selectRepo")}
          </p>
          {repos === null && <p style={{ color: "var(--text-muted)" }}>{t("common.loading")}</p>}
          {repos && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                style={{ ...inputStyle, flex: 1, minWidth: 220 }}
              >
                <option value="">—</option>
                {repos.map((r) => (
                  <option key={r.full_name} value={r.full_name}>{r.full_name}</option>
                ))}
              </select>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                disabled={!selectedRepo || loadingBranches}
                style={{ ...inputStyle, width: 160 }}
              >
                {loadingBranches && <option value="">{t("common.loading")}</option>}
                {!loadingBranches && branches.length === 0 && <option value="">—</option>}
                {branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <button
                className="btn btn-bark"
                onClick={scan}
                disabled={!selectedRepo || scanning}
                style={{ minHeight: 44, padding: "0 20px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                {scanning ? <><RefreshCw size={16} className="spin" /> {t("memory.scanning")}</> : t("memory.scan")}
              </button>
            </div>
          )}
          {scanError && <p style={{ color: "var(--clay)", marginTop: 8, fontSize: "0.85rem" }}>{scanError}</p>}
        </div>
      </section>
    );
  }

  // File editor view
  if (activeFile) {
    const sections = parseMemorySections(getContent(activeFile));
    const fileTarget = TARGETS.find((t) => {
      const p = MEMORY_PATHS[t];
      return activeFile === p.root || activeFile.startsWith(p.dir + "/");
    });

    return (
      <section>
        <button
          className="btn btn-ghost"
          onClick={() => { setActiveFile(null); setSyncSource(null); }}
          style={{ marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.85rem" }}
        >
          <ChevronLeft size={14} /> {t("memory.back")}
        </button>

        <h2 style={{ fontSize: "1.1rem", marginBottom: 16 }}>
          {activeFile}
          {isModified(activeFile) && <span style={modBadge}>{t("memory.modified")}</span>}
          {isNew(activeFile) && <span style={newBadge}>{t("memory.added")}</span>}
        </h2>

        {sections.map((sec, i) => (
          <div key={i} className="card" style={{ padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                {sec.heading ? `## ${sec.heading}` : t("memory.rootSection")}
              </span>
              <button
                className="btn btn-ghost"
                style={{ fontSize: "0.8rem", padding: "2px 8px" }}
                onClick={() => setSyncSource(syncSource?.index === i ? null : { index: i, heading: sec.heading, content: sec.content, targets: {} })}
              >
                <Copy size={13} style={{ marginRight: 4 }} />
                {t("memory.syncTo")}
              </button>
            </div>

            <textarea
              value={sec.content}
              onChange={(e) => {
                const updated = [...sections];
                updated[i] = { ...sec, content: e.target.value };
                setContent(activeFile, renderSections(updated));
              }}
              style={{ ...inputStyle, width: "100%", minHeight: 120, padding: 10, fontFamily: "monospace", fontSize: "0.82rem", resize: "vertical" }}
            />

            {syncSource?.index === i && (
              <div style={{ marginTop: 8, padding: 10, background: "var(--cream)", borderRadius: 8 }}>
                <p style={{ fontSize: "0.82rem", marginBottom: 6, color: "var(--text-muted)" }}>{t("memory.syncTargets")}</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  {TARGETS.filter((t) => t !== fileTarget).map((target) => (
                    <label key={target} style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={!!syncSource.targets[target]}
                        onChange={(e) => setSyncSource({
                          ...syncSource,
                          targets: { ...syncSource.targets, [target]: e.target.checked },
                        })}
                      />
                      {TARGET_LABELS[target]}
                    </label>
                  ))}
                  <button
                    className="btn btn-bark"
                    style={{ fontSize: "0.8rem", padding: "4px 12px", minHeight: 32 }}
                    disabled={!Object.values(syncSource.targets).some(Boolean)}
                    onClick={() => syncSection(sec.content, sec.heading, fileTarget)}
                  >
                    <Check size={13} style={{ marginRight: 4 }} />
                    {t("memory.syncTo")}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        <button
          className="btn btn-ghost"
          onClick={() => {
            const updated = [...sections, { heading: "New Section", content: "" }];
            setContent(activeFile, renderSections(updated));
          }}
          style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          <Plus size={14} /> {t("memory.newSection")}
        </button>
      </section>
    );
  }

  // Dashboard view
  return (
    <section>
      {/* Repo bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{selectedRepo}</span>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>({scannedBranch})</span>
        <button
          className="btn btn-ghost"
          onClick={() => { setMemoryFiles(null); setEditedFiles({}); setPublishResult(null); }}
          style={{ fontSize: "0.8rem", marginLeft: "auto" }}
        >
          {t("memory.selectRepo")}
        </button>
        <button
          className="btn btn-ghost"
          onClick={scan}
          disabled={scanning}
          style={{ fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          <RefreshCw size={13} /> {t("memory.scan")}
        </button>
      </div>

      {/* Target columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 20 }}>
        {TARGETS.map((target) => {
          const files = filesByTarget[target] || [];
          const rootFile = files.find((f) => f.isRoot);
          const named = files.filter((f) => !f.isRoot);
          const sharedTargets = rootFile ? SHARED_ROOTS[rootFile.path] : null;

          return (
            <div key={target} className="card" style={{ padding: 14, display: "flex", flexDirection: "column" }}>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 10 }}>
                {TARGET_LABELS[target]}
              </div>

              {/* Root memory */}
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {t("memory.rootMemory")}
                </p>
                {rootFile ? (
                  <button
                    className="btn btn-ghost"
                    onClick={() => setActiveFile(rootFile.path)}
                    style={{ ...fileBtn, width: "100%" }}
                  >
                    <span style={{ fontWeight: 600 }}>{rootFile.path}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      {parseMemorySections(getContent(rootFile.path)).length} {t("memory.sections")}
                    </span>
                    {sharedTargets && sharedTargets.length > 1 && (
                      <span style={sharedBadge}>{t("memory.shared")}: {sharedTargets.map((t) => TARGET_LABELS[t]).join(" + ")}</span>
                    )}
                    {isModified(rootFile.path) && <span style={modBadge}>{t("memory.modified")}</span>}
                  </button>
                ) : (
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                    {t("memory.notFound")}
                  </span>
                )}
              </div>

              {/* Named memories — flex: 1 so this section stretches and pins the button to the bottom */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {t("memory.namedMemories")}
                </p>
                <div style={{ flex: 1 }}>
                  {named.map((f) => (
                    <button
                      key={f.path}
                      className="btn btn-ghost"
                      onClick={() => setActiveFile(f.path)}
                      style={{ ...fileBtn, width: "100%", marginBottom: 4 }}
                    >
                      <span>{f.slug || f.path}</span>
                      {isModified(f.path) && <span style={modBadge}>{t("memory.modified")}</span>}
                      {isNew(f.path) && <span style={newBadge}>{t("memory.added")}</span>}
                    </button>
                  ))}
                </div>

                {/* Create new — always at the bottom */}
                <div style={{ marginTop: 8, borderTop: "1px solid var(--line)", paddingTop: 8 }}>
                  {newFileTarget === target ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        value={newSlug}
                        onChange={(e) => setNewSlug(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && createNewFile(target)}
                        placeholder={t("memory.newSlug")}
                        style={{ ...inputStyle, flex: 1, fontSize: "0.82rem", minHeight: 32, padding: "0 8px" }}
                        autoFocus
                      />
                      <button className="btn btn-bark" onClick={() => createNewFile(target)} style={{ minHeight: 32, padding: "0 10px", fontSize: "0.8rem" }}>
                        <Plus size={13} />
                      </button>
                      <button className="btn btn-ghost" onClick={() => { setNewFileTarget(null); setNewSlug(""); }} style={{ minHeight: 32, padding: "0 8px", fontSize: "0.8rem" }}>
                        ×
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-ghost"
                      onClick={() => setNewFileTarget(target)}
                      style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 4, width: "100%", justifyContent: "center", padding: "6px 0" }}
                    >
                      <Plus size={14} /> {t("memory.createNew")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No files at all */}
      {memoryFiles.length === 0 && Object.keys(editedFiles).length === 0 && (
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
          {t("memory.noFiles")}
        </div>
      )}

      {/* Publish panel */}
      <div className="card" style={{ padding: 16 }}>
        <p style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 10 }}>
          <Upload size={16} style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />
          {t("memory.publish")}
        </p>

        {changedFiles.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{t("memory.noChanges")}</p>
        ) : (
          <>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 8 }}>
              {t("memory.changedFiles")}: {changedFiles.length}
            </p>

            <ul style={{ listStyle: "none", padding: 0, marginBottom: 10 }}>
              {changedFiles.map((f) => (
                <li key={f.path} style={{ fontSize: "0.85rem", padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "monospace" }}>{f.path}</span>
                  {f.isNew ? <span style={newBadge}>{t("memory.added")}</span> : <span style={modBadge}>{t("memory.modified")}</span>}
                </li>
              ))}
            </ul>

            <button
              className="btn btn-ghost"
              onClick={() => setShowDiff(!showDiff)}
              style={{ fontSize: "0.82rem", marginBottom: 10 }}
            >
              {showDiff ? t("memory.hideDiff") : t("memory.previewDiff")}
            </button>

            {showDiff && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                {changedFiles.map((f) => (
                  <DiffPreview key={f.path} original={f.original} modified={f.content} path={f.path} />
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <input
                value={commitMsg}
                onChange={(e) => setCommitMsg(e.target.value)}
                placeholder={t("memory.defaultCommitMsg")}
                style={{ ...inputStyle, flex: 1, minWidth: 200 }}
              />
              <button
                className="btn btn-bark"
                onClick={publish}
                disabled={publishing}
                style={{ minHeight: 44, padding: "0 20px" }}
              >
                {publishing ? t("memory.publishing") : t("memory.publish")}
              </button>
            </div>
          </>
        )}

        {publishError && <p style={{ color: "var(--clay)", marginTop: 8, fontSize: "0.85rem" }}>{publishError}</p>}
        {publishResult && (
          <p style={{ color: "var(--leaf, #2a7a2a)", marginTop: 8, fontSize: "0.85rem" }}>
            {t("memory.publishSuccess")} —{" "}
            <a href={publishResult.commit} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
              {publishResult.branch}
            </a>
          </p>
        )}
      </div>
    </section>
  );
}

const inputStyle = {
  minHeight: 44,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid var(--line)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: "0.95rem",
};

const fileBtn = {
  textAlign: "left",
  padding: "8px 10px",
  display: "flex",
  flexDirection: "column",
  gap: 2,
  borderRadius: 6,
};

const modBadge = {
  display: "inline-block",
  background: "rgba(200,140,40,0.15)",
  color: "#b8860b",
  fontSize: "0.7rem",
  padding: "1px 6px",
  borderRadius: 4,
  marginLeft: 6,
};

const newBadge = {
  display: "inline-block",
  background: "rgba(60,140,60,0.15)",
  color: "#2a7a2a",
  fontSize: "0.7rem",
  padding: "1px 6px",
  borderRadius: 4,
  marginLeft: 6,
};

const sharedBadge = {
  display: "inline-block",
  background: "var(--cream)",
  border: "1px solid var(--line)",
  fontSize: "0.68rem",
  padding: "1px 6px",
  borderRadius: 4,
};
