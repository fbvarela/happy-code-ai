"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, BookOpen, FileText, FileCode, Plus, Copy, Trash2 } from "lucide-react";
import { ARTIFACT_TYPES } from "@/lib/artifact-types";
import { useI18n, TYPE_LABELS_I18N } from "@/lib/i18n";

export default function ArtifactLibrary() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const TYPE_LABELS = TYPE_LABELS_I18N[lang] || TYPE_LABELS_I18N.es;
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
          placeholder={t("library.searchPlaceholder")}
          style={inputStyle}
        />
        <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
          <option value="">{t("library.allTypes")}</option>
          {ARTIFACT_TYPES.map((v) => (
            <option key={v} value={v}>{TYPE_LABELS[v]}</option>
          ))}
        </select>
        <button className="btn btn-ghost" type="button" onClick={() => router.push("/suggestions")} style={iconBtn}>
          <Sparkles size={16} /> {t("nav.suggestions")}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => router.push("/glossary")} style={iconBtn}>
          <BookOpen size={16} /> {t("nav.glossary")}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => router.push("/docs/prompt-guide")} style={iconBtn}>
          <FileText size={16} /> {t("nav.guide")}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => router.push("/docs/openspec")} style={iconBtn}>
          <FileCode size={16} /> OpenSpec
        </button>
        <button className="btn btn-bark" type="button" onClick={() => router.push("/artifacts/new")} style={iconBtn}>
          <Plus size={16} /> {t("nav.new")}
        </button>
      </div>

      {items === null && <p style={{ color: "var(--text-muted)" }}>{t("common.loading")}</p>}
      {items !== null && items.length === 0 && (
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
          {t("library.empty")}
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
                <span style={{ fontSize: "0.85rem", color: "var(--clay)" }}>{t("common.sure")}</span>
                <button className="btn btn-ghost" type="button" onClick={() => remove(a.id)} style={{ ...smallBtn, color: "var(--clay)" }}>{t("library.confirmDelete")}</button>
                <button className="btn btn-ghost" type="button" onClick={() => setConfirmId(null)} style={smallBtn}>{t("common.no")}</button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost" type="button" onClick={() => clone(a.id)} style={smallIconBtn}><Copy size={14} /> {t("common.clone")}</button>
                <button className="btn btn-ghost" type="button" onClick={() => setConfirmId(a.id)} style={smallIconBtn}><Trash2 size={14} /> {t("common.delete")}</button>
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
const iconBtn = { display: "inline-flex", alignItems: "center", gap: 6 };
const smallIconBtn = { ...smallBtn, display: "inline-flex", alignItems: "center", gap: 5 };
