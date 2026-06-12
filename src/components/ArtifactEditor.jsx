"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { renderTemplate } from "@/lib/render";
import { ARTIFACT_TYPES, TYPE_LABELS, TYPE_SCAFFOLDS } from "@/lib/artifact-types";
import { generateArtifactLocal, LOCAL_DEFAULTS } from "@/lib/local-generate";

const TYPES = ARTIFACT_TYPES.map((v) => [v, TYPE_LABELS[v]]);

const EMPTY = {
  name: "",
  type: "agent",
  target: "opencode",
  frontmatterText: "{}",
  body_template: "",
  variables: [],
  tags: [],
};

export default function ArtifactEditor({ id }) {
  const router = useRouter();
  const isNew = !id;
  const [form, setForm] = useState(EMPTY);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Generation (new mode) + publish (edit mode) state.
  const [genPrompt, setGenPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [local, setLocal] = useState({ enabled: false, baseUrl: LOCAL_DEFAULTS.baseUrl, model: LOCAL_DEFAULTS.model });
  const [pub, setPub] = useState({ repos: null, repo: "", branch: "", path: "", openPr: false, busy: false, result: null, error: null });

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
          throw new Error(e.error || "No se pudo generar.");
        }
        draft = (await res.json()).draft;
      }
    } catch (e) {
      setGenerating(false);
      setError(e.message || "No se pudo generar.");
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
      tags: draft.tags ?? [],
    });
    setValues({});
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

  // ── Live preview (0 tokens, client-side Handlebars) ──
  const preview = useMemo(() => {
    try {
      return { ok: true, text: renderTemplate(form.body_template, form.variables, values) };
    } catch (e) {
      return { ok: false, text: String(e.message || e) };
    }
  }, [form.body_template, form.variables, values]);

  function buildPayload() {
    let frontmatter;
    try {
      frontmatter = JSON.parse(form.frontmatterText || "{}");
    } catch {
      throw new Error("El frontmatter no es JSON válido.");
    }
    return {
      name: form.name.trim(),
      type: form.type,
      target: form.target.trim() || "opencode",
      frontmatter,
      body_template: form.body_template,
      variables: form.variables.filter((v) => v.name.trim()),
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
      setError("El nombre es obligatorio.");
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
      setError("Error al guardar (revisa los campos).");
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
            <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: 6 }}>Generar con IA</div>
            <textarea
              style={{ ...input, minHeight: 60 }}
              value={genPrompt}
              onChange={(e) => setGenPrompt(e.target.value)}
              placeholder="p. ej. un subagente que escribe tests JUnit5 + Mockito siguiendo mis convenciones"
            />
            <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <input type="checkbox" checked={local.enabled} onChange={(e) => setLocal((l) => ({ ...l, enabled: e.target.checked }))} />
              Usar modelo local (Ollama / LM Studio) — 0 tokens
            </label>
            {local.enabled && (
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <input style={{ ...input, minHeight: 36, fontSize: "0.8rem" }} value={local.baseUrl} onChange={(e) => setLocal((l) => ({ ...l, baseUrl: e.target.value }))} placeholder="http://localhost:11434/v1" />
                <input style={{ ...input, minHeight: 36, fontSize: "0.8rem" }} value={local.model} onChange={(e) => setLocal((l) => ({ ...l, model: e.target.value }))} placeholder="qwen2.5-coder" />
              </div>
            )}
            <button className="btn btn-bark" type="button" onClick={generate} disabled={generating} style={{ marginTop: 8 }}>
              {generating ? "Generando…" : "Generar borrador"}
            </button>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 6 }}>
              Rellena el formulario; revísalo y guárdalo. O rellena los campos a mano (0 tokens).
              {local.enabled && " El modelo local requiere CORS (OLLAMA_ORIGINS) habilitado."}
            </p>
          </div>
        )}

        <Field label="Nombre">
          <input style={input} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="test-writer" />
        </Field>

        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Tipo">
            <select style={input} value={form.type} onChange={(e) => onChangeType(e.target.value)}>
              {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Target (CLI)">
            <input style={input} value={form.target} onChange={(e) => set("target", e.target.value)} />
          </Field>
        </div>

        {TYPE_SCAFFOLDS[form.type] && (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => applyScaffold(form.type)}
            style={{ minHeight: 36, padding: "0 12px", fontSize: "0.85rem", justifySelf: "start" }}
          >
            Usar plantilla base de {TYPE_LABELS[form.type]}
          </button>
        )}

        <Field label="Tags (separados por coma)">
          <input
            style={input}
            value={form.tags.join(", ")}
            onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
            placeholder="java, tests"
          />
        </Field>

        <Field label="Frontmatter (JSON)">
          <textarea style={{ ...input, minHeight: 90, fontFamily: "monospace" }} value={form.frontmatterText} onChange={(e) => set("frontmatterText", e.target.value)} />
        </Field>

        <Field label="Cuerpo (plantilla Handlebars — usa {{variable}})">
          <textarea style={{ ...input, minHeight: 180, fontFamily: "monospace" }} value={form.body_template} onChange={(e) => set("body_template", e.target.value)} />
        </Field>

        {/* Variables */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <strong style={{ fontSize: "0.9rem" }}>Variables</strong>
            <button className="btn btn-ghost" type="button" onClick={addVar} style={{ minHeight: 32, padding: "0 10px", fontSize: "0.8rem" }}>+ Añadir</button>
          </div>
          {form.variables.length === 0 && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Sin variables. Añade las que uses en el cuerpo.</p>}
          {form.variables.map((v, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <input style={{ ...input, flex: 1 }} placeholder="nombre" value={v.name} onChange={(e) => updateVar(i, "name", e.target.value)} />
              <input style={{ ...input, flex: 1 }} placeholder="valor por defecto" value={v.default} onChange={(e) => updateVar(i, "default", e.target.value)} />
              <button className="btn btn-ghost" type="button" onClick={() => removeVar(i)} style={{ minHeight: 44, padding: "0 10px" }}>×</button>
            </div>
          ))}
        </div>

        {error && <p style={{ color: "var(--clay)", fontSize: "0.9rem" }}>{error}</p>}

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-bark" type="button" onClick={save} disabled={saving}>
            {saving ? "Guardando…" : isNew ? "Crear" : "Guardar"}
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => router.push("/")}>Volver</button>
        </div>
      </div>

      {/* ── Preview column ── */}
      <div className="card" style={{ padding: 16, position: "sticky", top: 20 }}>
        <strong style={{ fontSize: "0.9rem" }}>Vista previa (0 tokens)</strong>
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
          {preview.text || "(vacío)"}
        </pre>

        {!isNew && (
          <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
            <strong style={{ fontSize: "0.9rem" }}>Publicar en GitHub</strong>
            {pub.repos === null ? (
              <div style={{ marginTop: 8 }}>
                <button className="btn btn-ghost" type="button" onClick={loadRepos} style={{ minHeight: 36, padding: "0 12px", fontSize: "0.85rem" }}>
                  Cargar mis repos
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                <select style={input} value={pub.repo} onChange={(e) => setPub((p) => ({ ...p, repo: e.target.value }))}>
                  {pub.repos.map((r) => <option key={r.full_name} value={r.full_name}>{r.full_name}{r.private ? " (privado)" : ""}</option>)}
                </select>
                <input style={input} placeholder="rama (vacío = por defecto)" value={pub.branch} onChange={(e) => setPub((p) => ({ ...p, branch: e.target.value }))} />
                <input style={input} placeholder="ruta (vacío = la del renderer)" value={pub.path} onChange={(e) => setPub((p) => ({ ...p, path: e.target.value }))} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-bark" type="button" onClick={publish} disabled={pub.busy || !pub.repo} style={{ flex: 1 }}>
                    {pub.busy ? "…" : "Publicar"}
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={testPublish} disabled={pub.busy || !pub.repo} style={{ flex: 1 }}>
                    {pub.busy ? "…" : "Probar en rama"}
                  </button>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <input type="checkbox" checked={pub.openPr} onChange={(e) => setPub((p) => ({ ...p, openPr: e.target.checked }))} />
                  Abrir PR al probar
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
