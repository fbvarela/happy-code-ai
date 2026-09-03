"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Download, Plus, X, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { ARTIFACT_TYPES, TYPE_SCAFFOLDS } from "@/lib/artifact-types";
import { TARGETS, TARGET_LABELS } from "@/lib/targets";
import { TYPE_HELP, FORMAT_BY_EXT } from "@/lib/artifact-help";
import { getRenderer } from "@/lib/renderers";
import { makeZip } from "@/lib/zip";
import { generateArtifactLocal, LOCAL_DEFAULTS } from "@/lib/local-generate";
import { useI18n, TYPE_LABELS_I18N } from "@/lib/i18n";
import PromptChecklist from "@/components/PromptChecklist";
import TokenMeter from "@/components/TokenMeter";

const EMPTY = {
  name: "",
  type: "agent",
  target: "opencode",
  frontmatterText: "{}",
  body_template: "",
  variables: [],
  files: [],
  tags: [],
};

const compactInput = {
  width: "100%",
  minHeight: 34,
  padding: "0 10px",
  borderRadius: 6,
  border: "1px solid var(--line)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: "0.88rem",
  fontFamily: "inherit",
};

export default function ArtifactEditor({ id }) {
  const router = useRouter();
  const { t, lang } = useI18n();
  const TYPE_LABELS = TYPE_LABELS_I18N[lang] || TYPE_LABELS_I18N.es;
  const TYPES = ARTIFACT_TYPES.map((v) => [v, TYPE_LABELS[v]]);
  const isNew = !id;
  const [form, setForm] = useState(EMPTY);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [aiOpen, setAiOpen] = useState(isNew);

  const [genPrompt, setGenPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [local, setLocal] = useState({ enabled: false, baseUrl: LOCAL_DEFAULTS.baseUrl, model: LOCAL_DEFAULTS.model });
  const [pub, setPub] = useState({ repos: null, repo: "", branch: "", path: "", openPr: false, busy: false, result: null, error: null });

  useEffect(() => {
    if (!isNew) return;
    let raw;
    try { raw = sessionStorage.getItem("hc:suggestion"); if (raw) sessionStorage.removeItem("hc:suggestion"); } catch {}
    if (!raw) return;
    try {
      const a = JSON.parse(raw);
      setForm({ name: a.name || "", type: a.type || "agent", target: a.target || "opencode", frontmatterText: JSON.stringify(a.frontmatter ?? {}, null, 2), body_template: a.body_template ?? "", variables: a.variables ?? [], files: a.files ?? [], tags: a.tags ?? [] });
      setValues({});
    } catch {}
  }, [isNew]);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const res = await fetch(`/api/artifacts/${id}`);
      if (!res.ok) { setError("No se pudo cargar el artefacto."); setLoading(false); return; }
      const a = await res.json();
      setForm({ name: a.name, type: a.type, target: a.target, frontmatterText: JSON.stringify(a.frontmatter ?? {}, null, 2), body_template: a.body_template ?? "", variables: a.variables ?? [], files: a.files ?? [], tags: a.tags ?? [] });
      setLoading(false);
    })();
  }, [id, isNew]);

  function set(field, val) { setForm((f) => ({ ...f, [field]: val })); }
  function applyScaffold(type) {
    const s = TYPE_SCAFFOLDS[type]; if (!s) return;
    setForm((f) => ({ ...f, body_template: s.body, variables: s.variables.map((v) => ({ ...v })), frontmatterText: JSON.stringify(s.frontmatter ?? {}, null, 2) }));
    setValues({});
  }
  function onChangeType(type) {
    if (TYPE_SCAFFOLDS[type] && !form.body_template.trim()) { applyScaffold(type); setForm((f) => ({ ...f, type })); } else { set("type", type); }
  }
  function addVar() { set("variables", [...form.variables, { name: "", label: "", default: "", required: false }]); }
  function updateVar(i, key, val) { set("variables", form.variables.map((v, j) => (j === i ? { ...v, [key]: val } : v))); }
  function removeVar(i) { set("variables", form.variables.filter((_, j) => j !== i)); }

  async function generate() {
    if (!genPrompt.trim()) return;
    setGenerating(true); setError(null);
    let draft;
    try {
      if (local.enabled) { draft = await generateArtifactLocal({ prompt: genPrompt, type: form.type, target: form.target, baseUrl: local.baseUrl, model: local.model }); }
      else {
        const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: genPrompt, type: form.type, target: form.target }) });
        if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || t("editor.errGenerate")); }
        draft = (await res.json()).draft;
      }
    } catch (e) { setGenerating(false); setError(e.message || t("editor.errGenerate")); return; }
    setGenerating(false);
    setForm({ name: draft.name || "", type: draft.type || form.type, target: draft.target || form.target, frontmatterText: JSON.stringify(draft.frontmatter ?? {}, null, 2), body_template: draft.body_template ?? "", variables: draft.variables ?? [], files: form.files, tags: draft.tags ?? [] });
    setValues({});
  }

  function addFile() { set("files", [...form.files, { path: "", body_template: "" }]); }
  function updateFile(i, key, val) { set("files", form.files.map((f, j) => (j === i ? { ...f, [key]: val } : f))); }
  function removeFile(i) { set("files", form.files.filter((_, j) => j !== i)); }

  async function loadRepos() {
    if (pub.repos) return;
    const res = await fetch("/api/repos"); const repos = res.ok ? await res.json() : [];
    setPub((p) => ({ ...p, repos, repo: repos[0]?.full_name || "" }));
  }
  async function publish() {
    setPub((p) => ({ ...p, busy: true, error: null, result: null }));
    const res = await fetch(`/api/artifacts/${id}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ repo: pub.repo, branch: pub.branch || undefined, path: pub.path || undefined, values }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setPub((p) => ({ ...p, busy: false, error: data.message || data.error || "Error al publicar" })); return; }
    setPub((p) => ({ ...p, busy: false, result: data }));
  }
  async function testPublish() {
    setPub((p) => ({ ...p, busy: true, error: null, result: null }));
    const res = await fetch(`/api/artifacts/${id}/test`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ repo: pub.repo, openPr: pub.openPr, values }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setPub((p) => ({ ...p, busy: false, error: data.message || data.error || "Error al probar" })); return; }
    setPub((p) => ({ ...p, busy: false, result: { ...data, test: true } }));
  }

  function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function download(asZip) {
    setError(null); let artifact;
    try { artifact = buildPayload(); } catch (e) { setError(e.message); return; }
    if (!artifact.name) { setError(t("editor.errNameDownload")); return; }
    const { files } = getRenderer(artifact.target).render(artifact, values);
    const slug = artifact.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "artifact";
    if (asZip || files.length > 1) { downloadBlob(`${slug}.zip`, makeZip(files)); }
    else { downloadBlob(files[0].path.split("/").pop(), new Blob([files[0].content], { type: "text/plain;charset=utf-8" })); }
  }

  const preview = useMemo(() => {
    let frontmatter;
    try { frontmatter = JSON.parse(form.frontmatterText || "{}"); } catch { return { ok: false, text: t("editor.errFrontmatter") }; }
    const artifact = { name: form.name.trim() || "ejemplo", type: form.type, target: form.target.trim() || "opencode", frontmatter, body_template: form.body_template, variables: form.variables, files: form.files.filter((f) => f.path.trim()), tags: form.tags };
    try {
      const { files } = getRenderer(artifact.target).render(artifact, values);
      const text = files.length > 1 ? files.map((f) => `# ${f.path}\n${f.content}`).join("\n\n") : files[0]?.content ?? "";
      return { ok: true, text };
    } catch (e) { return { ok: false, text: String(e.message || e) }; }
  }, [form.frontmatterText, form.name, form.type, form.target, form.body_template, form.variables, form.files, values, t]);

  const helpInfo = useMemo(() => {
    const meta = TYPE_HELP[form.type]; if (!meta) return null;
    let path = ""; try { path = getRenderer(form.target).render({ type: form.type, name: form.name || "ejemplo", target: form.target, frontmatter: {}, body_template: "", variables: [], files: [] }, {}).path; } catch {}
    const ext = path.split(".").pop();
    return { ...meta, path, format: FORMAT_BY_EXT[ext] || "Texto" };
  }, [form.type, form.target, form.name]);

  function buildPayload() {
    let frontmatter;
    try { frontmatter = JSON.parse(form.frontmatterText || "{}"); } catch { throw new Error(t("editor.errFrontmatter")); }
    return { name: form.name.trim(), type: form.type, target: form.target.trim() || "opencode", frontmatter, body_template: form.body_template, variables: form.variables.filter((v) => v.name.trim()), files: form.files.filter((f) => f.path.trim()), tags: form.tags };
  }

  async function save() {
    setError(null); let payload;
    try { payload = buildPayload(); } catch (e) { setError(e.message); return; }
    if (!payload.name) { setError(t("editor.errName")); return; }
    setSaving(true);
    const res = await fetch(isNew ? "/api/artifacts" : `/api/artifacts/${id}`, { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (!res.ok) { setError(t("editor.errSave")); return; }
    const saved = await res.json();
    if (isNew) router.replace(`/artifacts/${saved.id}`); else router.refresh();
  }

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Cargando…</p>;

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      {/* ── Form column ── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>

        {/* AI generate — collapsible */}
        {isNew && (
          <div style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
            <button onClick={() => setAiOpen((o) => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--cream)", border: "none", cursor: "pointer", fontSize: "0.88rem", fontWeight: 600, color: "var(--text)" }}>
              <span>{t("editor.aiGenerate")}</span>
              {aiOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {aiOpen && (
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <textarea style={{ ...compactInput, minHeight: 50, resize: "vertical" }} value={genPrompt} onChange={(e) => setGenPrompt(e.target.value)} placeholder={t("editor.aiPromptPlaceholder")} />
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  <input type="checkbox" checked={local.enabled} onChange={(e) => setLocal((l) => ({ ...l, enabled: e.target.checked }))} />
                  {t("editor.useLocalModel")}
                </label>
                {local.enabled && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <input style={{ ...compactInput, fontSize: "0.8rem" }} value={local.baseUrl} onChange={(e) => setLocal((l) => ({ ...l, baseUrl: e.target.value }))} placeholder="http://localhost:11434/v1" />
                    <input style={{ ...compactInput, fontSize: "0.8rem" }} value={local.model} onChange={(e) => setLocal((l) => ({ ...l, model: e.target.value }))} placeholder="qwen2.5-coder" />
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button className="btn btn-primary" type="button" onClick={generate} disabled={generating} style={{ padding: "0 12px", height: 32, fontSize: "0.85rem" }}>
                    <Sparkles size={14} /> {generating ? t("editor.generating") : t("editor.generateDraft")}
                  </button>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>{t("editor.aiHint")}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Basic fields — compact row layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>{t("editor.name")}</label>
            <input style={compactInput} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="test-writer" />
          </div>
          <div>
            <label style={labelStyle}>{t("editor.type")}</label>
            <select style={compactInput} value={form.type} onChange={(e) => onChangeType(e.target.value)}>
              {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t("editor.target")}</label>
            <select style={compactInput} value={form.target} onChange={(e) => set("target", e.target.value)}>
              {TARGETS.map((tg) => <option key={tg} value={tg}>{TARGET_LABELS[tg]}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t("editor.tags")}</label>
            <input style={compactInput} value={form.tags.join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} placeholder={t("editor.tagsPlaceholder")} />
          </div>
        </div>

        {/* Help + scaffold buttons */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button className="btn btn-ghost" type="button" onClick={() => setShowHelp((s) => !s)} style={{ padding: "0 10px", height: 30, fontSize: "0.8rem" }}>
            {showHelp ? t("editor.hideHelp") : t("editor.howToUse", { type: TYPE_LABELS[form.type] })}
          </button>
          {TYPE_SCAFFOLDS[form.type] && (
            <button className="btn btn-ghost" type="button" onClick={() => applyScaffold(form.type)} style={{ padding: "0 10px", height: 30, fontSize: "0.8rem" }}>
              {t("editor.useTemplate", { type: TYPE_LABELS[form.type] })}
            </button>
          )}
        </div>

        {showHelp && helpInfo && (
          <div style={{ padding: 10, background: "var(--cream)", borderRadius: 6, fontSize: "0.82rem", lineHeight: 1.5, border: "1px solid var(--line)" }}>
            <p style={{ margin: "0 0 4px" }}>{helpInfo.what}</p>
            <p style={{ margin: "0 0 4px" }}><strong>{t("editor.fileIn", { target: TARGET_LABELS[form.target] })}</strong> <code>{helpInfo.path}</code></p>
            <p style={{ margin: "0 0 4px" }}><strong>{t("editor.format")}</strong> {helpInfo.format}</p>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>{helpInfo.usage}</p>
          </div>
        )}

        {/* Frontmatter */}
        <div>
          <label style={labelStyle}>{t("editor.frontmatter")}</label>
          <textarea style={{ ...compactInput, minHeight: 56, fontFamily: "monospace", resize: "vertical" }} value={form.frontmatterText} onChange={(e) => set("frontmatterText", e.target.value)} />
        </div>

        {/* Body template */}
        <div>
          <label style={labelStyle}>{t("editor.body")}</label>
          <textarea style={{ ...compactInput, minHeight: 100, fontFamily: "monospace", resize: "vertical" }} value={form.body_template} onChange={(e) => set("body_template", e.target.value)} />
          <TokenMeter body={form.body_template} target={form.target} />
        </div>

        {/* Variables — compact list */}
        {form.variables.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)" }}>{t("editor.variables")}</span>
              <button className="btn btn-ghost" type="button" onClick={addVar} style={{ padding: "0 8px", height: 28, fontSize: "0.78rem" }}><Plus size={12} /> {t("common.add")}</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {form.variables.map((v, i) => (
                <div key={i} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <input style={{ ...compactInput, flex: 1, minHeight: 30, fontSize: "0.82rem" }} placeholder={t("editor.varName")} value={v.name} onChange={(e) => updateVar(i, "name", e.target.value)} />
                  <input style={{ ...compactInput, flex: 1, minHeight: 30, fontSize: "0.82rem" }} placeholder={t("editor.varDefault")} value={v.default} onChange={(e) => updateVar(i, "default", e.target.value)} />
                  <button className="btn btn-ghost" type="button" onClick={() => removeVar(i)} style={{ padding: "0 6px", height: 30 }}><X size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extra files */}
        {form.files.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)" }}>{t("editor.extraFiles")}</span>
              <button className="btn btn-ghost" type="button" onClick={addFile} style={{ padding: "0 8px", height: 28, fontSize: "0.78rem" }}><Plus size={12} /> {t("common.add")}</button>
            </div>
            {form.files.map((f, i) => (
              <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 8, marginBottom: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  <input style={{ ...compactInput, flex: 1, minHeight: 30, fontSize: "0.82rem" }} placeholder={t("editor.filePathPlaceholder")} value={f.path} onChange={(e) => updateFile(i, "path", e.target.value)} />
                  <button className="btn btn-ghost" type="button" onClick={() => removeFile(i)} style={{ padding: "0 6px", height: 30 }}><X size={13} /></button>
                </div>
                <textarea style={{ ...compactInput, minHeight: 50, fontFamily: "monospace", fontSize: "0.82rem" }} placeholder={t("editor.fileBodyPlaceholder")} value={f.body_template} onChange={(e) => updateFile(i, "body_template", e.target.value)} />
              </div>
            ))}
          </div>
        )}

        {error && <p style={{ color: "var(--clay)", fontSize: "0.85rem", margin: 0 }}>{error}</p>}

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" type="button" onClick={save} disabled={saving} style={{ height: 36, padding: "0 16px" }}>
            {saving ? t("common.saving") : isNew ? t("editor.create") : t("common.save")}
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => router.push("/")} style={{ height: 36, padding: "0 12px", fontSize: "0.85rem" }}><ArrowLeft size={14} /> {t("nav.back")}</button>
        </div>
      </div>

      {/* ── Preview sidebar ── */}
      <div style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10, position: "sticky", top: 0, maxHeight: "100%" }}>
        <div className="card" style={{ padding: 12, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)" }}>{t("editor.preview")}</div>

          {form.variables.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {form.variables.filter((v) => v.name).map((v, i) => (
                <div key={i}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 2 }}>{v.label || v.name}</span>
                  <input style={{ ...compactInput, minHeight: 30, fontSize: "0.82rem" }} value={values[v.name] ?? ""} placeholder={v.default} onChange={(e) => setValues((s) => ({ ...s, [v.name]: e.target.value }))} />
                </div>
              ))}
            </div>
          )}

          <pre style={{
            flex: 1, minHeight: 0, background: "var(--cream)", border: "1px solid var(--line)", borderRadius: 6,
            padding: 10, fontSize: "0.8rem", whiteSpace: "pre-wrap", wordBreak: "break-word",
            color: preview.ok ? "var(--text)" : "var(--clay)", overflow: "auto", margin: 0,
          }}>
            {preview.text || t("editor.empty")}
          </pre>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" type="button" onClick={() => download(false)} style={{ padding: "0 10px", height: 30, fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Download size={13} /> {form.files.some((f) => f.path.trim()) ? t("editor.downloadZip") : t("editor.downloadFile")}
            </button>
            {!form.files.some((f) => f.path.trim()) && (
              <button className="btn btn-ghost" type="button" onClick={() => download(true)} style={{ padding: "0 10px", height: 30, fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Download size={13} /> {t("editor.zipWithPath")}
              </button>
            )}
          </div>
          <PromptChecklist body={form.body_template} />

          {!isNew && (
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10, marginTop: 4 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)", marginBottom: 8 }}>{t("editor.publishGithub")}</div>
              {pub.repos === null ? (
                <button className="btn btn-ghost" type="button" onClick={loadRepos} style={{ padding: "0 10px", height: 30, fontSize: "0.82rem" }}>{t("editor.loadRepos")}</button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <select style={{ ...compactInput, minHeight: 30, fontSize: "0.82rem" }} value={pub.repo} onChange={(e) => setPub((p) => ({ ...p, repo: e.target.value }))}>
                    {pub.repos.map((r) => <option key={r.full_name} value={r.full_name}>{r.full_name}{r.private ? " (private)" : ""}</option>)}
                  </select>
                  <input style={{ ...compactInput, minHeight: 30, fontSize: "0.82rem" }} placeholder={t("editor.branchPlaceholder")} value={pub.branch} onChange={(e) => setPub((p) => ({ ...p, branch: e.target.value }))} />
                  <input style={{ ...compactInput, minHeight: 30, fontSize: "0.82rem" }} placeholder={t("editor.pathPlaceholder")} value={pub.path} onChange={(e) => setPub((p) => ({ ...p, path: e.target.value }))} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-primary" type="button" onClick={publish} disabled={pub.busy || !pub.repo} style={{ flex: 1, height: 30, fontSize: "0.82rem" }}>{pub.busy ? "…" : t("editor.publish")}</button>
                    <button className="btn btn-ghost" type="button" onClick={testPublish} disabled={pub.busy || !pub.repo} style={{ flex: 1, height: 30, fontSize: "0.82rem" }}>{pub.busy ? "…" : t("editor.testBranch")}</button>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <input type="checkbox" checked={pub.openPr} onChange={(e) => setPub((p) => ({ ...p, openPr: e.target.checked }))} />
                    {t("editor.openPr")}
                  </label>
                  {pub.error && <p style={{ color: "var(--clay)", fontSize: "0.78rem", margin: 0 }}>{pub.error}</p>}
                  {pub.result && (
                    <p style={{ fontSize: "0.78rem", margin: 0 }}>
                      ✓ <code>{pub.result.path}</code>
                      {pub.result.branch && <> — <code>{pub.result.branch}</code></>}
                      {pub.result.commit && <> — <a href={pub.result.commit} target="_blank" rel="noreferrer">commit</a></>}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = { fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 3 };
