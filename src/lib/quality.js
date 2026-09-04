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

// Types whose body is prompt-like markdown instructions — the only ones the
// 10-point checklist applies to. Spec documents (openspec), MCP JSON entries
// and config snippets have their own formats and are not prompt-quality-checked.
export const PROMPT_LIKE_TYPES = ["agent", "subagent", "skill", "command"];

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

// ──────────────────────────────────────────────────────────────
// Spec (OpenSpec) quality checklist
// OpenSpec format: Purpose, Requirements (SHALL), Scenarios (GIVEN/WHEN/THEN)
// ──────────────────────────────────────────────────────────────

export const SPEC_QUALITY_KEYS = [
  "purpose",
  "requirements",
  "shall_count",
  "scenarios",
  "gherkin",
  "specificity",
  "testable",
];

export const SPEC_AUTO_KEYS = ["purpose", "requirements", "shall_count", "scenarios", "gherkin"];

export function lintSpec(body) {
  const b = body || "";
  const hasPurpose = /^#\s+Purpose\b|^##\s+Purpose\b|^###\s+Purpose\b/im.test(b);
  const hasRequirements = /^#\s+Requirements\b|^##\s+Requirements\b|^###\s+Requirements\b/im.test(b);
  const shallMatches = b.match(/\b(SHALL|MUST|DEBE)\b/gim);
  const shallCount = shallMatches ? shallMatches.length : 0;
  const hasScenarios = /^#\s+Scenarios\b|^##\s+Scenarios\b|^###\s+Scenarios\b/im.test(b);
  const hasGherkin = /\b(GIVEN|WHEN|THEN|DADO|CUANDO|ENTONCES)\b/gim.test(b);

  // Vague qualifiers that weaken requirements
  const vague = /\b(should|could|might|maybe|probably|eventually|soon|fast|easy|simple|user-friendly|robust|scalable)\b/gim;
  const vagueMatches = b.match(vague);
  const vagueCount = vagueMatches ? vagueMatches.length : 0;

  return {
    purpose: hasPurpose,
    requirements: hasRequirements,
    shall_count: shallCount >= 3,
    scenarios: hasScenarios,
    gherkin: hasGherkin,
    specificity: null, // manual: no vague qualifiers
    testable: null, // manual: each requirement is testable
    _meta: {
      shallCount,
      vagueCount,
    },
  };
}

export function autoSpecQuality(body) {
  const results = lintSpec(body);
  const failed = SPEC_AUTO_KEYS.filter((k) => !results[k]);
  return { results, passed: SPEC_AUTO_KEYS.length - failed.length, total: SPEC_AUTO_KEYS.length, failed, meta: results._meta };
}

export const SPEC_LIKE_TYPES = ["openspec"];
