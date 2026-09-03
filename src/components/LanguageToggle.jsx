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
        height: 32, minWidth: 32, padding: "0 8px",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        borderRadius: 6, border: "1px solid var(--line)",
        background: "var(--surface)", color: "var(--text-muted)",
        cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
        letterSpacing: "0.04em", flexShrink: 0,
      }}
    >
      {next.toUpperCase()}
    </button>
  );
}
