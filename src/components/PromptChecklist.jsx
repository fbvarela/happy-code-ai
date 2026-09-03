"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { lintBody, QUALITY_KEYS } from "@/lib/quality";

export default function PromptChecklist({ body }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState({});
  const results = useMemo(() => lintBody(body), [body]);

  const passed = QUALITY_KEYS.filter((k) => {
    const auto = results[k];
    return auto !== null ? auto : !!manual[k];
  }).length;

  function toggleManual(k) {
    setManual((m) => ({ ...m, [k]: !m[k] }));
  }

  return (
    <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: 0, color: "var(--text)", textAlign: "left",
        }}
      >
        <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
          {t("guide.checklist.title")}
          <span style={{
            marginLeft: 8, fontSize: "0.75rem", fontWeight: 400,
            color: passed === QUALITY_KEYS.length ? "var(--leaf)" : "var(--text-muted)",
          }}>
            {passed}/{QUALITY_KEYS.length}
          </span>
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 8 }}>
            {t("guide.checklist.hint")}
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 5 }}>
            {QUALITY_KEYS.map((k) => {
              const auto = results[k];
              const isAuto = auto !== null;
              const checked = isAuto ? auto : !!manual[k];
              return (
                <li key={k} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                  {isAuto ? (
                    <span style={{
                      fontSize: "0.8rem", fontWeight: 700, minWidth: 16, marginTop: 1,
                      color: checked ? "var(--leaf)" : "var(--clay)",
                    }}>
                      {checked ? "✓" : "✗"}
                    </span>
                  ) : (
                    <input
                      type="checkbox"
                      checked={!!manual[k]}
                      onChange={() => toggleManual(k)}
                      style={{ marginTop: 3, cursor: "pointer", accentColor: "var(--bark)" }}
                    />
                  )}
                  <span style={{ fontSize: "0.82rem", lineHeight: 1.45, color: checked ? "var(--text)" : "var(--text-muted)" }}>
                    {t(`prompt.check.${k}`)}
                    {isAuto && (
                      <span style={{ marginLeft: 5, fontSize: "0.7rem", color: "var(--text-muted)", opacity: 0.7 }}>
                        ({t("guide.checklist.autoNote")})
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <Link
            href="/docs/prompt-guide"
            style={{ display: "inline-block", marginTop: 10, fontSize: "0.8rem", color: "var(--bark)" }}
          >
            {t("guide.checklist.viewFull")}
          </Link>
        </div>
      )}
    </div>
  );
}
