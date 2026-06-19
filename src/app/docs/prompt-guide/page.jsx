"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

// ── Component ──────────────────────────────────────────────────────────────

export default function PromptGuidePage() {
  const { lang, t } = useI18n();
  const principles = lang === "en" ? PRINCIPLES_EN : PRINCIPLES_ES;

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 64px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
        <h1 style={{ fontSize: "1.4rem", lineHeight: 1.3 }}>{t("guide.title")}</h1>
        <Link href="/" style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
          <ArrowLeft size={14} /> {t("nav.back")}
        </Link>
      </div>
      <p style={{ color: "var(--text-muted)", marginBottom: 32, fontSize: "0.9rem" }}>{t("guide.intro")}</p>

      <div style={{ display: "grid", gap: 20 }}>
        {principles.map((p) => (
          <section key={p.n} className="card" style={{ padding: "20px 24px" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 10, display: "flex", gap: 10, alignItems: "baseline" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "0.85rem", minWidth: 20 }}>{p.n}.</span>
              {p.title}
            </h2>

            <p style={{ fontSize: "0.88rem", lineHeight: 1.6, marginBottom: p.pattern || p.antipattern || p.note || p.checklist ? 12 : 0 }}>
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
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", background: "var(--cream)", borderRadius: 6, padding: "8px 12px", margin: 0, whiteSpace: "pre-line" }}>
                {p.note}
              </p>
            )}

            {p.checklist && (
              <ol style={{ margin: "4px 0 0", paddingLeft: 22, display: "grid", gap: 6 }}>
                {p.checklist.map((item, i) => (
                  <li key={i} style={{ fontSize: "0.88rem", lineHeight: 1.5 }}>{item}</li>
                ))}
              </ol>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}

function labelStyle(color) {
  return {
    display: "inline-block",
    fontSize: "0.7rem",
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
  fontSize: "0.8rem",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  margin: 0,
  fontFamily: "monospace",
};
