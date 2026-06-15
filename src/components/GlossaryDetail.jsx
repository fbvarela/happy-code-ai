"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { GLOSSARY_SEED, GLOSSARY_CATEGORIES } from "@/lib/glossary";

const CAT_LABEL = Object.fromEntries(GLOSSARY_CATEGORIES.map((c) => [c.id, c.label]));
const cacheKey = (id) => `hc:gloss:ext:${id}`;

export default function GlossaryDetail({ id }) {
  const [entry, setEntry] = useState(() => GLOSSARY_SEED.find((e) => e.id === id) || null);
  const [status, setStatus] = useState(entry ? "ready" : "loading"); // loading | ready | notfound
  const [explanation, setExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [explainError, setExplainError] = useState(null);

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

  // Generate (once, cached per session) the extended explanation via Groq.
  useEffect(() => {
    if (!entry) return;
    let cached = null;
    try {
      cached = sessionStorage.getItem(cacheKey(id));
    } catch {}
    if (cached) {
      setExplanation(cached);
      return;
    }
    let active = true;
    setExplaining(true);
    setExplainError(null);
    (async () => {
      try {
        const res = await fetch("/api/glossary/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ term: entry.term, definition: entry.definition }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "No se pudo generar la explicación.");
        if (!active) return;
        setExplanation(data.explanation || "");
        try {
          sessionStorage.setItem(cacheKey(id), data.explanation || "");
        } catch {}
      } catch (e) {
        if (active) setExplainError(e.message);
      } finally {
        if (active) setExplaining(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [entry, id]);

  return (
    <div>
      <Link href="/glossary" style={backLink}>
        <ArrowLeft size={15} /> Volver al glosario
      </Link>

      {status === "loading" && <p style={{ color: "var(--text-muted)", marginTop: 20 }}>Cargando…</p>}

      {status === "notfound" && (
        <div className="card" style={{ padding: 24, marginTop: 16, color: "var(--text-muted)" }}>
          Ese término no existe o no es tuyo.
        </div>
      )}

      {entry && (
        <article style={{ marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "1.6rem", margin: 0 }}>{entry.term}</h1>
            <span style={badgeStyle}>{CAT_LABEL[entry.category] || entry.category}</span>
          </div>

          <p style={{ fontSize: "1rem", lineHeight: 1.6, marginTop: 10, textAlign: "justify" }}>{entry.definition}</p>

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
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: 10 }}>
              <Sparkles size={14} /> Explicación extendida (generada con Groq)
            </div>

            {explaining && <p style={{ color: "var(--text-muted)", margin: 0 }}>Generando explicación…</p>}
            {explainError && !explaining && (
              <p style={{ color: "var(--clay)", margin: 0 }}>{explainError}</p>
            )}
            {!explaining && !explainError && explanation && <RichText text={explanation} />}
            {!explaining && !explainError && !explanation && (
              <p style={{ color: "var(--text-muted)", margin: 0 }}>Sin explicación extendida.</p>
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

const backLink = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontSize: "0.85rem",
  color: "var(--text-muted)",
  textDecoration: "none",
};
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
