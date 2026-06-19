"use client";

import { useState } from "react";
import { AGENT_LIMITS, estimateTokens } from "@/lib/agent-limits";

function fmt(n) {
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function Bar({ tokens, safe }) {
  const pct = Math.min(tokens / safe, 1);
  const over = tokens > safe;
  const near = tokens > safe * 0.7;
  const color = over ? "var(--clay)" : near ? "var(--sun)" : "var(--leaf)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: "var(--line)", overflow: "hidden" }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.12s" }} />
      </div>
      <span style={{ fontSize: "0.72rem", color, minWidth: 100, textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
        {fmt(tokens)} / {fmt(safe)} {over ? "⚠" : "✓"}
      </span>
    </div>
  );
}

function Row({ agent, tokens, faded }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: faded ? 0.5 : 1 }}>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", minWidth: 108, whiteSpace: "nowrap" }}>
        {agent.label}{agent.deprecated ? " †" : ""}
      </span>
      <Bar tokens={tokens} safe={agent.safe} />
    </div>
  );
}

export default function TokenMeter({ body, target }) {
  const [expanded, setExpanded] = useState(false);
  const tokens = estimateTokens(body);
  if (!tokens) return null;

  const primary = AGENT_LIMITS[target];
  const others = Object.entries(AGENT_LIMITS).filter(([k]) => k !== target);

  return (
    <div style={{ marginTop: 6, padding: "8px 10px", background: "var(--cream)", border: "1px solid var(--line)", borderRadius: 8 }}>
      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 6, fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase" }}>
        Token budget · ~{fmt(tokens)} tokens
      </div>

      {primary && <Row agent={primary} tokens={tokens} />}

      <button
        type="button"
        onClick={() => setExpanded((x) => !x)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.72rem", padding: "4px 0 0", display: "block" }}
      >
        {expanded ? "▲ hide comparison" : "▼ compare all agents"}
      </button>

      {expanded && (
        <div style={{ marginTop: 8, display: "grid", gap: 5 }}>
          {others.map(([key, agent]) => (
            <Row key={key} agent={agent} tokens={tokens} faded={agent.deprecated} />
          ))}
          <p style={{ margin: "4px 0 0", fontSize: "0.68rem", color: "var(--text-muted)" }}>
            Safe cap leaves headroom for conversation + file context. † Codex CLI is deprecated.
          </p>
        </div>
      )}
    </div>
  );
}
