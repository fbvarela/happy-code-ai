"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SUGGESTIONS, SUGGESTION_CATEGORIES } from "@/lib/suggestions";
import { TYPE_LABELS } from "@/lib/artifact-types";

// sessionStorage key the editor reads on mount (new mode) to pre-fill itself.
export const PREFILL_KEY = "hc:suggestion";

const CAT_LABEL = Object.fromEntries(SUGGESTION_CATEGORIES.map((c) => [c.id, c.label]));

export default function SuggestionGallery() {
  const router = useRouter();
  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return SUGGESTIONS.filter((s) => {
      if (cat && s.category !== cat) return false;
      if (!needle) return true;
      return (
        s.title.toLowerCase().includes(needle) ||
        s.summary.toLowerCase().includes(needle) ||
        (s.tags || []).some((t) => t.toLowerCase().includes(needle))
      );
    });
  }, [cat, q]);

  function use(s) {
    try {
      sessionStorage.setItem(PREFILL_KEY, JSON.stringify(s.artifact));
    } catch {}
    router.push("/artifacts/new");
  }

  return (
    <section>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar sugerencia…"
          style={inputStyle}
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)} style={inputStyle}>
          <option value="">Todas las categorías</option>
          {SUGGESTION_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      {items.length === 0 && (
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
          No hay sugerencias para ese filtro.
        </div>
      )}

      <ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12, padding: 0 }}>
        {items.map((s) => (
          <li key={s.id} className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={badgeStyle}>{TYPE_LABELS[s.artifact.type] || s.artifact.type}</span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{CAT_LABEL[s.category] || s.category}</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: "1rem" }}>{s.title}</div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, flex: 1, lineHeight: 1.45 }}>{s.summary}</p>
            <button className="btn btn-bark" type="button" onClick={() => use(s)} style={{ minHeight: 40, alignSelf: "start" }}>
              Usar plantilla
            </button>
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
