"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { renderTemplate } from "@/lib/render";
import { ARTIFACT_TYPES, TYPE_LABELS, TYPE_SCAFFOLDS } from "@/lib/artifact-types";

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
