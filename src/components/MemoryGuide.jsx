"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const CLI_FILES = [
  { cli: "Claude Code", root: "CLAUDE.md", dir: ".claude/memory/", ext: ".md" },
  { cli: "OpenCode",    root: "AGENTS.md",  dir: ".opencode/memory/", ext: ".md" },
  { cli: "Cursor",      root: "AGENTS.md",  dir: ".cursor/rules/", ext: ".mdc" },
  { cli: "Gemini CLI",  root: "GEMINI.md",  dir: ".gemini/", ext: ".md" },
];

const STEPS = [
  { key: "step1", n: 1 },
  { key: "step2", n: 2 },
  { key: "step3", n: 3 },
  { key: "step4", n: 4 },
  { key: "step5", n: 5 },
];

export default function MemoryGuide() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

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
        {t("memory.guide.title")}
      </button>

      {open && (
        <div style={{ display: "grid", gap: 12 }}>
          {/* Steps */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {STEPS.map(({ key, n }) => (
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
                  {n}
                </span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4 }}>
                    {t(`memory.guide.${key}.title`)}
                  </p>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>
                    {t(`memory.guide.${key}.body`)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* File reference table */}
          <div className="card" style={{ padding: "14px 16px" }}>
            <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 10 }}>
              {t("memory.guide.filesTitle")}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
              {CLI_FILES.map(({ cli, root, dir, ext }) => (
                <div key={cli} style={{ background: "var(--cream)", borderRadius: 8, padding: "10px 12px" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 6 }}>{cli}</p>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 2px", fontFamily: "monospace" }}>
                    {root}
                  </p>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0, fontFamily: "monospace" }}>
                    {dir}*{ext}
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
