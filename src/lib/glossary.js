// Curated baseline for the AI Glossary. Pure data — safe to import from server
// AND client (no DB / SDK import). Definitions here are committed static text
// (pre-generated, 0 runtime tokens); user-added terms get Groq-generated
// definitions cached in the `glossary_entries` table. Keep entries concise.

export const GLOSSARY_CATEGORIES = [
  { id: "concept", label: "Conceptos" },
  { id: "artifact", label: "Artefactos" },
  { id: "tool", label: "Herramientas / CLIs" },
  { id: "model", label: "Modelos" },
  { id: "protocol", label: "Protocolos" },
];

export const GLOSSARY_CATEGORY_IDS = GLOSSARY_CATEGORIES.map((c) => c.id);

export const GLOSSARY_SEED = [
  {
    id: "agent",
    term: "Agente",
    category: "artifact",
    aliases: ["agent"],
    definition:
      "La personalidad e instrucciones principales con las que conversas en un CLI de IA. Define su rol, tono y herramientas disponibles.",
    links: [],
  },
  {
    id: "subagent",
    term: "Subagente",
    category: "artifact",
    aliases: ["subagent"],
    definition:
      "Un agente especializado al que el agente principal delega una tarea acotada (revisar código, depurar…). Su descripción debe ser muy concreta para que se invoque en el momento adecuado.",
    links: [],
  },
  {
    id: "skill",
    term: "Skill",
    category: "artifact",
    aliases: ["habilidad"],
    definition:
      "Una capacidad reutilizable (procedimiento, checklist o formato) que el CLI carga de forma progresiva solo cuando su descripción es relevante para la tarea.",
    links: [],
  },
  {
    id: "slash-command",
    term: "Slash command",
    category: "artifact",
    aliases: ["comando", "command"],
    definition:
      "Un prompt con nombre que lanzas escribiendo /<nombre> en el chat. El cuerpo es el prompt que se envía; suele aceptar argumentos del usuario.",
    links: [],
  },
  {
    id: "mcp",
    term: "MCP (Model Context Protocol)",
    category: "protocol",
    aliases: ["Model Context Protocol"],
    definition:
      "Protocolo abierto que conecta herramientas y fuentes de datos externas (Postgres, GitHub, sistemas de archivos…) a un agente, exponiéndolas como herramientas que el modelo puede invocar.",
    links: [{ label: "modelcontextprotocol.io", url: "https://modelcontextprotocol.io" }],
  },
  {
    id: "frontmatter",
    term: "Frontmatter",
    category: "concept",
    aliases: [],
    definition:
      "El bloque de metadatos YAML al inicio de un archivo Markdown (entre líneas ---). En los artefactos lleva datos como descripción, modelo o herramientas permitidas.",
    links: [],
  },
  {
    id: "context-window",
    term: "Ventana de contexto",
    category: "concept",
    aliases: ["context window"],
    definition:
      "La cantidad máxima de tokens (entrada + salida) que un modelo puede tener en cuenta a la vez. Cuando se llena, hay que resumir o descartar contenido antiguo.",
    links: [],
  },
  {
    id: "tool-use",
    term: "Uso de herramientas",
    category: "concept",
    aliases: ["tool use", "function calling"],
    definition:
      "La capacidad de un modelo de pedir la ejecución de funciones externas (leer archivos, llamar APIs) y usar sus resultados para continuar la respuesta.",
    links: [],
  },
  {
    id: "rag",
    term: "RAG (Retrieval-Augmented Generation)",
    category: "concept",
    aliases: ["Retrieval-Augmented Generation"],
    definition:
      "Técnica que recupera fragmentos relevantes de una base de conocimiento y los añade al prompt, para que el modelo responda con información concreta y actualizada.",
    links: [],
  },
  {
    id: "token",
    term: "Token",
    category: "concept",
    aliases: [],
    definition:
      "La unidad mínima de texto que procesa un modelo (aprox. 3-4 caracteres o parte de una palabra). El coste y los límites de los modelos se miden en tokens.",
    links: [],
  },
  {
    id: "embedding",
    term: "Embedding",
    category: "concept",
    aliases: ["vector"],
    definition:
      "Representación numérica (un vector) de un texto que captura su significado, de modo que textos parecidos quedan cerca en el espacio vectorial. Base de la búsqueda semántica y de RAG.",
    links: [],
  },
  {
    id: "system-prompt",
    term: "System prompt",
    category: "concept",
    aliases: ["prompt de sistema"],
    definition:
      "Las instrucciones de máxima prioridad que fijan el comportamiento del modelo durante toda la conversación, por encima de los mensajes del usuario.",
    links: [],
  },
  {
    id: "hallucination",
    term: "Alucinación",
    category: "concept",
    aliases: ["hallucination"],
    definition:
      "Cuando un modelo genera información plausible pero falsa o inventada. Por eso conviene verificar datos críticos y citar fuentes.",
    links: [],
  },
  {
    id: "fine-tuning",
    term: "Fine-tuning",
    category: "concept",
    aliases: ["ajuste fino"],
    definition:
      "Reentrenar un modelo base con ejemplos propios para especializarlo en un dominio o estilo. Alternativa de mayor coste frente a prompting o RAG.",
    links: [],
  },
  {
    id: "claude",
    term: "Claude",
    category: "model",
    aliases: ["Anthropic"],
    definition:
      "Familia de modelos de IA de Anthropic, orientados a razonamiento, código y uso seguro. Disponible vía web, API y el CLI Claude Code.",
    links: [
      { label: "claude.ai", url: "https://claude.ai" },
      { label: "Claude Code", url: "https://claude.com/claude-code" },
    ],
  },
  {
    id: "chatgpt",
    term: "ChatGPT",
    category: "model",
    aliases: ["OpenAI", "GPT"],
    definition:
      "Asistente conversacional de OpenAI basado en los modelos GPT, ampliamente usado para generación de texto y código.",
    links: [{ label: "chatgpt.com", url: "https://chatgpt.com" }],
  },
  {
    id: "gemini",
    term: "Gemini",
    category: "model",
    aliases: ["Google"],
    definition:
      "Familia de modelos multimodales de Google. Cuenta con app web, API y el Gemini CLI para usarlo desde la terminal.",
    links: [
      { label: "gemini.google.com", url: "https://gemini.google.com" },
      { label: "Gemini CLI", url: "https://github.com/google-gemini/gemini-cli" },
    ],
  },
  {
    id: "cursor",
    term: "Cursor",
    category: "tool",
    aliases: [],
    definition:
      "Editor de código con IA integrada (basado en VS Code). Usa reglas en .cursor/rules para guiar al asistente dentro del proyecto.",
    links: [{ label: "cursor.com", url: "https://cursor.com" }],
  },
  {
    id: "opencode",
    term: "OpenCode",
    category: "tool",
    aliases: [],
    definition:
      "CLI de agente de programación de código abierto. Organiza agentes, skills y comandos en la carpeta .opencode del repo.",
    links: [{ label: "opencode.ai", url: "https://opencode.ai" }],
  },
  {
    id: "ollama",
    term: "Ollama",
    category: "tool",
    aliases: [],
    definition:
      "Herramienta para ejecutar modelos de lenguaje localmente en tu máquina, con una API compatible con OpenAI. Útil para generar sin gastar tokens de la nube.",
    links: [{ label: "ollama.com", url: "https://ollama.com" }],
  },
  {
    id: "github-copilot",
    term: "GitHub Copilot",
    category: "tool",
    aliases: ["copilot"],
    definition:
      "Asistente de programación de GitHub que sugiere código en el editor y responde preguntas sobre el repositorio.",
    links: [{ label: "github.com/features/copilot", url: "https://github.com/features/copilot" }],
  },
  {
    id: "groq",
    term: "Groq",
    category: "tool",
    aliases: [],
    definition:
      "Proveedor de inferencia de IA centrado en velocidad y bajo coste. En esta app genera las definiciones del glosario.",
    links: [{ label: "groq.com", url: "https://groq.com" }],
  },
];

export function getGlossaryEntry(id) {
  return GLOSSARY_SEED.find((e) => e.id === id) || null;
}
