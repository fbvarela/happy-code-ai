"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import { ExternalLink, Sparkles, Pencil, RotateCw, Save, X } from "lucide-react";
import { GLOSSARY_SEED, GLOSSARY_CATEGORIES } from "@/lib/glossary";
import { useI18n, pickLang } from "@/lib/i18n";

export default function GlossaryDetail({ id }) {
  const { t, lang } = useI18n();
  const CAT_LABEL = Object.fromEntries(GLOSSARY_CATEGORIES.map((c) => [c.id, pickLang(c, "label", lang)]));
  const [entry, setEntry] = useState(() => GLOSSARY_SEED.find((e) => e.id === id) || null);
  const [status, setStatus] = useState(entry ? "ready" : "loading"); // loading | ready | notfound

  const displayTerm = entry ? pickLang(entry, "term", lang) : "";
  const displayDef = entry ? pickLang(entry, "definition", lang) : "";

  const [explanation, setExplanation] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Resolve user entries (not in the static seed) from the API.
  useEffect(() => {
    if (entry) return;
    let active = true;
    (async () => {
      const res = await fetch(`/api/glossary/${id}`);
      if (!active) return;
      if (res.ok) {
        setEntry(await res.json());
        setStatus("ready");
      } else {
        setStatus("notfound");
      }
    })();
    return () => {
      active = false;
    };
  }, [id, entry]);

  // Persist the explanation for this user+term (upsert). Returns true on success.
  const persist = useCallback(
    async (text) => {
      const res = await fetch(`/api/glossary/${id}/explanation`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ explanation: text }),
      });
      return res.ok;
    },
    [id],
  );

  // Generate a fresh explanation with Agnes. In edit mode it fills the draft;
  // otherwise it replaces the shown explanation and is saved.
  const generate = useCallback(
    async ({ intoDraft = false } = {}) => {
      if (!entry) return;
      setGenerating(true);
      setError(null);

      // Load custom prompts from localStorage
      const getPromptSettings = () => {
        try {
          const stored = localStorage.getItem("happyCodePromptSettings");
          if (stored) {
            return JSON.parse(stored);
          }
        } catch (err) {
          console.warn("Failed to load prompt settings from localStorage:", err);
        }
        return null;
      };
      const promptSettings = getPromptSettings();

      try {
        const res = await fetch("/api/glossary/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            term: pickLang(entry, "term", lang),
            definition: pickLang(entry, "definition", lang),
            lang,
            glossaryExplainPromptEs: promptSettings?.glossaryExplainPromptEs || null,
            glossaryExplainPromptEn: promptSettings?.glossaryExplainPromptEn || null,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || t("detail.errGenerate"));
        const text = data.explanation || "";
        if (intoDraft) {
          setDraft(text);
        } else {
          setExplanation(text);
          persist(text); // best-effort cache so it isn't regenerated next time
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setGenerating(false);
      }
    },
    [entry, persist, lang, t],
  );

  // On entry ready: load the saved explanation, else generate one.
  useEffect(() => {
    if (!entry) return;
    let active = true;
    (async () => {
      const res = await fetch(`/api/glossary/${id}/explanation`);
      const data = res.ok ? await res.json().catch(() => ({})) : {};
      if (!active) return;
      if (data.explanation) setExplanation(data.explanation);
      else generate();
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, id]);

  function startEdit() {
    setDraft(explanation || "");
    setError(null);
    setEditing(true);
  }
  function cancelEdit() {
    setEditing(false);
    setError(null);
  }
  async function saveEdit() {
    setSaving(true);
    setError(null);
    const ok = await persist(draft);
    setSaving(false);
    if (ok) {
      setExplanation(draft);
      setEditing(false);
    } else {
      setError(t("detail.errSave"));
    }
  }

  return (
    <div>
      <BackLink href="/glossary" label={t("detail.back")} />

      {status === "loading" && <p style={{ color: "var(--text-muted)", marginTop: 20 }}>{t("common.loading")}</p>}

      {status === "notfound" && (
        <div className="card" style={{ padding: 24, marginTop: 16, color: "var(--text-muted)" }}>
          {t("detail.notFound")}
        </div>
      )}

      {entry && (
        <article style={{ marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "1.6rem", margin: 0 }}>{displayTerm}</h1>
            <span style={badgeStyle}>{CAT_LABEL[entry.category] || entry.category}</span>
          </div>

          <p style={{ fontSize: "1rem", lineHeight: 1.6, marginTop: 10, textAlign: "justify" }}>{displayDef}</p>

          {(entry.links || []).length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {entry.links.map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noreferrer noopener" style={chipStyle}>
                  {l.label || l.url} <ExternalLink size={12} />
                </a>
              ))}
            </div>
          )}

          <section className="card" style={{ padding: 18, marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: "0.8rem" }}>
                <Sparkles size={14} /> {t("detail.extended")}
              </div>
              {!editing && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-ghost" type="button" onClick={startEdit} disabled={generating} style={smallIcon}>
                    <Pencil size={14} /> {t("common.edit")}
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={() => generate()} disabled={generating} style={smallIcon}>
                    <RotateCw size={14} /> {generating ? t("glossary.generating") : t("detail.regenerate")}
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div style={{ display: "grid", gap: 10 }}>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  style={textareaStyle}
                  placeholder={t("detail.explanationPlaceholder")}
                />
                {error && <p style={{ color: "var(--clay)", margin: 0, fontSize: "0.85rem" }}>{error}</p>}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn btn-bark" type="button" onClick={saveEdit} disabled={saving} style={smallIcon}>
                    <Save size={14} /> {saving ? t("common.saving") : t("common.save")}
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={cancelEdit} disabled={saving} style={smallIcon}>
                    <X size={14} /> {t("common.cancel")}
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={() => generate({ intoDraft: true })} disabled={generating} style={smallIcon}>
                    <RotateCw size={14} /> {generating ? t("glossary.generating") : t("detail.regenerate")}
                  </button>
                </div>
              </div>
            ) : generating && !explanation ? (
              <p style={{ color: "var(--text-muted)", margin: 0 }}>{t("detail.generatingExplanation")}</p>
            ) : explanation ? (
              <RichText text={explanation} />
            ) : error ? (
              <p style={{ color: "var(--clay)", margin: 0 }}>{error} <span style={{ color: "var(--text-muted)" }}>{t("detail.writeYourself")}</span></p>
            ) : (
              <p style={{ color: "var(--text-muted)", margin: 0 }}>{t("detail.noExplanation")}</p>
            )}
          </section>
        </article>
      )}
    </div>
  );
}

/** Minimal renderer: blank-line-separated paragraphs; blocks of "- " lines
 *  become bullet lists. No external markdown dependency. */
function RichText({ text }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => /^\s*[-*]\s+/.test(l));
        if (isList) {
          return (
            <ul key={i} style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 4 }}>
              {lines.map((l, j) => (
                <li key={j} style={{ lineHeight: 1.6 }}>{l.replace(/^\s*[-*]\s+/, "")}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} style={{ margin: 0, lineHeight: 1.65, whiteSpace: "pre-line", textAlign: "justify" }}>{block}</p>
        );
      })}
    </div>
  );
}

const badgeStyle = {
  background: "var(--cream)",
  border: "1px solid var(--line)",
  borderRadius: 6,
  padding: "2px 10px",
  fontSize: "0.78rem",
};
const chipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  background: "var(--cream)",
  border: "1px solid var(--line)",
  borderRadius: 6,
  padding: "2px 8px",
  fontSize: "0.78rem",
  color: "var(--leaf)",
  textDecoration: "none",
};
const smallIcon = { minHeight: 34, padding: "0 12px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 5 };
const textareaStyle = {
  width: "100%",
  minHeight: 200,
  padding: 12,
  borderRadius: 8,
  border: "1px solid var(--line)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: "0.92rem",
  lineHeight: 1.6,
  fontFamily: "inherit",
  resize: "vertical",
};
