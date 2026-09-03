"use client";

import { useI18n } from "@/lib/i18n";

export default function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  const next = lang === "es" ? "en" : "es";

  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label={t("lang.switchTo")}
      title={t("lang.switchTo")}
      style={{
        position: "fixed",
        top: 14,
        left: 58,
        zIndex: 50,
        height: 36,
        padding: "0 10px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--line)",
        background: "var(--surface)",
        color: "var(--text-muted)",
        boxShadow: "var(--shadow-sm)",
        cursor: "pointer",
        fontSize: "0.78rem",
        fontWeight: 600,
        letterSpacing: "0.04em",
        transition: "background 0.12s ease, color 0.12s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cream)"; e.currentTarget.style.color = "var(--text)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--text-muted)"; }}
    >
      {next.toUpperCase()}
    </button>
  );
}
