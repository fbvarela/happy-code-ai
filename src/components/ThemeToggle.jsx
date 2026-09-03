"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function ThemeToggle() {
  const { t } = useI18n();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? t("theme.toLight") : t("theme.toDark")}
      title={dark ? t("theme.toLight") : t("theme.toDark")}
      style={{
        position: "fixed",
        top: 14,
        right: 14,
        zIndex: 50,
        width: 36,
        height: 36,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--line)",
        background: "var(--surface)",
        color: "var(--text-muted)",
        boxShadow: "var(--shadow-sm)",
        cursor: "pointer",
        transition: "background 0.12s ease, color 0.12s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cream)"; e.currentTarget.style.color = "var(--text)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--text-muted)"; }}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
