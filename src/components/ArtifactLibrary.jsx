"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TYPE_LABELS } from "@/lib/artifact-types";

export default function ArtifactLibrary() {
  const router = useRouter();
  const [items, setItems] = useState(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    const res = await fetch(`/api/artifacts?${params}`);
    setItems(res.ok ? await res.json() : []);
  }

  useEffect(() => {
    const t = setTimeout(load, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type]);

  async function remove(id) {
    await fetch(`/api/artifacts/${id}`, { method: "DELETE" });
    setConfirmId(null);
    load();
  }

  async function clone(id) {
    const res = await fetch(`/api/artifacts/${id}`);
    if (!res.ok) return;
    const a = await res.json();
    const created = await fetch("/api/artifacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${a.name} (copia)`,
        type: a.type,
        target: a.target,
        frontmatter: a.frontmatter,
        body_template: a.body_template,
        variables: a.variables,
        tags: a.tags,
      }),
    });
    if (created.ok) {
      const nu = await created.json();
      router.push(`/artifacts/${nu.id}`);
    }
  }

  return (
    <section>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o tag…"
          style={inputStyle}
        />
        <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
          <option value="">Todos los tipos</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <button className="btn btn-ghost" type="button" onClick={() => router.push("/suggestions")}>
          ✨ Sugerencias
        </button>
        <button className="btn btn-bark" type="button" onClick={() => router.push("/artifacts/new")}>
          + Nuevo
        </button>
      </div>

      {items === null && <p style={{ color: "var(--text-muted)" }}>Cargando…</p>}
      {items !== null && items.length === 0 && (
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
          No hay artefactos todavía. Crea el primero con <strong>+ Nuevo</strong>.
        </div>
      )}

      <ul style={{ listStyle: "none", display: "grid", gap: 10 }}>
        {(items || []).map((a) => (
          <li key={a.id} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={() => router.push(`/artifacts/${a.id}`)}
              style={{ flex: 1, textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>{a.name}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                <span style={badgeStyle}>{TYPE_LABELS[a.type] || a.type}</span>
                <span style={{ marginLeft: 8 }}>{a.target}</span>
                {(a.tags || []).length > 0 && (
                  <span style={{ marginLeft: 8 }}>· {a.tags.join(", ")}</span>
                )}
                <span style={{ marginLeft: 8 }}>· v{a.version}</span>
              </div>
            </button>
            {confirmId === a.id ? (
              <>
                <span style={{ fontSize: "0.85rem", color: "var(--clay)" }}>¿Seguro?</span>
                <button className="btn btn-ghost" type="button" onClick={() => remove(a.id)} style={{ ...smallBtn, color: "var(--clay)" }}>Sí, borrar</button>
                <button className="btn btn-ghost" type="button" onClick={() => setConfirmId(null)} style={smallBtn}>No</button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost" type="button" onClick={() => clone(a.id)} style={smallBtn}>Clonar</button>
                <button className="btn btn-ghost" type="button" onClick={() => setConfirmId(a.id)} style={smallBtn}>Borrar</button>
              </>
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
const smallBtn = { minHeight: 36, padding: "0 12px", fontSize: "0.85rem" };
