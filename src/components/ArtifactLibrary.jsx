"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, BookOpen, FileText, Brain, Plus, Copy, Trash2, ChevronDown, Search } from "lucide-react";
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
  const [guidesOpen, setGuidesOpen] = useState(false);
  const guidesRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (guidesRef.current && !guidesRef.current.contains(e.target)) setGuidesOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

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
    <>
      <div className="toolbar">
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("library.searchPlaceholder")}
            className="input"
            style={{ paddingLeft: 36, width: "100%" }}
          />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="select" style={{ minWidth: 160 }}>
          <option value="">{t("library.allTypes")}</option>
          {ARTIFACT_TYPES.map((v) => (
            <option key={v} value={v}>{TYPE_LABELS[v]}</option>
          ))}
        </select>
        <button className="btn btn-ghost" type="button" onClick={() => router.push("/suggestions")}>
          <Sparkles size={15} /> {t("nav.suggestions")}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => router.push("/glossary")}>
          <BookOpen size={15} /> {t("nav.glossary")}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => router.push("/docs/openspec")}>
          <FileText size={15} /> OpenSpec
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => router.push("/memory")}>
          <Brain size={15} /> {t("nav.memory")}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => router.push("/config")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          {t("nav.config")}
        </button>
        <div ref={guidesRef} style={{ position: "relative" }}>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => setGuidesOpen((o) => !o)}
            aria-expanded={guidesOpen}
          >
            <BookOpen size={15} /> {t("nav.guides")} <ChevronDown size={13} />
          </button>
          {guidesOpen && (
            <div
              style={{
                position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 10,
                background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)",
                minWidth: 200, boxShadow: "var(--shadow-lg)", overflow: "hidden",
              }}
            >
              {[
                { href: "/docs/prompt-guide", icon: FileText, label: t("nav.guide") },
                { href: "/docs/memory-guide", icon: BookOpen, label: t("nav.memoryGuide") },
                { href: "/docs/config-guide", icon: BookOpen, label: t("nav.configGuide") },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => { setGuidesOpen(false); router.push(item.href); }}
                    style={{ width: "100%", justifyContent: "flex-start", borderRadius: 0, padding: "9px 14px" }}
                  >
                    <Icon size={15} /> {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="spacer" />
        <button className="btn btn-primary" type="button" onClick={() => router.push("/artifacts/new")}>
          <Plus size={15} /> {t("nav.new")}
        </button>
      </div>

      {items === null && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          {t("common.loading")}
        </div>
      )}
      {items !== null && items.length === 0 && (
        <div className="card" style={{ padding: "32px 20px", textAlign: "center", color: "var(--text-muted)" }}>
          <p style={{ margin: "0 0 8px", fontWeight: 500 }}>{t("library.empty")}</p>
        </div>
      )}

      {items !== null && items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minHeight: 0 }}>
          {items.map((a) => (
            <div key={a.id} className="list-item">
              <button
                type="button"
                onClick={() => router.push(`/artifacts/${a.id}`)}
                style={{ flex: 1, textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column", gap: 4 }}
              >
                <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text)" }}>{a.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge badge-accent">{TYPE_LABELS[a.type] || a.type}</span>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{a.target}</span>
                  {(a.tags || []).length > 0 && (
                    <span style={{ fontSize: "0.78rem", color: "var(--text-faint)" }}>
                      · {a.tags.join(", ")}
                    </span>
                  )}
                  <span style={{ fontSize: "0.78rem", color: "var(--text-faint)" }}>v{a.version}</span>
                </div>
              </button>
              {confirmId === a.id ? (
                <>
                  <span style={{ fontSize: "0.82rem", color: "var(--clay)" }}>{t("common.sure")}</span>
                  <button className="btn btn-danger" type="button" onClick={() => remove(a.id)} style={{ padding: "0 10px", fontSize: "0.82rem" }}>{t("library.confirmDelete")}</button>
                  <button className="btn btn-ghost" type="button" onClick={() => setConfirmId(null)} style={{ padding: "0 10px", fontSize: "0.82rem" }}>{t("common.no")}</button>
                </>
              ) : (
                <>
                  <button className="btn btn-ghost" type="button" onClick={() => clone(a.id)} style={{ padding: "0 8px", fontSize: "0.82rem" }}><Copy size={14} /> {t("common.clone")}</button>
                  <button className="btn btn-ghost" type="button" onClick={() => setConfirmId(a.id)} style={{ padding: "0 8px", fontSize: "0.82rem", color: "var(--text-muted)" }}><Trash2 size={14} /></button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
