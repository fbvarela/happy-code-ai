"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronUp, Settings, BookOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { TARGET_LABELS } from "@/lib/targets";
import { CONFIG_PATHS, GLOBAL_CONFIG_PATHS } from "@/lib/config-paths";

const CLI_CONFIG_FILES = Object.entries(CONFIG_PATHS).map(([target, paths]) => ({
  target,
  label: TARGET_LABELS[target] || target,
  files: [paths.settings, paths.mcp, paths.mcpDir].filter(Boolean),
}));
const GLOBAL_FILES = Object.values(GLOBAL_CONFIG_PATHS);
const USER_CONFIG = "~/.config/opencode/opencode.json";

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
            {steps.map(({ key }, i) => (
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
                  {i + 1}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
                {t("config.guide.filesTitle")}
              </p>
              <Link href="/docs/config-guide" style={{ fontSize: "0.85rem", color: "var(--bark)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <BookOpen size={13} /> {t("nav.configGuide")} →
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
              {CLI_CONFIG_FILES.map(({ target, label, files }) => (
                <div key={target} style={{ background: "var(--cream)", borderRadius: 8, padding: "10px 12px" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>{label}</p>
                  {files.map((f) => (
                    <p key={f} style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 2px", fontFamily: "monospace" }}>
                      {f}
                    </p>
                  ))}
                </div>
              ))}
              <div style={{ background: "var(--cream)", borderRadius: 8, padding: "10px 12px" }}>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>{t("config.global")}</p>
                {GLOBAL_FILES.map((f) => (
                  <p key={f} style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 2px", fontFamily: "monospace" }}>
                    {f}
                  </p>
                ))}
              </div>
              <div style={{ background: "var(--cream)", borderRadius: 8, padding: "10px 12px", gridColumn: "1 / -1" }}>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>OpenCode global</p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0, fontFamily: "monospace" }}>
                  {USER_CONFIG}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
