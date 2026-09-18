"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Upload, Settings } from "lucide-react";
import { TARGETS, TARGET_LABELS } from "@/lib/targets";
import { useI18n } from "@/lib/i18n";

export default function PromptManager() {
  const { t } = useI18n();

  // ── Prompt storage ──
  const [artifactSystemPrompt, setArtifactSystemPrompt] = useState("");
  const [glossaryDefinePromptEs, setGlossaryDefinePromptEs] = useState("");
  const [glossaryDefinePromptEn, setGlossaryDefinePromptEn] = useState("");
  const [glossaryExplainPromptEs, setGlossaryExplainPromptEs] = useState("");
  const [glossaryExplainPromptEn, setGlossaryExplainPromptEn] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Load prompts from localStorage on mount
  useEffect(() => {
    loadPrompts();
  }, []);

  function loadPrompts() {
    setLoading(true);
    try {
      // Try to load from localStorage
      const stored = localStorage.getItem("happyCodePromptSettings");
      if (stored) {
        const parsed = JSON.parse(stored);
        setArtifactSystemPrompt(parsed.artifactSystemPrompt || "");
        setGlossaryDefinePromptEs(parsed.glossaryDefinePromptEs || "");
        setGlossaryDefinePromptEn(parsed.glossaryDefinePromptEn || "");
        setGlossaryExplainPromptEs(parsed.glossaryExplainPromptEs || "");
        setGlossaryExplainPromptEn(parsed.glossaryExplainPromptEn || "");
      } else {
        // Load defaults from the actual functions
        setArtifactSystemPrompt(getDefaultArtifactSystemPrompt("opencode"));
        setGlossaryDefinePromptEs(getDefaultGlossaryDefinePromptEs());
        setGlossaryDefinePromptEn(getDefaultGlossaryDefinePromptEn());
        setGlossaryExplainPromptEs(getDefaultGlossaryExplainPromptEs());
        setGlossaryExplainPromptEn(getDefaultGlossaryExplainPromptEn());
      }
    } catch (err) {
      console.error("Failed to load prompt settings:", err);
      // Fallback to defaults
      setArtifactSystemPrompt(getDefaultArtifactSystemPrompt("opencode"));
      setGlossaryDefinePromptEs(getDefaultGlossaryDefinePromptEs());
      setGlossaryDefinePromptEn(getDefaultGlossaryDefinePromptEn());
      setGlossaryExplainPromptEs(getDefaultGlossaryExplainPromptEs());
      setGlossaryExplainPromptEn(getDefaultGlossaryExplainPromptEn());
    } finally {
      setLoading(false);
    }
  }

  function savePrompts() {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    setSaveResult(null);

    try {
      const settings = {
        artifactSystemPrompt,
        glossaryDefinePromptEs,
        glossaryDefinePromptEn,
        glossaryExplainPromptEs,
        glossaryExplainPromptEn,
      };
      localStorage.setItem("happyCodePromptSettings", JSON.stringify(settings));
      setSaveResult(t("promptSettings.saveSuccess"));

      // Also show success temporarily
      setTimeout(() => {
        setSaveResult(null);
      }, 3000);
    } catch (err) {
      console.error("Failed to save prompt settings:", err);
      setSaveError(t("promptSettings.saveError"));
    } finally {
      setSaving(false);
    }
  }

  function resetToDefaults() {
    if (!window.confirm(t("promptSettings.resetConfirm"))) return;

    setArtifactSystemPrompt(getDefaultArtifactSystemPrompt("opencode"));
    setGlossaryDefinePromptEs(getDefaultGlossaryDefinePromptEs());
    setGlossaryDefinePromptEn(getDefaultGlossaryDefinePromptEn());
    setGlossaryExplainPromptEs(getDefaultGlossaryExplainPromptEs());
    setGlossaryExplainPromptEn(getDefaultGlossaryExplainPromptEn());

    // Save the defaults
    savePrompts();
  }

  // Helper functions to get default prompts
  // The built-in generation rules are ALWAYS applied server-side; this field
  // only adds extra preferences appended after them.
  function getDefaultArtifactSystemPrompt(target) {
    return [
      `These notes are appended after the built-in generation rules, which always apply.`,
      `Extra preferences for artifacts targeting the "${target}" CLI:`,
      `- Follow the conventions found in the repo memory files (AGENTS.md, CLAUDE.md).`,
      `- Keep the tone direct and technical; no marketing language.`,
    ].join("\n");
  }

  function getDefaultGlossaryDefinePromptEs() {
    return "Escribes entradas de glosario sobre términos de IA y de agentes de programación. Sé preciso y neutral, en español. Si no estás seguro de que el término exista, dilo en la definición. Incluye solo enlaces oficiales o autoritativos (o ninguno).";
  }

  function getDefaultGlossaryDefinePromptEn() {
    return "You write glossary entries about AI and coding-agent terms. Be accurate and neutral, in English. If you're not sure the term exists, say so in the definition. Include only official/authoritative links (or none).";
  }

  function getDefaultGlossaryExplainPromptEs() {
    return "Explicas conceptos de IA, machine learning y agentes de programación a desarrolladores de software. Escribe en español, con rigor técnico pero claro. Devuelve 3-5 párrafos cortos; usa intuición, un ejemplo o analogía concreta, y menciona cómo se usa o por qué importa en la práctica. Si encaja, incluye una breve lista con viñetas '- '. No uses encabezados Markdown ni repitas literalmente la definición breve. Solo el texto.";
  }

  function getDefaultGlossaryExplainPromptEn() {
    return "You explain AI, machine-learning and coding-agent concepts to software developers. Write in English, technically rigorous but clear. Return 3-5 short paragraphs; use intuition, a concrete example or analogy, and mention how it's used or why it matters in practice. If it fits, include a short '- ' bullet list. No Markdown headings, don't repeat the short definition verbatim. Text only.";
  }

  if (loading) {
    return (
      <section>
        <div className="card" style={{ padding: 20 }}>
          <p style={{ color: "var(--text-muted)" }}>{t("common.loading")}</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <p style={{ fontSize: "0.95rem", marginBottom: 12, fontWeight: 600 }}>
          <Settings size={18} style={{ display: "inline", verticalAlign: "-3px", marginRight: 8 }} />
          {t("promptSettings.intro")}
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="btn btn-ghost"
            onClick={savePrompts}
            disabled={saving}
            style={{ minHeight: 44, padding: "0 20px", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            {saving ? <><RefreshCw size={16} className="spin" /> {t("common.saving")}</> : t("common.save")}
          </button>
          <button
            className="btn btn-ghost"
            onClick={resetToDefaults}
            style={{ minHeight: 44, padding: "0 20px" }}
          >
            {t("promptSettings.reset")}
          </button>
          {saveError && <p style={{ color: "var(--clay)", marginTop: 8, fontSize: "0.85rem" }}>{saveError}</p>}
          {saveResult && <p style={{ color: "var(--leaf, #2a7a2a)", marginTop: 8, fontSize: "0.85rem" }}>{saveResult}</p>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {/* Artifact Generation Prompt */}
        <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 12 }}>
            {t("promptSettings.artifactGeneration")}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 12 }}>
            {t("promptSettings.artifactGenerationDesc")}
          </div>
          <textarea
            value={artifactSystemPrompt}
            onChange={(e) => setArtifactSystemPrompt(e.target.value)}
            style={{
              width: "100%",
              minHeight: 200,
              padding: 12,
              borderRadius: 8,
              border: "1px solid var(--line)",
              background: "var(--surface)",
              color: "var(--text)",
              fontSize: "0.88rem",
              fontFamily: "monospace",
              resize: "vertical",
              boxSizing: "border-box",
            }}
            placeholder={t("promptSettings.enterPrompt")}
          />
        </div>

        {/* Glossary Define Prompt - Spanish */}
        <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 12 }}>
            {t("promptSettings.glossaryDefine")} <span style={{ fontSize: "0.9rem", fontWeight: 400, color: "var(--text-muted)" }}>(ES)</span>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 12 }}>
            {t("promptSettings.glossaryDefineDesc")}
          </div>
          <textarea
            value={glossaryDefinePromptEs}
            onChange={(e) => setGlossaryDefinePromptEs(e.target.value)}
            style={{
              width: "100%",
              minHeight: 120,
              padding: 12,
              borderRadius: 8,
              border: "1px solid var(--line)",
              background: "var(--surface)",
              color: "var(--text)",
              fontSize: "0.88rem",
              fontFamily: "monospace",
              resize: "vertical",
              boxSizing: "border-box",
            }}
            placeholder={t("promptSettings.enterPrompt")}
          />
        </div>

        {/* Glossary Define Prompt - English */}
        <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 12 }}>
            {t("promptSettings.glossaryDefine")} <span style={{ fontSize: "0.9rem", fontWeight: 400, color: "var(--text-muted)" }}>(EN)</span>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 12 }}>
            {t("promptSettings.glossaryDefineDesc")}
          </div>
          <textarea
            value={glossaryDefinePromptEn}
            onChange={(e) => setGlossaryDefinePromptEn(e.target.value)}
            style={{
              width: "100%",
              minHeight: 120,
              padding: 12,
              borderRadius: 8,
              border: "1px solid var(--line)",
              background: "var(--surface)",
              color: "var(--text)",
              fontSize: "0.88rem",
              fontFamily: "monospace",
              resize: "vertical",
              boxSizing: "border-box",
            }}
            placeholder={t("promptSettings.enterPrompt")}
          />
        </div>

        {/* Glossary Explain Prompt - Spanish */}
        <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 12 }}>
            {t("promptSettings.glossaryExplain")} <span style={{ fontSize: "0.9rem", fontWeight: 400, color: "var(--text-muted)" }}>(ES)</span>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 12 }}>
            {t("promptSettings.glossaryExplainDesc")}
          </div>
          <textarea
            value={glossaryExplainPromptEs}
            onChange={(e) => setGlossaryExplainPromptEs(e.target.value)}
            style={{
              width: "100%",
              minHeight: 160,
              padding: 12,
              borderRadius: 8,
              border: "1px solid var(--line)",
              background: "var(--surface)",
              color: "var(--text)",
              fontSize: "0.88rem",
              fontFamily: "monospace",
              resize: "vertical",
              boxSizing: "border-box",
            }}
            placeholder={t("promptSettings.enterPrompt")}
          />
        </div>

        {/* Glossary Explain Prompt - English */}
        <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 12 }}>
            {t("promptSettings.glossaryExplain")} <span style={{ fontSize: "0.9rem", fontWeight: 400, color: "var(--text-muted)" }}>(EN)</span>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 12 }}>
            {t("promptSettings.glossaryExplainDesc")}
          </div>
          <textarea
            value={glossaryExplainPromptEn}
            onChange={(e) => setGlossaryExplainPromptEn(e.target.value)}
            style={{
              width: "100%",
              minHeight: 160,
              padding: 12,
              borderRadius: 8,
              border: "1px solid var(--line)",
              background: "var(--surface)",
              color: "var(--text)",
              fontSize: "0.88rem",
              fontFamily: "monospace",
              resize: "vertical",
              boxSizing: "border-box",
            }}
            placeholder={t("promptSettings.enterPrompt")}
          />
        </div>
      </div>
    </section>
  );
}