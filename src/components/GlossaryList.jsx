"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Plus, X, Pencil, Trash2, ExternalLink, ChevronRight } from "lucide-react";
import { GLOSSARY_SEED, GLOSSARY_CATEGORIES } from "@/lib/glossary";

const CAT_LABEL = Object.fromEntries(GLOSSARY_CATEGORIES.map((c) => [c.id, c.label]));
const EMPTY_FORM = { term: "", category: "concept", definition: "", links: [], aliases: [] };

export default function GlossaryList() {
  const router = useRouter();
  const [userEntries, setUserEntries] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  // Add / edit form state (editingId === null means adding a new entry).
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }
  function startEdit(entry) {
    setEditingId(entry.id);
    setForm({
      term: entry.term,
      category: entry.category,
      definition: entry.definition,
      links: (entry.links || []).map((l) => ({ ...l })),
      aliases: entry.aliases || [],
    });
    setFormError(null);
    setShowForm(true);
  }
  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  async function load() {
    const res = await fetch("/api/glossary");
    setUserEntries(res.ok ? await res.json() : []);
  }
  useEffect(() => {
    load();
  }, []);

  // Merge seed (read-only) + user entries (removable), sorted by term.
  const entries = useMemo(() => {
    const seed = GLOSSARY_SEED.map((e) => ({ ...e, source: "seed" }));
    const mine = userEntries.map((e) => ({ ...e, source: "user" }));
    const all = [...seed, ...mine];
    const needle = q.trim().toLowerCase();
    return all
      .filter((e) => {
        if (cat && e.category !== cat) return false;
        if (!needle) return true;
        const hay = `${e.term} ${(e.aliases || []).join(" ")} ${e.definition}`.toLowerCase();
        return hay.includes(needle);
      })
      .sort((a, b) => a.term.localeCompare(b.term, "es"));
  }, [userEntries, q, cat]);

  async function generate() {
    if (!form.term.trim()) {
      setFormError("Escribe el término primero.");
      return;
    }
    setGenerating(true);
    setFormError(null);
    try {
      const res = await fetch("/api/glossary/define", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: form.term.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo generar.");
      setForm((f) => ({
        ...f,
        definition: data.definition || f.definition,
        category: data.category || f.category,
        links: (data.links || []).length ? data.links : f.links,
      }));
    } catch (e) {
      setFormError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (!form.term.trim()) {
      setFormError("El término es obligatorio.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch(editingId ? `/api/glossary/${editingId}` : "/api/glossary", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term: form.term.trim(),
          category: form.category,
          definition: form.definition,
          links: form.links.filter((l) => l.url.trim()),
          aliases: form.aliases,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo guardar.");
      if (editingId) {
        setUserEntries((prev) => prev.map((e) => (e.id === editingId ? { ...data, source: "user" } : e)));
      } else {
        setUserEntries((prev) => [{ ...data, source: "user" }, ...prev]);
      }
      closeForm();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    await fetch(`/api/glossary/${id}`, { method: "DELETE" });
    setConfirmId(null);
    setUserEntries((prev) => prev.filter((e) => e.id !== id));
  }

  // Link editor (in the add form)
  function addLink() {
    setForm((f) => ({ ...f, links: [...f.links, { label: "", url: "" }] }));
  }
  function updateLink(i, key, val) {
    setForm((f) => ({ ...f, links: f.links.map((l, j) => (j === i ? { ...l, [key]: val } : l)) }));
  }
  function removeLink(i) {
    setForm((f) => ({ ...f, links: f.links.filter((_, j) => j !== i) }));
  }

  return (
    <section>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar término…" style={inputStyle} />
        <select value={cat} onChange={(e) => setCat(e.target.value)} style={inputStyle}>
          <option value="">Todas las categorías</option>
          {GLOSSARY_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <button className="btn btn-bark" type="button" onClick={() => (showForm ? closeForm() : openAdd())} style={iconRow}>
          {showForm ? <><X size={16} /> Cancelar</> : <><Plus size={16} /> Añadir término</>}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 16, marginBottom: 16, display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              style={{ ...inputStyle, flex: 2, minWidth: 200 }}
              placeholder="Término (p. ej. Prompt caching)"
              value={form.term}
              onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))}
            />
            <select style={{ ...inputStyle, flex: 1, minWidth: 140 }} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {GLOSSARY_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <button className="btn btn-ghost" type="button" onClick={generate} disabled={generating} style={{ minHeight: 44, ...iconRow }}>
              <Sparkles size={16} /> {generating ? "Generando…" : "Generar definición"}
            </button>
          </div>
          <textarea
            style={{ ...inputStyle, minHeight: 90, padding: 10, lineHeight: 1.5 }}
            placeholder="Definición (o genérala con Groq; si la dejas vacía se generará al guardar)"
            value={form.definition}
            onChange={(e) => setForm((f) => ({ ...f, definition: e.target.value }))}
          />
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <strong style={{ fontSize: "0.85rem" }}>Enlaces</strong>
              <button className="btn btn-ghost" type="button" onClick={addLink} style={{ minHeight: 32, padding: "0 10px", fontSize: "0.8rem" }}>+ Añadir</button>
            </div>
            {form.links.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="etiqueta" value={l.label} onChange={(e) => updateLink(i, "label", e.target.value)} />
                <input style={{ ...inputStyle, flex: 2 }} placeholder="https://…" value={l.url} onChange={(e) => updateLink(i, "url", e.target.value)} />
                <button className="btn btn-ghost" type="button" onClick={() => removeLink(i)} aria-label="Quitar enlace" style={{ minHeight: 44, padding: "0 10px" }}><X size={16} /></button>
              </div>
            ))}
          </div>
          {formError && <p style={{ color: "var(--clay)", fontSize: "0.85rem", margin: 0 }}>{formError}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-bark" type="button" onClick={save} disabled={saving}>
              {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Guardar"}
            </button>
            <button className="btn btn-ghost" type="button" onClick={closeForm} disabled={saving}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
          No hay términos para ese filtro.
        </div>
      )}

      <ul style={{ listStyle: "none", display: "grid", gap: 10, padding: 0 }}>
        {entries.map((e) => (
          <li key={e.source + ":" + e.id} className="card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => router.push(`/glossary/${e.id}`)}
                  title="Ver explicación extendida"
                  style={termLink}
                >
                  {e.term} <ChevronRight size={15} style={{ opacity: 0.45 }} />
                </button>
                <span style={badgeStyle}>{CAT_LABEL[e.category] || e.category}</span>
                {e.source === "user" && <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>tuyo</span>}
              </div>
              <p style={{ fontSize: "0.88rem", color: "var(--text)", margin: "6px 0 0", lineHeight: 1.5 }}>{e.definition}</p>
              {(e.links || []).length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {e.links.map((l, i) => (
                    <a key={i} href={l.url} target="_blank" rel="noreferrer noopener" style={{ ...chipStyle, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {l.label || l.url} <ExternalLink size={12} />
                    </a>
                  ))}
                </div>
              )}
            </div>
            {e.source === "user" && (
              confirmId === e.id ? (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--clay)" }}>¿Seguro?</span>
                  <button className="btn btn-ghost" type="button" onClick={() => remove(e.id)} style={{ ...smallBtn, color: "var(--clay)" }}>Sí</button>
                  <button className="btn btn-ghost" type="button" onClick={() => setConfirmId(null)} style={smallBtn}>No</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-ghost" type="button" onClick={() => startEdit(e)} style={{ ...smallBtn, ...iconRow }}><Pencil size={14} /> Editar</button>
                  <button className="btn btn-ghost" type="button" onClick={() => setConfirmId(e.id)} style={{ ...smallBtn, ...iconRow }}><Trash2 size={14} /> Borrar</button>
                </div>
              )
            )}
          </li>
        ))}
      </ul>
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
const badgeStyle = {
  background: "var(--cream)",
  border: "1px solid var(--line)",
  borderRadius: 6,
  padding: "1px 8px",
  fontSize: "0.75rem",
};
const chipStyle = {
  background: "var(--cream)",
  border: "1px solid var(--line)",
  borderRadius: 6,
  padding: "2px 8px",
  fontSize: "0.78rem",
  color: "var(--leaf)",
  textDecoration: "none",
};
const smallBtn = { minHeight: 36, padding: "0 12px", fontSize: "0.85rem" };
const iconRow = { display: "inline-flex", alignItems: "center", gap: 6 };
const termLink = {
  display: "inline-flex",
  alignItems: "center",
  gap: 2,
  background: "none",
  border: "none",
  padding: 0,
  fontWeight: 600,
  fontSize: "1rem",
  color: "var(--text)",
  cursor: "pointer",
};
