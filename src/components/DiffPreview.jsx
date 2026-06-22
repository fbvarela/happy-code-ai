"use client";

export default function DiffPreview({ original, modified, path }) {
  const oldLines = (original || "").split("\n");
  const newLines = (modified || "").split("\n");

  const maxLen = Math.max(oldLines.length, newLines.length);
  const rows = [];

  for (let i = 0; i < maxLen; i++) {
    const o = i < oldLines.length ? oldLines[i] : undefined;
    const n = i < newLines.length ? newLines[i] : undefined;

    if (o === n) {
      rows.push({ type: "same", text: o });
    } else {
      if (o !== undefined) rows.push({ type: "removed", text: o });
      if (n !== undefined) rows.push({ type: "added", text: n });
    }
  }

  return (
    <div style={{ borderRadius: 8, border: "1px solid var(--line)", overflow: "hidden", fontSize: "0.82rem", fontFamily: "monospace" }}>
      {path && (
        <div style={{ padding: "6px 12px", background: "var(--cream)", borderBottom: "1px solid var(--line)", fontWeight: 600 }}>
          {path}
        </div>
      )}
      <div style={{ maxHeight: 400, overflow: "auto" }}>
        {rows.map((r, i) => (
          <div
            key={i}
            style={{
              padding: "1px 12px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              background:
                r.type === "removed" ? "rgba(180,60,40,0.12)"
                : r.type === "added" ? "rgba(60,140,60,0.12)"
                : "transparent",
              color:
                r.type === "removed" ? "var(--clay)"
                : r.type === "added" ? "var(--leaf, #2a7a2a)"
                : "var(--text)",
            }}
          >
            {r.type === "removed" ? "- " : r.type === "added" ? "+ " : "  "}
            {r.text}
          </div>
        ))}
        {rows.length === 0 && (
          <div style={{ padding: 12, color: "var(--text-muted)" }}>No differences</div>
        )}
      </div>
    </div>
  );
}
