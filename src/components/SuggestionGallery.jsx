"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";
import { SUGGESTIONS, SUGGESTION_CATEGORIES } from "@/lib/suggestions";
import { ARTIFACT_TYPES } from "@/lib/artifact-types";
import { useI18n, pickLang, TYPE_LABELS_I18N } from "@/lib/i18n";

// sessionStorage key the editor reads on mount (new mode) to pre-fill itself.
export const PREFILL_KEY = "hc:suggestion";

export default function SuggestionGallery() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const TYPE_LABELS = TYPE_LABELS_I18N[lang] || TYPE_LABELS_I18N.es;
  const CAT_LABEL = Object.fromEntries(SUGGESTION_CATEGORIES.map((c) => [c.id, pickLang(c, "label", lang)]));
  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return SUGGESTIONS.filter((s) => {
      if (cat && s.category !== cat) return false;
      if (!needle) return true;
      const title = pickLang(s, "title", lang);
      const summary = pickLang(s, "summary", lang);
      return (
        title.toLowerCase().includes(needle) ||
        summary.toLowerCase().includes(needle) ||
        (s.tags || []).some((t) => t.toLowerCase().includes(needle))
      );
    });
  }, [cat, q, lang]);

  function use(s) {
    const art = lang === "en" && s.artifact_en ? s.artifact_en : s.artifact;
    try {
      sessionStorage.setItem(PREFILL_KEY, JSON.stringify(art));
    } catch {}
    router.push("/artifacts/new");
  }

  return (
    <section>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("suggestions.searchPlaceholder")}
          style={inputStyle}
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)} style={inputStyle}>
          <option value="">{t("common.allCategories")}</option>
          {SUGGESTION_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{pickLang(c, "label", lang)}</option>
          ))}
        </select>
      </div>

      {items.length === 0 && (
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
          {t("suggestions.empty")}
        </div>
      )}

      <ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12, padding: 0 }}>
        {items.map((s) => (
          <li key={s.id} className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={badgeStyle}>{TYPE_LABELS[s.artifact.type] || s.artifact.type}</span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{CAT_LABEL[s.category] || s.category}</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: "1rem" }}>{pickLang(s, "title", lang)}</div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, flex: 1, lineHeight: 1.45 }}>{pickLang(s, "summary", lang)}</p>
            <button className="btn btn-bark" type="button" onClick={() => use(s)} style={{ minHeight: 40, alignSelf: "start", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Wand2 size={16} /> {t("suggestions.use")}
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
