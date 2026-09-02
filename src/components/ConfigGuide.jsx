"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { TARGET_LABELS } from "@/lib/targets";

export default function ConfigGuide() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const steps = [
    { key: "step1" },
    { key: "step2" },
    { key: "step3" },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <button
        className="btn btn-ghost"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.95rem",
          fontWeight: 600,
          marginBottom: open ? 12 : 0,
          padding: "6px 0",
          color: "var(--text-muted)",
        }}
      >
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {t("config.guide.title")}
      </button>

      {open && (
        <div style={{ display: "grid", gap: 12 }}>
          <div className="card-grid" style={{ gap: 10 }}>
            {steps.map(({ key }) => (
              <div key={key} className="card" style={{ padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--cream)",
                  border: "1px solid var(--line)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                }}>
                  {steps.indexOf({ key }) + 1}
                </span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4 }}>
                    {t(`config.guide.${key}.title`)}
                  </p>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>
                    {t(`config.guide.${key}.body`)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: "14px 16px" }}>
            <p style={{ fontWeight: 700, fontSize: "0.95rem", margin: 0, marginBottom: 10 }}>
              {t("config.guide.filesTitle")}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
              {Object.entries({
                opencode: ".opencode/settings.json",
                claude: ".claude/settings.json",
                cursor: ".cursor/settings.json",
                gemini: ".gemini/settings.json",
                junie: ".junie/config.json",
                global: ".mcp.json",
              }).map(([target, path]) => (
                <div key={target} style={{ background: "var(--cream)", borderRadius: 8, padding: "10px 12px" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>
                    {target === "global" ? t("config.global") : TARGET_LABELS[target] || target}
                  </p>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0, fontFamily: "monospace" }}>
                    {path}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
