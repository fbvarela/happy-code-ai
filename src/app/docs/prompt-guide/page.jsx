"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";

// ── Content ────────────────────────────────────────────────────────────────

const PRINCIPLES_ES = [
  {
    n: 1,
    title: "Empieza con el rol, luego la tarea",
    why: "Claude infiere su comportamiento de las primeras frases. Un rol claro («Eres un auditor de seguridad senior») ajusta el tono, vocabulario y umbrales antes de que se describa la tarea.",
    pattern: `You are a [role] specializing in [domain].
Your job is to [primary task].`,
    antipattern: "Enterrar el rol en el tercer párrafo, o no incluirlo y confiar solo en la descripción de la tarea.",
  },
  {
    n: 2,
    title: "Instrucciones antes del contenido",
    why: "Claude procesa el prompt de izquierda a derecha. Poner las instrucciones primero significa que el modelo lee cómo abordar el contenido antes de leer el contenido en sí, lo que mejora el seguimiento de instrucciones en entradas largas.",
    pattern: `Revisa el siguiente código en busca de problemas de seguridad.
Céntrate solo en autenticación y autorización. Ignora el estilo.

<code>
{{code}}
</code>`,
    antipattern: `<code>{{code}}</code>

Revisa lo anterior en busca de problemas de seguridad.`,
  },
  {
    n: 3,
    title: "Usa tags XML para separar secciones",
    why: "Claude fue entrenado con estructura XML. Los tags crean límites inequívocos que sobreviven al copy-paste, concatenación y sustitución de plantillas.",
    pattern: `<instructions>
Solo responde preguntas sobre el documento proporcionado.
Si la respuesta no está en el documento, di "No lo sé."
</instructions>

<document>
{{document}}
</document>

<question>{{question}}</question>`,
    antipattern: "Usar cabeceras Markdown (## Instrucciones) para separar secciones — funcionan, pero los tags XML son más fiables entre versiones de Claude.",
    note: "Tags útiles: <instructions>, <context>, <examples>, <input>, <output_format>, <constraints>, <thinking>, <answer>.",
  },
  {
    n: 4,
    title: "Sé explícito sobre qué NO hacer",
    why: "Las instrucciones positivas se interpretan correctamente, pero Claude a veces añade contenido no solicitado (avisos, disculpas, contexto extra). Prohibir explícitamente el comportamiento no deseado es más fiable que esperar que la instrucción positiva lo implique.",
    pattern: `Escribe el mensaje de commit.
Devuelve solo el texto del mensaje — sin explicación, sin preámbulo, sin salto de línea final.
No lo envuelvas en comillas ni en un bloque de código.`,
    antipattern: "«Escribe solo el mensaje de commit.» — «solo» es ambiguo.",
  },
  {
    n: 5,
    title: "Un trabajo por prompt",
    why: "Claude rinde mejor con una tarea única y claramente delimitada. Los prompts que piden múltiples salidas independientes hacen que el modelo distribuya calidad y dificultan el análisis del output.",
    pattern: "Un system prompt = una responsabilidad. Encadena múltiples prompts para pipelines de varios pasos, o usa subagentes para delegar trabajos separados.",
    antipattern: "Un system prompt de 600 palabras que cubre revisión de código, generación de tests, documentación y mensajes de commit en el mismo cuerpo.",
  },
  {
    n: 6,
    title: "Ancla el modelo con ejemplos (few-shot)",
    why: "Describir el formato de salida deseado es menos fiable que mostrarlo. Un ejemplo que demuestre el formato exacto, tono y nivel de detalle vale tres párrafos de descripción.",
    pattern: `Formatea cada hallazgo como:
<finding>
  <file>src/auth.js</file>
  <line>42</line>
  <severity>high</severity>
  <description>SQL injection via unsanitized user input</description>
  <fix>Use parameterized queries</fix>
</finding>`,
    antipattern: "«Devuelve los hallazgos como datos estructurados con archivo, línea, severidad, descripción y corrección.» — el modelo inventará un formato que puede variar entre llamadas.",
  },
  {
    n: 7,
    title: "Di al modelo qué hacer cuando no sabe",
    why: "Claude alucinará una respuesta en vez de admitir incertidumbre si el prompt no le da permiso para decir «no sé». Manejar explícitamente el caso incierto reduce la fabricación.",
    pattern: `Si no puedes determinar la respuesta a partir del código proporcionado, di:
"Contexto insuficiente: necesito [cosa específica] para responder esto."
No adivines.`,
    antipattern: "Dejar el caso de error implícito. El modelo rellenará el hueco con la respuesta más plausible, que puede ser incorrecta.",
  },
  {
    n: 8,
    title: "Prefiere especificidad sobre longitud",
    why: "Un prompt de 50 palabras con restricciones precisas supera a uno de 500 con guías vagas. Los prompts largos aumentan el coste, reducen la tasa de caché y diluyen las instrucciones más importantes.",
    pattern: null,
    antipattern: null,
    note: `Reemplaza...
• «sé conciso» → «responde en ≤ 3 frases»
• «céntrate en los problemas importantes» → «reporta solo severidad alta y crítica»
• «sigue las buenas prácticas» → «sigue PEP 8 para Python, Google style para JS»
• «explica tu razonamiento» → «piensa paso a paso dentro de tags <thinking>»`,
  },
  {
    n: 9,
    title: "Usa prefilling para controlar el formato de salida",
    scope: "api",
    why: "Precompleting el turno del asistente (iniciando la respuesta del modelo) es la forma más fiable de hacer cumplir el formato de salida en llamadas API.",
    pattern: `// En la API de Anthropic:
{
  "messages": [
    { "role": "user", "content": "Clasifica el sentimiento." },
    { "role": "assistant", "content": "{\\"sentiment\\":" }
  ]
}`,
    antipattern: null,
    note: "El prefilling es una técnica de API. En artefactos de CLI, aproxima el resultado con instrucciones fuertes de <output_format> y un ejemplo concreto.",
  },
  {
    n: 10,
    title: "Diseña para la caché",
    why: "La caché de prompts de Claude tiene un TTL de 5 minutos. Los system prompts idénticos entre peticiones utilizan la caché y cuestan ~10× menos. El contenido variable pertenece al turno del usuario, no al system prompt.",
    pattern: "System prompt = instrucciones estables + ejemplos. Turno del usuario = el input real (fragmento de código, pregunta, documento).",
    antipattern: "Interpolar {{filename}} o timestamps directamente en el system prompt — esto invalida la caché en cada llamada.",
  },
  {
    n: 11,
    title: "Calibra el presupuesto de pensamiento según la tarea",
    scope: "not-haiku",
    why: "El pensamiento extendido (donde Claude razona paso a paso antes de responder) cuesta más tokens pero mejora significativamente la precisión en tareas de razonamiento multi-paso. Es excesivo para conversiones de formato o búsquedas simples.",
    pattern: null,
    antipattern: null,
    note: `Usa pensamiento extendido cuando:
• La tarea requiere más de dos pasos lógicos
• La respuesta depende de sopesar restricciones en competencia
• La corrección importa más que la latencia

Omítelo cuando:
• El output es determinista (conversión de formato, extracción)
• La tarea es una búsqueda o clasificación simple
• La latencia es una restricción dura`,
  },
  {
    n: 12,
    title: "El checklist",
    why: "Antes de guardar cualquier agente, skill o system prompt, verifica estos 10 puntos.",
    pattern: null,
    antipattern: null,
    checklist: [
      "Rol definido en la primera frase.",
      "Las instrucciones van antes del contenido que describen.",
      "Tags XML usados en prompts con varias secciones.",
      "Al menos una instrucción negativa («no hagas…») por modo de fallo común.",
      "El prompt hace UN solo trabajo. Si hace dos, divídelo.",
      "Al menos un ejemplo concreto para cualquier formato de output no trivial.",
      "El caso «no sé» está manejado explícitamente.",
      "Calificadores vagos reemplazados por restricciones específicas.",
      "El contenido variable está en variables ({{…}}), no hardcodeado.",
      "Probado con al menos una entrada real.",
    ],
  },
];

const PRINCIPLES_EN = [
  {
    n: 1,
    title: "Start with the role, then the task",
    why: `Claude infers its behavior from the opening sentences. A clear role ("You are a senior security auditor") primes tone, vocabulary, and refusal thresholds before the task is described.`,
    pattern: `You are a [role] specializing in [domain].
Your job is to [primary task].`,
    antipattern: "Burying the role in paragraph three, or omitting it and relying on task description alone.",
  },
  {
    n: 2,
    title: "Instructions before content",
    why: "Claude processes the prompt left-to-right. Placing instructions first means the model reads how to approach the content before it reads the content itself, which improves instruction-following on long inputs.",
    pattern: `Review the following code for security issues.
Focus only on authentication and authorization. Ignore style.

<code>
{{code}}
</code>`,
    antipattern: `<code>{{code}}</code>

Review the above for security issues.`,
  },
  {
    n: 3,
    title: "Use XML tags to separate roles and sections",
    why: "Claude was trained with XML-tagged structure. Tags create unambiguous boundaries that survive copy-paste, concatenation, and template substitution.",
    pattern: `<instructions>
Only answer questions about the provided document.
If the answer is not in the document, say "I don't know."
</instructions>

<document>
{{document}}
</document>

<question>{{question}}</question>`,
    antipattern: "Using markdown headers (## Instructions) for structural separation — they work, but XML tags are more reliable across Claude model versions.",
    note: "Useful tags: <instructions>, <context>, <examples>, <input>, <output_format>, <constraints>, <thinking>, <answer>.",
  },
  {
    n: 4,
    title: "Be explicit about what NOT to do",
    why: "Positive instructions are parsed correctly, but Claude will sometimes add unrequested content (caveats, apologies, extra context). Explicitly forbidding unwanted behavior is more reliable than hoping the positive instruction implies it.",
    pattern: `Write the commit message.
Return only the message text — no explanation, no preamble, no trailing newline.
Do not wrap it in quotes or a code block.`,
    antipattern: '"Write just the commit message." — "just" is ambiguous.',
  },
  {
    n: 5,
    title: "One job per prompt",
    why: "Claude performs best on a single, clearly scoped task. Prompts that ask for multiple independent outputs cause the model to trade off quality across tasks and make the output harder to parse.",
    pattern: "One system prompt = one responsibility. Chain multiple prompts for multi-step pipelines, or use subagents to delegate separate jobs.",
    antipattern: "A 600-word system prompt that covers code review, test generation, documentation, and commit messages in the same body.",
  },
  {
    n: 6,
    title: "Ground the model in examples (few-shot)",
    why: "Describing the desired output format is less reliable than showing it. A single example that demonstrates the exact format, tone, and level of detail is worth three paragraphs of description.",
    pattern: `Format each finding as:
<finding>
  <file>src/auth.js</file>
  <line>42</line>
  <severity>high</severity>
  <description>SQL injection via unsanitized user input</description>
  <fix>Use parameterized queries</fix>
</finding>`,
    antipattern: '"Return findings as structured data with file, line, severity, description, and fix." — the model will invent a format and it may vary between calls.',
  },
  {
    n: 7,
    title: "Tell the model what to do when it's stuck",
    why: "Claude will hallucinate an answer rather than admit uncertainty if the prompt doesn't give it permission to say 'I don't know.' Explicitly handling the uncertain case reduces fabrication.",
    pattern: `If you cannot determine the answer from the provided code, say:
"Insufficient context: I need [specific thing] to answer this."
Do not guess.`,
    antipattern: "Leaving the fallback implicit. The model will fill the gap with the most plausible-sounding answer, which may be wrong.",
  },
  {
    n: 8,
    title: "Prefer specificity over length",
    why: "A 50-word prompt with precise constraints outperforms a 500-word prompt with vague guidance. Long prompts increase cost, reduce cache hit rate, and dilute the most important instructions.",
    pattern: null,
    antipattern: null,
    note: `Replace…
• "be concise" → "respond in ≤ 3 sentences"
• "focus on important issues" → "report only severity high and critical"
• "follow best practices" → "follow PEP 8 for Python, Google style for JS"
• "explain your reasoning" → "think step by step inside <thinking> tags"`,
  },
  {
    n: 9,
    title: "Use prefilling to control output format",
    scope: "api",
    why: "Prefilling the assistant turn (starting the model's response for it) is the most reliable way to enforce output format in API calls.",
    pattern: `// Anthropic API:
{
  "messages": [
    { "role": "user", "content": "Classify the sentiment." },
    { "role": "assistant", "content": "{\\"sentiment\\":" }
  ]
}`,
    antipattern: null,
    note: "Prefilling is an API technique. In CLI artifacts, approximate it with strong <output_format> instructions and a concrete example.",
  },
  {
    n: 10,
    title: "Design for the cache",
    why: "Claude's prompt cache has a 5-minute TTL. System prompts that are identical across requests hit the cache and cost ~10× less. Variable content belongs in the user turn, not the system prompt.",
    pattern: "System prompt = stable instructions + examples. User turn = the actual input (code snippet, question, document).",
    antipattern: "Interpolating {{filename}} or timestamps directly into the system prompt — this busts the cache on every call.",
  },
  {
    n: 11,
    title: "Calibrate the thinking budget to the task",
    scope: "not-haiku",
    why: "Extended thinking costs more tokens but significantly improves accuracy on multi-step reasoning tasks. It is overkill for format conversions or simple lookups.",
    pattern: null,
    antipattern: null,
    note: `Use extended thinking when:
• The task requires more than two logical steps
• The answer depends on weighing competing constraints
• Correctness matters more than latency

Skip it when:
• The output is deterministic (format conversion, extraction)
• The task is a single lookup or classification
• Latency is a hard constraint`,
  },
  {
    n: 12,
    title: "The checklist",
    why: "Before saving any agent, skill, or system prompt, verify these 10 points.",
    pattern: null,
    antipattern: null,
    checklist: [
      "Role defined in the first sentence.",
      "Instructions come before the content they describe.",
      "XML tags used for multi-section prompts.",
      `At least one negative instruction ("do not…") for each common failure mode.`,
      "Prompt does one job. If it does two, split it.",
      "At least one concrete example for any non-trivial output format.",
      `The "I don't know" case is handled explicitly.`,
      "Vague qualifiers replaced with specific constraints.",
      "Variable content is in variables ({{…}}), not hardcoded.",
      "Tested with at least one real input.",
    ],
  },
];

// ── Agents ─────────────────────────────────────────────────────────────────

// xmlTags / prefilling / caching / thinking:
//   true = supported  |  false = not supported
//   "partial" = limited/workaround  |  "builtin" = automatic, no user control

const AGENTS = [
  {
    name: "Claude",
    provider: "Anthropic",
    context: "200K",
    isNew: false,
    isDeprecated: false,
    tagline_es: "El único agente entrenado con XML estructural nativo. Caché de prompts y pensamiento extendido en Sonnet/Opus.",
    tagline_en: "The only agent trained with native structural XML. Prompt caching and extended thinking on Sonnet/Opus.",
    xmlTags: true,
    prefilling: true,
    caching: true,
    thinking: true,
    bestFor_es: "Agentes, código, análisis, roleplay, razonamiento complejo.",
    bestFor_en: "Agents, coding, analysis, roleplay, complex reasoning.",
    tip_es: "Principios 3, 9 y 10 de esta guía son exclusivos de Claude. El pensamiento extendido no está disponible en Haiku.",
    tip_en: "Principles 3, 9 and 10 in this guide are Claude-specific. Extended thinking is not available on Haiku.",
    docs: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
  },
  {
    name: "GPT-4o / o1 / o3",
    provider: "OpenAI",
    context: "128K–200K",
    isNew: false,
    isDeprecated: false,
    tagline_es: "Prefiere Markdown sobre XML. o1/o3 tienen razonamiento integrado sin control de budget.",
    tagline_en: "Prefers Markdown over XML. o1/o3 have built-in reasoning with no budget control.",
    xmlTags: false,
    prefilling: "partial",
    caching: "partial",
    thinking: "builtin",
    bestFor_es: "Tareas generales, código, análisis. o1/o3 para razonamiento multi-paso.",
    bestFor_en: "General tasks, coding, analysis. o1/o3 for multi-step reasoning.",
    tip_es: "Reemplaza los tags XML por Markdown (## Sección) o delimitadores como ---. Los modelos o1/o3 razonan solos, no uses chain-of-thought explícito.",
    tip_en: "Replace XML tags with Markdown (## Section) or delimiters like ---. o1/o3 reason on their own — do not use explicit chain-of-thought.",
    docs: "https://platform.openai.com/docs/guides/prompt-engineering",
  },
  {
    name: "GitHub Copilot",
    provider: "Microsoft / OpenAI",
    context: "repo-aware",
    isNew: false,
    isDeprecated: false,
    tagline_es: "Instrucciones persistentes vía .github/copilot-instructions.md. Sin control directo de modelo.",
    tagline_en: "Persistent instructions via .github/copilot-instructions.md. No direct model control.",
    xmlTags: false,
    prefilling: false,
    caching: false,
    thinking: false,
    bestFor_es: "Autocompletado en IDE, revisión de PR, comandos de terminal con Copilot CLI.",
    bestFor_en: "IDE autocomplete, PR review, terminal commands via Copilot CLI.",
    tip_es: "Pon las convenciones del proyecto en .github/copilot-instructions.md. Ese archivo actúa como system prompt persistente para todo el repo.",
    tip_en: "Put project conventions in .github/copilot-instructions.md. That file acts as a persistent system prompt for the whole repo.",
    docs: "https://docs.github.com/en/copilot/using-github-copilot/prompt-engineering-for-github-copilot",
  },
  {
    name: "Gemini",
    provider: "Google",
    context: "1M–2M",
    isNew: false,
    isDeprecated: false,
    tagline_es: "Ventana de contexto enorme. Caché de contexto explícita. Flash Thinking en algunos modelos.",
    tagline_en: "Huge context window. Explicit context caching. Flash Thinking on some models.",
    xmlTags: false,
    prefilling: false,
    caching: true,
    thinking: "partial",
    bestFor_es: "Bases de código grandes, análisis de documentos largos, tareas que requieren contexto masivo.",
    bestFor_en: "Large codebases, long-document analysis, tasks requiring massive context.",
    tip_es: "Mete el repo entero en el contexto y cachea el contenido base. Prefiere texto natural o Markdown, no XML.",
    tip_en: "Include the entire repo in context and cache the base content. Prefer natural text or Markdown, not XML.",
    docs: "https://ai.google.dev/gemini-api/docs/prompting-strategies",
  },
  {
    name: "Hermes / Nous",
    provider: "Nous Research",
    context: "8K–128K",
    isNew: false,
    isDeprecated: false,
    tagline_es: "Modelos open-source con formato ChatML. Compatible con Ollama y llama.cpp.",
    tagline_en: "Open-source models using ChatML format. Compatible with Ollama and llama.cpp.",
    xmlTags: false,
    prefilling: true,
    caching: false,
    thinking: false,
    bestFor_es: "Despliegue local, privacidad total, fine-tuning, prototipado sin API externa.",
    bestFor_en: "Local deployment, full privacy, fine-tuning, prototyping without external API.",
    tip_es: "Usa el formato ChatML (<|im_start|>system ... <|im_end|>). El prefilling funciona con control total sobre el modelo.",
    tip_en: "Use ChatML format (<|im_start|>system ... <|im_end|>). Prefilling works with full model control.",
    docs: "https://huggingface.co/NousResearch",
  },
  {
    name: "Codex",
    provider: "OpenAI",
    context: "8K",
    isNew: false,
    isDeprecated: true,
    tagline_es: "Modelo original de generación de código de OpenAI. Reemplazado por GPT-4o.",
    tagline_en: "OpenAI original code generation model. Superseded by GPT-4o.",
    xmlTags: false,
    prefilling: false,
    caching: false,
    thinking: false,
    bestFor_es: "Ya no se recomienda para nuevos proyectos. Usa GPT-4o o GitHub Copilot.",
    bestFor_en: "No longer recommended for new projects. Use GPT-4o or GitHub Copilot.",
    tip_es: "Codex está deprecado. Si lo ves en proyectos heredados, los mismos principios de claridad y especificidad aplican.",
    tip_en: "Codex is deprecated. If you encounter it in legacy projects, the same clarity and specificity principles apply.",
    docs: "https://openai.com/index/openai-codex/",
  },
];

// Principles with agent-specific scope (number → badge label keys)
const PRINCIPLE_SCOPE = {
  3:  { key: "claudeOnly",     color: "var(--bark)" },
  9:  { key: "apiOnly",        color: "var(--leaf)" },
  10: { key: "claudeGemini",   color: "var(--leaf)" },
  11: { key: "thinkingAgents", color: "var(--sun)"  },
};

// ── Links ──────────────────────────────────────────────────────────────────

const LINKS = [
  {
    category_es: "Fundamentos",
    category_en: "Foundations",
    items: [
      {
        label: "Prompt engineering overview",
        url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
        desc_es: "Guía oficial de Anthropic sobre técnicas de prompting.",
        desc_en: "Anthropic's official guide to prompting techniques.",
      },
      {
        label: "Claude models overview",
        url: "https://docs.anthropic.com/en/docs/about-claude/models/overview",
        desc_es: "IDs de modelo actuales y capacidades de cada versión de Claude.",
        desc_en: "Current model IDs and capabilities for each Claude version.",
      },
    ],
  },
  {
    category_es: "Técnicas avanzadas",
    category_en: "Advanced techniques",
    items: [
      {
        label: "Extended thinking",
        url: "https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking",
        desc_es: "Cuándo y cómo activar el razonamiento extendido paso a paso.",
        desc_en: "When and how to enable step-by-step extended reasoning.",
      },
      {
        label: "Prompt caching",
        url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching",
        desc_es: "Reduce costes hasta 10× cacheando el system prompt entre llamadas.",
        desc_en: "Cut costs up to 10× by caching the system prompt across calls.",
      },
      {
        label: "Tool use (function calling)",
        url: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview",
        desc_es: "Integra Claude con herramientas y APIs externas.",
        desc_en: "Integrate Claude with external tools and APIs.",
      },
    ],
  },
  {
    category_es: "Claude Code",
    category_en: "Claude Code",
    items: [
      {
        label: "Claude Code documentation",
        url: "https://docs.anthropic.com/en/docs/claude-code/overview",
        desc_es: "Referencia completa del CLI de Claude Code: comandos, hooks, MCP.",
        desc_en: "Full Claude Code CLI reference: commands, hooks, MCP.",
      },
      {
        label: "Claude Code skills (slash commands)",
        url: "https://docs.anthropic.com/en/docs/claude-code/slash-commands",
        desc_es: "Cómo crear y compartir skills reutilizables en Claude Code.",
        desc_en: "How to create and share reusable skills in Claude Code.",
      },
    ],
  },
  {
    category_es: "Ejemplos y recetas",
    category_en: "Examples & recipes",
    items: [
      {
        label: "Anthropic Cookbook (GitHub)",
        url: "https://github.com/anthropics/anthropic-cookbook",
        desc_es: "Notebooks y recetas para patrones comunes de uso de la API.",
        desc_en: "Notebooks and recipes for common API usage patterns.",
      },
      {
        label: "Anthropic Courses (GitHub)",
        url: "https://github.com/anthropics/courses",
        desc_es: "Cursos oficiales de Anthropic sobre prompt engineering y agentes.",
        desc_en: "Anthropic's official courses on prompt engineering and agents.",
      },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function PromptGuidePage() {
  const { lang, t } = useI18n();
  const principles = lang === "en" ? PRINCIPLES_EN : PRINCIPLES_ES;

  return (
    <div className="main-content">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1>{t("guide.title")}</h1>
          <Link href="/" style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <ArrowLeft size={14} /> {t("nav.back")}
          </Link>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
      <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "0.95rem", lineHeight: 1.6 }}>{t("guide.intro")}</p>

      <div style={{ display: "grid", gap: 20 }}>
        {principles.map((p) => (
          <section key={p.n} className="card" style={{ padding: "20px 24px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 10, display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "1rem", minWidth: 20 }}>{p.n}.</span>
              <span style={{ flex: 1 }}>{p.title}</span>
              {PRINCIPLE_SCOPE[p.n] && (
                <span style={scopeBadge(PRINCIPLE_SCOPE[p.n].color)}>{t("guide.models." + PRINCIPLE_SCOPE[p.n].key)}</span>
              )}
            </h2>

            <p style={{ fontSize: "1rem", lineHeight: 1.65, marginBottom: p.pattern || p.antipattern || p.note || p.checklist ? 12 : 0 }}>
              {p.why}
            </p>

            {p.pattern && (
              <div style={{ marginBottom: 10 }}>
                <span style={labelStyle("var(--leaf)")}>pattern</span>
                <pre style={codeStyle}>{p.pattern}</pre>
              </div>
            )}

            {p.antipattern && (
              <div style={{ marginBottom: 10 }}>
                <span style={labelStyle("var(--clay)")}>anti-pattern</span>
                <pre style={{ ...codeStyle, borderColor: "color-mix(in srgb, var(--clay) 30%, transparent)" }}>{p.antipattern}</pre>
              </div>
            )}

            {p.note && (
              <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", background: "var(--cream)", borderRadius: 6, padding: "10px 14px", margin: 0, whiteSpace: "pre-line" }}>
                {p.note}
              </p>
            )}

            {p.checklist && (
              <ol style={{ margin: "4px 0 0", paddingLeft: 22, display: "grid", gap: 6 }}>
                {p.checklist.map((item, i) => (
                  <li key={i} style={{ fontSize: "1rem", lineHeight: 1.55 }}>{item}</li>
                ))}
              </ol>
            )}
          </section>
        ))}
      </div>

      {/* Agent comparison */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: 20 }}>{t("guide.models.title")}</h2>
        <div className="card-grid" style={{ gap: 14 }}>
          {AGENTS.map((a) => (
            <a
              key={a.name}
              href={a.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
              style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10, textDecoration: "none", color: "inherit", opacity: a.isDeprecated ? 0.65 : 1 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>{a.name}</span>
                <span style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>{a.provider}</span>
                {a.isNew && <span style={scopeBadge("var(--leaf)")}>{t("guide.models.new")}</span>}
                {a.isDeprecated && <span style={scopeBadge("var(--clay)")}>{t("guide.models.deprecated")}</span>}
              </div>
              <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                {lang === "en" ? a.tagline_en : a.tagline_es}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <CapBadge ok={a.xmlTags} label={t("guide.models.xmlTags")} partial={t("guide.models.partial")} builtin={t("guide.models.builtin")} />
                <CapBadge ok={a.prefilling} label={t("guide.models.prefilling")} partial={t("guide.models.partial")} builtin={t("guide.models.builtin")} />
                <CapBadge ok={a.caching} label={t("guide.models.caching")} partial={t("guide.models.partial")} builtin={t("guide.models.builtin")} />
                <CapBadge ok={a.thinking} label={t("guide.models.thinking")} partial={t("guide.models.partial")} builtin={t("guide.models.builtin")} />
                <span style={{ ...capBase, background: "var(--cream)", color: "var(--text-muted)" }}>
                  {t("guide.models.context")}: {a.context}
                </span>
              </div>
              <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", margin: 0 }}>
                <strong>{t("guide.models.bestFor")}:</strong> {lang === "en" ? a.bestFor_en : a.bestFor_es}
              </p>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0, background: "var(--cream)", borderRadius: 6, padding: "8px 12px", lineHeight: 1.55 }}>
                <strong>{t("guide.models.tip")}:</strong> {lang === "en" ? a.tip_en : a.tip_es}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* Useful links */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: 20 }}>{t("guide.links.title")}</h2>
        <div style={{ display: "grid", gap: 16 }}>
          {LINKS.map((group) => (
            <div key={group.category_en}>
              <h3 style={{ fontSize: "0.88rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>
                {lang === "en" ? group.category_en : group.category_es}
              </h3>
              <div style={{ display: "grid", gap: 8 }}>
                {group.items.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card"
                    style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 2, textDecoration: "none", color: "inherit" }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--bark)" }}>{link.label}</span>
                    <span style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>{lang === "en" ? link.desc_en : link.desc_es}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CapBadge({ ok, label, partial, builtin }) {
  const isPartial = ok === "partial";
  const isBuiltin = ok === "builtin";
  const color = ok === true || isBuiltin ? "var(--leaf)" : isPartial ? "var(--sun)" : "var(--clay)";
  const icon = ok === true ? "✓" : isBuiltin ? "⊙" : isPartial ? "~" : "✗";
  const suffix = isPartial ? ` (${partial})` : isBuiltin ? ` (${builtin})` : "";
  return (
    <span style={{ ...capBase, background: "color-mix(in srgb, " + color + " 13%, transparent)", color }}>
      {icon} {label}{suffix}
    </span>
  );
}

const capBase = {
  fontSize: "0.82rem",
  fontWeight: 600,
  borderRadius: 4,
  padding: "2px 7px",
  border: "1px solid color-mix(in srgb, currentColor 25%, transparent)",
};

function scopeBadge(color) {
  return {
    fontSize: "0.82rem",
    fontWeight: 700,
    color,
    background: "color-mix(in srgb, " + color + " 12%, transparent)",
    border: "1px solid color-mix(in srgb, " + color + " 30%, transparent)",
    borderRadius: 4,
    padding: "1px 7px",
    whiteSpace: "nowrap",
  };
}

function labelStyle(color) {
  return {
    display: "inline-block",
    fontSize: "0.82rem",
    fontWeight: 700,
    color,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 4,
  };
}

const codeStyle = {
  background: "var(--cream)",
  border: "1px solid var(--line)",
  borderRadius: 6,
  padding: "10px 12px",
  fontSize: "0.95rem",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  margin: 0,
  fontFamily: "monospace",
};
