// Shared 10-point prompt-quality checklist — single source of truth for the
// editor UI (PromptChecklist) and the AI generator's post-generation gate.
// Auto-detectable checks return true/false; manual ones return null.

export const QUALITY_KEYS = [
  "role",
  "instructions",
  "xml",
  "negative",
  "one_job",
  "example",
  "fallback",
  "specificity",
  "variables",
  "tested",
];

export const AUTO_KEYS = ["role", "xml", "negative", "example", "fallback", "variables"];

export function lintBody(body) {
  const b = body || "";
  return {
    role: /^(eres|you are|you're|sos)\b/i.test(b.trimStart()),
    instructions: null,
    xml: /<[a-z_]+>/.test(b),
    negative:
      /\bno\b.{0,40}[.;\n]|\bdon'?t\b|\bdo not\b|\bnever\b|\bnunca\b|\bno (puedes|debes|hagas)\b/i.test(b),
    one_job: null,
    example: /```|<example>|\bfor example\b|\bpor ejemplo\b|\bejemplo:/i.test(b),
    fallback:
      /(i|you) don'?t know|no sé|no tengo|insufficient|don'?t guess|no adivines|contexto insuficiente/i.test(b),
    specificity: null,
    variables: b.includes("{{") || b.trim() === "",
    tested: null,
  };
}

/** Evaluate the auto-detectable checks on a body template.
 *  Returns { results, passed, total, failed: [keys] }. */
export function autoQuality(body) {
  const results = lintBody(body);
  const failed = AUTO_KEYS.filter((k) => !results[k]);
  return { results, passed: AUTO_KEYS.length - failed.length, total: AUTO_KEYS.length, failed };
}
