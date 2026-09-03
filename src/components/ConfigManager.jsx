"use client";

import { useEffect, useMemo, useState } from "react";
import { Settings, RefreshCw, Upload, ChevronLeft } from "lucide-react";
import { TARGETS, TARGET_LABELS } from "@/lib/targets";
import { CONFIG_PATHS, getConfigPathsForTarget } from "@/lib/config-paths";
import { useI18n } from "@/lib/i18n";
import DiffPreview from "@/components/DiffPreview";

export default function ConfigManager() {
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
  const [configFiles, setConfigFiles] = useState(null);
  const [scannedBranch, setScannedBranch] = useState("");

  // ── Editing ──
  const [editedFiles, setEditedFiles] = useState({});
  const [activeFile, setActiveFile] = useState(null);

  // ── Publish ──
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [showDiff, setShowDiff] = useState(false);
  const [commitMsg, setCommitMsg] = useState("");

  useEffect(() => {
    fetch("/api/repos")
      .then((r) => (r.ok ? r.json() : []))
      .then(setRepos);
  }, []);

  useEffect(() => {
    if (!selectedRepo) { setBranches([]); setBranch(""); return; }
    setLoadingBranches(true);
    setBranches([]);
    setBranch("");
    fetch(`/api/repos/branches?repo=${encodeURIComponent(selectedRepo)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        setBranches(list);
        const repo = repos?.find((r) => r.full_name === selectedRepo);
        const def = repo?.default_branch || (list[0] ?? "");
        setBranch(def);
      })
      .finally(() => setLoadingBranches(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepo]);

  async function scan() {
    if (!selectedRepo || scanning) return;
    setScanning(true);
    setScanError(null);
    setConfigFiles(null);
    setEditedFiles({});
    setActiveFile(null);
    setPublishResult(null);
    setPublishError(null);
    try {
      const res = await fetch("/api/config/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: selectedRepo, branch: branch.trim() || undefined }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConfigFiles(data.files);
      setScannedBranch(data.branch);
    } catch {
      setScanError(t("config.errScan"));
    } finally {
      setScanning(false);
    }
  }

  function getContent(path) {
    if (path in editedFiles) return editedFiles[path];
    const f = configFiles?.find((f) => f.path === path);
    return f?.content || "";
  }

  function setContent(path, content) {
    setEditedFiles((prev) => ({ ...prev, [path]: content }));
  }

  function isModified(path) {
    if (!(path in editedFiles)) return false;
    const orig = configFiles?.find((f) => f.path === path);
    return editedFiles[path] !== (orig?.content || "");
  }

  function isNew(path) {
    return !configFiles?.some((f) => f.path === path);
  }

  const changedFiles = useMemo(() => {
    const result = [];
    for (const [path, content] of Object.entries(editedFiles)) {
      const orig = configFiles?.find((f) => f.path === path);
      if (!orig || orig.content !== content) {
        result.push({ path, content, original: orig?.content || "", isNew: !orig });
      }
    }
    return result;
  }, [editedFiles, configFiles]);

  function getTargetForPath(path) {
    for (const target of TARGETS) {
      const paths = getConfigPathsForTarget(target);
      if (paths.includes(path)) return target;
    }
    if (path === ".mcp.json") return "global";
    // Check MCP dirs
    for (const target of TARGETS) {
      const mcpDir = CONFIG_PATHS[target]?.mcpDir;
      if (mcpDir && path.startsWith(mcpDir)) return target;
    }
    return null;
  }

  const filesByTarget = useMemo(() => {
    const map = {};
    for (const target of TARGETS) map[target] = [];
    map["global"] = [];
    if (!configFiles) return map;
    for (const f of configFiles) {
      const target = f.target || "global";
      if (map[target]) map[target].push(f);
    }
    return map;
  }, [configFiles]);

  async function publish() {
    if (!changedFiles.length || publishing) return;
    setPublishing(true);
    setPublishError(null);
    setPublishResult(null);
    try {
      const res = await fetch("/api/config/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: selectedRepo,
          branch: scannedBranch,
          message: commitMsg.trim() || t("config.defaultCommitMsg"),
          files: changedFiles.map((f) => ({ path: f.path, content: f.content })),
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPublishResult(data);
      scan();
    } catch {
      setPublishError(t("config.errPublish"));
    } finally {
      setPublishing(false);
    }
  }

  if (!configFiles) {
    return (
      <section>
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: "0.95rem", marginBottom: 12, fontWeight: 600 }}>
            <Settings size={18} style={{ display: "inline", verticalAlign: "-3px", marginRight: 8 }} />
            {t("config.selectRepo")}
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
                className="btn btn-primary"
                onClick={scan}
                disabled={!selectedRepo || scanning}
                style={{ minHeight: 44, padding: "0 20px", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                {scanning ? <><RefreshCw size={16} className="spin" /> {t("config.scanning")}</> : t("config.scan")}
              </button>
            </div>
          )}
          {scanError && <p style={{ color: "var(--clay)", marginTop: 8, fontSize: "0.85rem" }}>{scanError}</p>}
        </div>
      </section>
    );
  }

  if (activeFile) {
    const target = getTargetForPath(activeFile);
    const isJson = activeFile.endsWith(".json");

    return (
      <section>
        <button
          className="btn btn-ghost"
          onClick={() => { setActiveFile(null); }}
          style={{ marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.85rem" }}
        >
          <ChevronLeft size={14} /> {t("config.back")}
        </button>

        <h2 style={{ fontSize: "1.1rem", marginBottom: 16 }}>
          {activeFile}
          {target && target !== "global" && (
            <span style={{ marginLeft: 8, fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 400 }}>
              {TARGET_LABELS[target]}
            </span>
          )}
          {isModified(activeFile) && <span style={modBadge}>{t("config.modified")}</span>}
          {isNew(activeFile) && <span style={newBadge}>{t("config.added")}</span>}
        </h2>

        <div className="card" style={{ padding: 14 }}>
          <textarea
            value={getContent(activeFile)}
            onChange={(e) => setContent(activeFile, e.target.value)}
            style={{
              ...inputStyle,
              width: "100%",
              minHeight: 300,
              padding: 10,
              fontFamily: "monospace",
              fontSize: "0.82rem",
              resize: "vertical",
              boxSizing: "border-box",
            }}
            placeholder={isJson ? "{\n  // JSON config\n}" : "# config"}
          />
        </div>
      </section>
    );
  }

  return (
    <section>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{selectedRepo}</span>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>({scannedBranch})</span>
        <button
          className="btn btn-ghost"
          onClick={() => { setConfigFiles(null); setEditedFiles({}); setPublishResult(null); }}
          style={{ fontSize: "0.8rem", marginLeft: "auto" }}
        >
          {t("config.selectRepo")}
        </button>
        <button
          className="btn btn-ghost"
          onClick={scan}
          disabled={scanning}
          style={{ fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          <RefreshCw size={13} /> {t("config.scan")}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, marginBottom: 20 }}>
        {TARGETS.map((target) => {
          const files = filesByTarget[target] || [];
          return (
            <div key={target} className="card" style={{ padding: 14, display: "flex", flexDirection: "column" }}>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 10 }}>
                {TARGET_LABELS[target]}
              </div>
              {files.length === 0 ? (
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
                  {t("config.notFound")}
                </p>
              ) : (
                files.map((f) => (
                  <button
                    key={f.path}
                    className="btn btn-ghost"
                    onClick={() => setActiveFile(f.path)}
                    style={{ ...fileBtn, width: "100%", marginBottom: 4, justifyContent: "flex-start" }}
                  >
                    <span style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>{f.path}</span>
                    {isModified(f.path) && <span style={modBadge}>{t("config.modified")}</span>}
                    {isNew(f.path) && <span style={newBadge}>{t("config.added")}</span>}
                  </button>
                ))
              )}
            </div>
          );
        })}

        {/* Global configs column */}
        <div className="card" style={{ padding: 14, display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 10 }}>
            {t("config.global")}
          </div>
          {(filesByTarget["global"] || []).length === 0 ? (
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
              {t("config.notFound")}
            </p>
          ) : (
            (filesByTarget["global"] || []).map((f) => (
              <button
                key={f.path}
                className="btn btn-ghost"
                onClick={() => setActiveFile(f.path)}
                style={{ ...fileBtn, width: "100%", marginBottom: 4, justifyContent: "flex-start" }}
              >
                <span style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>{f.path}</span>
                {isModified(f.path) && <span style={modBadge}>{t("config.modified")}</span>}
                {isNew(f.path) && <span style={newBadge}>{t("config.added")}</span>}
              </button>
            ))
          )}
        </div>
      </div>

      {configFiles.length === 0 && Object.keys(editedFiles).length === 0 && (
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
          {t("config.noFiles")}
        </div>
      )}

      <div className="card" style={{ padding: 16 }}>
        <p style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 10 }}>
          <Upload size={16} style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />
          {t("config.publish")}
        </p>

        {changedFiles.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{t("config.noChanges")}</p>
        ) : (
          <>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 8 }}>
              {t("config.changedFiles")}: {changedFiles.length}
            </p>

            <ul style={{ listStyle: "none", padding: 0, marginBottom: 10 }}>
              {changedFiles.map((f) => (
                <li key={f.path} style={{ fontSize: "0.85rem", padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "monospace" }}>{f.path}</span>
                  {f.isNew ? <span style={newBadge}>{t("config.added")}</span> : <span style={modBadge}>{t("config.modified")}</span>}
                </li>
              ))}
            </ul>

            <button
              className="btn btn-ghost"
              onClick={() => setShowDiff(!showDiff)}
              style={{ fontSize: "0.82rem", marginBottom: 10 }}
            >
              {showDiff ? t("config.hideDiff") : t("config.previewDiff")}
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
                placeholder={t("config.defaultCommitMsg")}
                style={{ ...inputStyle, flex: 1, minWidth: 200 }}
              />
              <button
                className="btn btn-primary"
                onClick={publish}
                disabled={publishing}
                style={{ minHeight: 44, padding: "0 20px" }}
              >
                {publishing ? t("config.publishing") : t("config.publish")}
              </button>
            </div>
          </>
        )}

        {publishError && <p style={{ color: "var(--clay)", marginTop: 8, fontSize: "0.85rem" }}>{publishError}</p>}
        {publishResult && (
          <p style={{ color: "var(--leaf, #2a7a2a)", marginTop: 8, fontSize: "0.85rem" }}>
            {t("config.publishSuccess")} —{" "}
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
