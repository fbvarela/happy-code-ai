"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Download, Plus, X, ArrowLeft } from "lucide-react";
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

  // Generation (new mode) + publish (edit mode) state.
  const [genPrompt, setGenPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [local, setLocal] = useState({ enabled: false, baseUrl: LOCAL_DEFAULTS.baseUrl, model: LOCAL_DEFAULTS.model });
  const [pub, setPub] = useState({ repos: null, repo: "", branch: "", path: "", openPr: false, busy: false, result: null, error: null });

  // New mode: if a suggestion was picked in the gallery, pre-fill from it once.
  useEffect(() => {
    if (!isNew) return;
    let raw;
    try {
      raw = sessionStorage.getItem("hc:suggestion");
      if (raw) sessionStorage.removeItem("hc:suggestion");
    } catch {
      return;
    }
    if (!raw) return;
    try {
      const a = JSON.parse(raw);
      setForm({
        name: a.name || "",
        type: a.type || "agent",
        target: a.target || "opencode",
        frontmatterText: JSON.stringify(a.frontmatter ?? {}, null, 2),
        body_template: a.body_template ?? "",
        variables: a.variables ?? [],
        files: a.files ?? [],
        tags: a.tags ?? [],
      });
      setValues({});
    } catch {}
  }, [isNew]);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const res = await fetch(`/api/artifacts/${id}`);
      if (!res.ok) {
        setError("No se pudo cargar el artefacto.");
        setLoading(false);
        return;
      }
      const a = await res.json();
      setForm({
        name: a.name,
        type: a.type,
        target: a.target,
        frontmatterText: JSON.stringify(a.frontmatter ?? {}, null, 2),
        body_template: a.body_template ?? "",
        variables: a.variables ?? [],
        files: a.files ?? [],
        tags: a.tags ?? [],
      });
      setLoading(false);
    })();
  }, [id, isNew]);

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  function applyScaffold(type) {
    const s = TYPE_SCAFFOLDS[type];
    if (!s) return;
    setForm((f) => ({
      ...f,
      body_template: s.body,
      variables: s.variables.map((v) => ({ ...v })),
      frontmatterText: JSON.stringify(s.frontmatter ?? {}, null, 2),
    }));
    setValues({});
  }

  function onChangeType(type) {
    // Auto-apply a starter scaffold only when the body is still empty,
    // so we never clobber the user's work.
    if (TYPE_SCAFFOLDS[type] && !form.body_template.trim()) {
      applyScaffold(type);
      setForm((f) => ({ ...f, type }));
    } else {
      set("type", type);
    }
  }

  // ── Variable editor ──
  function addVar() {
    set("variables", [...form.variables, { name: "", label: "", default: "", required: false }]);
  }
  function updateVar(i, key, val) {
    const next = form.variables.map((v, j) => (j === i ? { ...v, [key]: val } : v));
    set("variables", next);
  }
  function removeVar(i) {
    set("variables", form.variables.filter((_, j) => j !== i));
  }

  // ── Generate from natural language (new mode) ──
  async function generate() {
    if (!genPrompt.trim()) return;
    setGenerating(true);
    setError(null);

    let draft;
    try {
      if (local.enabled) {
        // Browser → user's own model. Zero API tokens.
        draft = await generateArtifactLocal({
          prompt: genPrompt, type: form.type, target: form.target,
          baseUrl: local.baseUrl, model: local.model,
        });
      } else {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: genPrompt, type: form.type, target: form.target }),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || t("editor.errGenerate"));
        }
        draft = (await res.json()).draft;
      }
    } catch (e) {
      setGenerating(false);
      setError(e.message || t("editor.errGenerate"));
      return;
    }
    setGenerating(false);
    setForm({
      name: draft.name || "",
      type: draft.type || form.type,
      target: draft.target || form.target,
      frontmatterText: JSON.stringify(draft.frontmatter ?? {}, null, 2),
      body_template: draft.body_template ?? "",
      variables: draft.variables ?? [],
      files: form.files,
      tags: draft.tags ?? [],
    });
    setValues({});
  }

  // ── Extra files editor ──
  function addFile() {
    set("files", [...form.files, { path: "", body_template: "" }]);
  }
  function updateFile(i, key, val) {
    set("files", form.files.map((f, j) => (j === i ? { ...f, [key]: val } : f)));
  }
  function removeFile(i) {
    set("files", form.files.filter((_, j) => j !== i));
  }

  // ── Publish to GitHub (edit mode) ──
  async function loadRepos() {
    if (pub.repos) return;
    const res = await fetch("/api/repos");
    const repos = res.ok ? await res.json() : [];
    setPub((p) => ({ ...p, repos, repo: repos[0]?.full_name || "" }));
  }
  async function publish() {
    setPub((p) => ({ ...p, busy: true, error: null, result: null }));
    const res = await fetch(`/api/artifacts/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repo: pub.repo,
        branch: pub.branch || undefined,
        path: pub.path || undefined,
        values,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPub((p) => ({ ...p, busy: false, error: data.message || data.error || "Error al publicar" }));
      return;
    }
    setPub((p) => ({ ...p, busy: false, result: data }));
  }
  async function testPublish() {
    setPub((p) => ({ ...p, busy: true, error: null, result: null }));
    const res = await fetch(`/api/artifacts/${id}/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo: pub.repo, openPr: pub.openPr, values }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPub((p) => ({ ...p, busy: false, error: data.message || data.error || "Error al probar" }));
      return;
    }
    setPub((p) => ({ ...p, busy: false, result: { ...data, test: true } }));
  }

  // ── Download rendered files locally (0 tokens, fully client-side) ──
  function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  /** asZip=false: download the single primary file by its basename.
   *  asZip=true: download a .zip preserving the full .opencode/... paths. */
  function download(asZip) {
    setError(null);
    let artifact;
    try {
      artifact = buildPayload();
    } catch (e) {
      setError(e.message);
      return;
    }
    if (!artifact.name) {
      setError(t("editor.errNameDownload"));
      return;
    }
    const { files } = getRenderer(artifact.target).render(artifact, values);
    const slug = artifact.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "artifact";
    if (asZip || files.length > 1) {
      downloadBlob(`${slug}.zip`, makeZip(files));
    } else {
      const base = files[0].path.split("/").pop();
      downloadBlob(base, new Blob([files[0].content], { type: "text/plain;charset=utf-8" }));
    }
  }

  // ── Live preview (0 tokens, client-side) — reuses the real renderer so the
  // preview matches the actual file(s) produced by download/publish (frontmatter
  // block included for markdown types, plus any extra files).
  const preview = useMemo(() => {
    let frontmatter;
    try {
      frontmatter = JSON.parse(form.frontmatterText || "{}");
    } catch {
      return { ok: false, text: t("editor.errFrontmatter") };
    }
    const artifact = {
      name: form.name.trim() || "ejemplo",
      type: form.type,
      target: form.target.trim() || "opencode",
      frontmatter,
      body_template: form.body_template,
      variables: form.variables,
      files: form.files.filter((f) => f.path.trim()),
      tags: form.tags,
    };
    try {
      const { files } = getRenderer(artifact.target).render(artifact, values);
      const text = files.length > 1
        ? files.map((f) => `# ${f.path}\n${f.content}`).join("\n\n")
        : files[0]?.content ?? "";
      return { ok: true, text };
    } catch (e) {
      return { ok: false, text: String(e.message || e) };
    }
  }, [form.frontmatterText, form.name, form.type, form.target, form.body_template, form.variables, form.files, values, t]);

  // Real destination path + format for the selected target/type, derived from
  // the renderer so the help stays accurate as targets grow.
  const helpInfo = useMemo(() => {
    const meta = TYPE_HELP[form.type];
    if (!meta) return null;
    let path = "";
    try {
      path = getRenderer(form.target).render(
        { type: form.type, name: form.name || "ejemplo", target: form.target, frontmatter: {}, body_template: "", variables: [], files: [] },
        {},
      ).path;
    } catch {}
    const ext = path.split(".").pop();
    return { ...meta, path, format: FORMAT_BY_EXT[ext] || "Texto" };
  }, [form.type, form.target, form.name]);

  function buildPayload() {
    let frontmatter;
    try {
      frontmatter = JSON.parse(form.frontmatterText || "{}");
    } catch {
      throw new Error(t("editor.errFrontmatter"));
    }
    return {
      name: form.name.trim(),
      type: form.type,
      target: form.target.trim() || "opencode",
      frontmatter,
      body_template: form.body_template,
      variables: form.variables.filter((v) => v.name.trim()),
      files: form.files.filter((f) => f.path.trim()),
      tags: form.tags,
    };
  }

  async function save() {
    setError(null);
    let payload;
    try {
      payload = buildPayload();
    } catch (e) {
      setError(e.message);
      return;
    }
    if (!payload.name) {
      setError(t("editor.errName"));
      return;
    }
    setSaving(true);
    const res = await fetch(isNew ? "/api/artifacts" : `/api/artifacts/${id}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      setError(t("editor.errSave"));
      return;
    }
    const saved = await res.json();
    if (isNew) router.replace(`/artifacts/${saved.id}`);
    else router.refresh();
  }

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Cargando…</p>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
      {/* ── Form column ── */}
      <div style={{ display: "grid", gap: 14 }}>
        {isNew && (
          <div className="card" style={{ padding: 14, background: "var(--cream)" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 6 }}>{t("editor.aiGenerate")}</div>
            <textarea
              style={{ ...input, minHeight: 60 }}
              value={genPrompt}
              onChange={(e) => setGenPrompt(e.target.value)}
              placeholder={t("editor.aiPromptPlaceholder")}
            />
            <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <input type="checkbox" checked={local.enabled} onChange={(e) => setLocal((l) => ({ ...l, enabled: e.target.checked }))} />
              {t("editor.useLocalModel")}
            </label>
            {local.enabled && (
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <input style={{ ...input, minHeight: 36, fontSize: "0.8rem" }} value={local.baseUrl} onChange={(e) => setLocal((l) => ({ ...l, baseUrl: e.target.value }))} placeholder="http://localhost:11434/v1" />
                <input style={{ ...input, minHeight: 36, fontSize: "0.8rem" }} value={local.model} onChange={(e) => setLocal((l) => ({ ...l, model: e.target.value }))} placeholder="qwen2.5-coder" />
              </div>
            )}
            <button className="btn btn-bark" type="button" onClick={generate} disabled={generating} style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={16} /> {generating ? t("editor.generating") : t("editor.generateDraft")}
            </button>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 6 }}>
              {t("editor.aiHint")}
              {local.enabled && ` ${t("editor.aiHintLocal")}`}
            </p>
          </div>
        )}

        <Field label={t("editor.name")}>
          <input style={input} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="test-writer" />
        </Field>

        <div style={{ display: "flex", gap: 12 }}>
          <Field label={t("editor.type")}>
            <select style={input} value={form.type} onChange={(e) => onChangeType(e.target.value)}>
              {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label={t("editor.target")}>
            <select style={input} value={form.target} onChange={(e) => set("target", e.target.value)}>
              {TARGETS.map((tg) => <option key={tg} value={tg}>{TARGET_LABELS[tg]}</option>)}
            </select>
          </Field>
        </div>

        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => setShowHelp((s) => !s)}
          aria-expanded={showHelp}
          style={{ minHeight: 32, padding: "0 12px", fontSize: "0.8rem", justifySelf: "start" }}
        >
          {showHelp ? t("editor.hideHelp") : t("editor.howToUse", { type: TYPE_LABELS[form.type] })}
        </button>

        {showHelp && helpInfo && (
          <div className="card" style={{ padding: 14, background: "var(--cream)", fontSize: "0.85rem", lineHeight: 1.5 }}>
            <p style={{ margin: "0 0 8px" }}>{helpInfo.what}</p>
            <p style={{ margin: "0 0 4px" }}>
              <strong>{t("editor.fileIn", { target: TARGET_LABELS[form.target] })}</strong> <code>{helpInfo.path}</code>
            </p>
            <p style={{ margin: "0 0 8px" }}>
              <strong>{t("editor.format")}</strong> {helpInfo.format}
            </p>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>{helpInfo.usage}</p>
          </div>
        )}

        {TYPE_SCAFFOLDS[form.type] && (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => applyScaffold(form.type)}
            style={{ minHeight: 36, padding: "0 12px", fontSize: "0.85rem", justifySelf: "start" }}
          >
            {t("editor.useTemplate", { type: TYPE_LABELS[form.type] })}
          </button>
        )}

        <Field label={t("editor.tags")}>
          <input
            style={input}
            value={form.tags.join(", ")}
            onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
            placeholder={t("editor.tagsPlaceholder")}
          />
        </Field>

        <Field label={t("editor.frontmatter")}>
          <textarea style={{ ...input, minHeight: 90, fontFamily: "monospace" }} value={form.frontmatterText} onChange={(e) => set("frontmatterText", e.target.value)} />
        </Field>

        <Field label={t("editor.body")}>
          <textarea style={{ ...input, minHeight: 180, fontFamily: "monospace" }} value={form.body_template} onChange={(e) => set("body_template", e.target.value)} />
        </Field>
        <TokenMeter body={form.body_template} target={form.target} />

        {/* Variables */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <strong style={{ fontSize: "0.9rem" }}>{t("editor.variables")}</strong>
            <button className="btn btn-ghost" type="button" onClick={addVar} style={{ minHeight: 32, padding: "0 10px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}><Plus size={14} /> {t("common.add")}</button>
          </div>
          {form.variables.length === 0 && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t("editor.noVariables")}</p>}
          {form.variables.map((v, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <input style={{ ...input, flex: 1 }} placeholder={t("editor.varName")} value={v.name} onChange={(e) => updateVar(i, "name", e.target.value)} />
              <input style={{ ...input, flex: 1 }} placeholder={t("editor.varDefault")} value={v.default} onChange={(e) => updateVar(i, "default", e.target.value)} />
              <button className="btn btn-ghost" type="button" onClick={() => removeVar(i)} aria-label="Quitar variable" style={{ minHeight: 44, padding: "0 10px" }}><X size={16} /></button>
            </div>
          ))}
        </div>

        {/* Extra files (e.g. a skill's helper files) */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <strong style={{ fontSize: "0.9rem" }}>{t("editor.extraFiles")}</strong>
            <button className="btn btn-ghost" type="button" onClick={addFile} style={{ minHeight: 32, padding: "0 10px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}><Plus size={14} /> {t("common.add")}</button>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 6 }}>
            {t("editor.extraFilesHint")}
          </p>
          {form.files.map((f, i) => (
            <div key={i} style={{ display: "grid", gap: 4, marginBottom: 8, border: "1px solid var(--line)", borderRadius: 8, padding: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <input style={{ ...input, flex: 1, minHeight: 36 }} placeholder={t("editor.filePathPlaceholder")} value={f.path} onChange={(e) => updateFile(i, "path", e.target.value)} />
                <button className="btn btn-ghost" type="button" onClick={() => removeFile(i)} aria-label="Quitar archivo" style={{ minHeight: 36, padding: "0 10px" }}><X size={16} /></button>
              </div>
              <textarea style={{ ...input, minHeight: 70, fontFamily: "monospace" }} placeholder={t("editor.fileBodyPlaceholder")} value={f.body_template} onChange={(e) => updateFile(i, "body_template", e.target.value)} />
            </div>
          ))}
        </div>

        {error && <p style={{ color: "var(--clay)", fontSize: "0.9rem" }}>{error}</p>}

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-bark" type="button" onClick={save} disabled={saving}>
            {saving ? t("common.saving") : isNew ? t("editor.create") : t("common.save")}
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => router.push("/")} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ArrowLeft size={16} /> {t("nav.back")}</button>
        </div>
      </div>

      {/* ── Preview column ── */}
      <div className="card" style={{ padding: 16, position: "sticky", top: 20 }}>
        <strong style={{ fontSize: "0.9rem" }}>{t("editor.preview")}</strong>
        {form.variables.length > 0 && (
          <div style={{ display: "grid", gap: 6, margin: "10px 0" }}>
            {form.variables.filter((v) => v.name).map((v, i) => (
              <label key={i} style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {v.label || v.name}
                <input
                  style={{ ...input, marginTop: 2 }}
                  value={values[v.name] ?? ""}
                  placeholder={v.default}
                  onChange={(e) => setValues((s) => ({ ...s, [v.name]: e.target.value }))}
                />
              </label>
            ))}
          </div>
        )}
        <pre style={{
          marginTop: 10, background: "var(--cream)", border: "1px solid var(--line)", borderRadius: 8,
          padding: 12, fontSize: "0.8rem", whiteSpace: "pre-wrap", wordBreak: "break-word",
          color: preview.ok ? "var(--text)" : "var(--clay)", maxHeight: 420, overflow: "auto",
        }}>
          {preview.text || t("editor.empty")}
        </pre>

        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn btn-ghost" type="button" onClick={() => download(false)} style={{ minHeight: 36, padding: "0 12px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Download size={15} /> {form.files.some((f) => f.path.trim()) ? t("editor.downloadZip") : t("editor.downloadFile")}
          </button>
          {!form.files.some((f) => f.path.trim()) && (
            <button className="btn btn-ghost" type="button" onClick={() => download(true)} style={{ minHeight: 36, padding: "0 12px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Download size={15} /> {t("editor.zipWithPath")}
            </button>
          )}
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {t("editor.renderedNote")}
          </span>
        </div>

        <PromptChecklist body={form.body_template} />

        {!isNew && (
          <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
            <strong style={{ fontSize: "0.9rem" }}>{t("editor.publishGithub")}</strong>
            {pub.repos === null ? (
              <div style={{ marginTop: 8 }}>
                <button className="btn btn-ghost" type="button" onClick={loadRepos} style={{ minHeight: 36, padding: "0 12px", fontSize: "0.85rem" }}>
                  {t("editor.loadRepos")}
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                <select style={input} value={pub.repo} onChange={(e) => setPub((p) => ({ ...p, repo: e.target.value }))}>
                  {pub.repos.map((r) => <option key={r.full_name} value={r.full_name}>{r.full_name}{r.private ? " (private)" : ""}</option>)}
                </select>
                <input style={input} placeholder={t("editor.branchPlaceholder")} value={pub.branch} onChange={(e) => setPub((p) => ({ ...p, branch: e.target.value }))} />
                <input style={input} placeholder={t("editor.pathPlaceholder")} value={pub.path} onChange={(e) => setPub((p) => ({ ...p, path: e.target.value }))} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-bark" type="button" onClick={publish} disabled={pub.busy || !pub.repo} style={{ flex: 1 }}>
                    {pub.busy ? "…" : t("editor.publish")}
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={testPublish} disabled={pub.busy || !pub.repo} style={{ flex: 1 }}>
                    {pub.busy ? "…" : t("editor.testBranch")}
                  </button>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <input type="checkbox" checked={pub.openPr} onChange={(e) => setPub((p) => ({ ...p, openPr: e.target.checked }))} />
                  {t("editor.openPr")}
                </label>
                {pub.error && <p style={{ color: "var(--clay)", fontSize: "0.8rem" }}>{pub.error}</p>}
                {pub.result && (
                  <p style={{ fontSize: "0.8rem" }}>
                    ✓ <code>{pub.result.path}</code>
                    {pub.result.branch && <> — rama <code>{pub.result.branch}</code></>}
                    {pub.result.commit && <> — <a href={pub.result.commit} target="_blank" rel="noreferrer">ver commit</a></>}
                    {pub.result.prUrl && <> — <a href={pub.result.prUrl} target="_blank" rel="noreferrer">ver PR</a></>}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      {children}
    </label>
  );
}

const input = {
  width: "100%",
  minHeight: 44,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid var(--line)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: "0.95rem",
};
