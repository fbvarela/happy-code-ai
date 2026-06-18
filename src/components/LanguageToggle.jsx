"use client";

import { useI18n } from "@/lib/i18n";

/** Floating ES/EN switch, sitting just left of the theme toggle. Shows the
 *  language you'll switch TO. Persistence + <html lang> handled by the provider. */
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
        right: 62,
        zIndex: 50,
        height: 40,
        minWidth: 40,
        padding: "0 10px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
        border: "1px solid var(--line)",
        background: "var(--surface)",
        color: "var(--text)",
        boxShadow: "var(--shadow)",
        cursor: "pointer",
        fontSize: "0.8rem",
        fontWeight: 600,
      }}
    >
      {next.toUpperCase()}
    </button>
  );
}
