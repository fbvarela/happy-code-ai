"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/** Floating light/dark toggle. The actual class is applied pre-paint by the
 *  inline script in layout.jsx (no flash); this just reflects + flips it and
 *  persists the choice. */
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
        width: 40,
        height: 40,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        border: "1px solid var(--line)",
        background: "var(--surface)",
        color: "var(--text)",
        boxShadow: "var(--shadow)",
        cursor: "pointer",
      }}
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
