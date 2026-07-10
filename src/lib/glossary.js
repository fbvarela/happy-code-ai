// Curated baseline for the AI Glossary. Pure data — safe to import from server
// AND client (no DB / SDK import). Definitions here are committed static text
// (pre-generated, 0 runtime tokens); user-added terms get Groq-generated
// definitions cached in the `glossary_entries` table. Bilingual: `*_en` fields
// hold the English version (the UI picks via pickLang). Keep entries concise.

export const GLOSSARY_CATEGORIES = [
  { id: "concept", label: "Conceptos", label_en: "Concepts" },
  { id: "ml", label: "Machine learning", label_en: "Machine learning" },
  { id: "artifact", label: "Artefactos", label_en: "Artifacts" },
  { id: "tool", label: "Herramientas / CLIs", label_en: "Tools / CLIs" },
  { id: "model", label: "Modelos", label_en: "Models" },
  { id: "protocol", label: "Protocolos", label_en: "Protocols" },
  { id: "jvm", label: "JVM / Spring", label_en: "JVM / Spring" },
];

export const GLOSSARY_CATEGORY_IDS = GLOSSARY_CATEGORIES.map((c) => c.id);

export const GLOSSARY_SEED = [
  {
    id: "agent",
    term: "Agente",
    term_en: "Agent",
    category: "artifact",
    aliases: ["agent"],
    definition:
      "La personalidad e instrucciones principales con las que conversas en un CLI de IA. Define su rol, tono y herramientas disponibles.",
    definition_en:
      "The main personality and instructions you talk to in an AI CLI. It defines its role, tone and available tools.",
    links: [],
  },
  {
    id: "subagent",
    term: "Subagente",
    term_en: "Subagent",
    category: "artifact",
    aliases: ["subagent"],
    definition:
      "Un agente especializado al que el agente principal delega una tarea acotada (revisar código, depurar…). Su descripción debe ser muy concreta para que se invoque en el momento adecuado.",
    definition_en:
      "A specialized agent the main agent delegates a scoped task to (review code, debug…). Its description must be very specific so it's invoked at the right moment.",
    links: [],
  },
  {
    id: "skill",
    term: "Skill",
    term_en: "Skill",
    category: "artifact",
    aliases: ["habilidad"],
    definition:
      "Una capacidad reutilizable (procedimiento, checklist o formato) que el CLI carga de forma progresiva solo cuando su descripción es relevante para la tarea.",
    definition_en:
      "A reusable capability (procedure, checklist or format) the CLI loads progressively, only when its description is relevant to the task.",
    links: [],
  },
  {
    id: "slash-command",
    term: "Slash command",
    term_en: "Slash command",
    category: "artifact",
    aliases: ["comando", "command"],
    definition:
      "Un prompt con nombre que lanzas escribiendo /<nombre> en el chat. El cuerpo es el prompt que se envía; suele aceptar argumentos del usuario.",
    definition_en:
      "A named prompt you launch by typing /<name> in the chat. The body is the prompt that gets sent; it usually accepts user arguments.",
    links: [],
  },
  {
    id: "mcp",
    term: "MCP (Model Context Protocol)",
    term_en: "MCP (Model Context Protocol)",
    category: "protocol",
    aliases: ["Model Context Protocol"],
    definition:
      "Protocolo abierto que conecta herramientas y fuentes de datos externas (Postgres, GitHub, sistemas de archivos…) a un agente, exponiéndolas como herramientas que el modelo puede invocar.",
    definition_en:
      "An open protocol that connects external tools and data sources (Postgres, GitHub, file systems…) to an agent, exposing them as tools the model can call.",
    links: [{ label: "modelcontextprotocol.io", url: "https://modelcontextprotocol.io" }],
  },
  {
    id: "frontmatter",
    term: "Frontmatter",
    term_en: "Frontmatter",
    category: "concept",
    aliases: [],
    definition:
      "El bloque de metadatos YAML al inicio de un archivo Markdown (entre líneas ---). En los artefactos lleva datos como descripción, modelo o herramientas permitidas.",
    definition_en:
      "The YAML metadata block at the top of a Markdown file (between --- lines). In artifacts it carries data like description, model or allowed tools.",
    links: [],
  },
  {
    id: "context-window",
    term: "Ventana de contexto",
    term_en: "Context window",
    category: "concept",
    aliases: ["context window"],
    definition:
      "El número máximo de tokens (prompt + generación) que el modelo atiende en una pasada. Está acotada porque la auto-atención escala O(n²) en cómputo y memoria con la longitud de secuencia, y la KV cache crece de forma lineal. Al llenarse hay que truncar, resumir o recuperar selectivamente (RAG).",
    definition_en:
      "The maximum number of tokens (prompt + generation) the model attends to in one pass. It's bounded because self-attention scales O(n²) in compute and memory with sequence length, and the KV cache grows linearly. When full you must truncate, summarize or retrieve selectively (RAG).",
    links: [],
  },
  {
    id: "tool-use",
    term: "Uso de herramientas",
    term_en: "Tool use",
    category: "concept",
    aliases: ["tool use", "function calling"],
    definition:
      "La capacidad de un modelo de pedir la ejecución de funciones externas (leer archivos, llamar APIs) y usar sus resultados para continuar la respuesta.",
    definition_en:
      "A model's ability to request the execution of external functions (read files, call APIs) and use their results to continue the response.",
    links: [],
  },
  {
    id: "rag",
    term: "RAG (Retrieval-Augmented Generation)",
    term_en: "RAG (Retrieval-Augmented Generation)",
    category: "concept",
    aliases: ["Retrieval-Augmented Generation"],
    definition:
      "Patrón que acopla un recuperador y un generador: la consulta se convierte en embedding, se buscan los fragmentos más similares en un índice vectorial (k-NN por similitud coseno) y se inyectan en el prompt como contexto. Reduce alucinaciones y aporta conocimiento actualizado sin reentrenar el modelo.",
    definition_en:
      "A pattern that couples a retriever and a generator: the query is turned into an embedding, the most similar chunks are looked up in a vector index (k-NN by cosine similarity) and injected into the prompt as context. It reduces hallucinations and brings up-to-date knowledge without retraining the model.",
    links: [],
  },
  {
    id: "token",
    term: "Token",
    term_en: "Token",
    category: "concept",
    aliases: ["subword"],
    definition:
      "La unidad de entrada del modelo: un subword producido por un tokenizador (típicamente BPE/SentencePiece), no una palabra ni un carácter. Regla práctica: ~4 caracteres o ~0,75 palabras por token en inglés. Cada token se mapea a un id entero y luego a un vector de embedding; el coste y los límites se miden en tokens.",
    definition_en:
      "The model's input unit: a subword produced by a tokenizer (typically BPE/SentencePiece), not a word or a character. Rule of thumb: ~4 characters or ~0.75 words per token in English. Each token maps to an integer id and then to an embedding vector; cost and limits are measured in tokens.",
    links: [],
  },
  {
    id: "embedding",
    term: "Embedding",
    term_en: "Embedding",
    category: "ml",
    aliases: ["vector"],
    definition:
      "Vector denso en R^d que representa un token, texto o ítem, aprendido de forma que la geometría del espacio codifica semántica (la cercanía por similitud coseno o producto escalar implica significado parecido). Sustenta la búsqueda semántica, RAG y la capa de entrada de los transformers.",
    definition_en:
      "A dense vector in R^d representing a token, text or item, learned so the geometry of the space encodes semantics (closeness by cosine similarity or dot product implies similar meaning). It underpins semantic search, RAG and the input layer of transformers.",
    links: [],
  },
  {
    id: "system-prompt",
    term: "System prompt",
    term_en: "System prompt",
    category: "concept",
    aliases: ["prompt de sistema"],
    definition:
      "Las instrucciones de máxima prioridad que fijan el comportamiento del modelo durante toda la conversación, por encima de los mensajes del usuario.",
    definition_en:
      "The highest-priority instructions that set the model's behavior throughout the whole conversation, above the user's messages.",
    links: [],
  },
  {
    id: "hallucination",
    term: "Alucinación",
    term_en: "Hallucination",
    category: "concept",
    aliases: ["hallucination"],
    definition:
      "Cuando un modelo genera información plausible pero falsa o inventada. Por eso conviene verificar datos críticos y citar fuentes.",
    definition_en:
      "When a model generates plausible but false or made-up information. That's why it's worth verifying critical facts and citing sources.",
    links: [],
  },
  {
    id: "fine-tuning",
    term: "Fine-tuning",
    term_en: "Fine-tuning",
    category: "ml",
    aliases: ["ajuste fino"],
    definition:
      "Continuar el entrenamiento de un modelo preentrenado sobre un dataset específico, actualizando sus pesos por descenso de gradiente para especializarlo en un dominio, formato o estilo. El full fine-tuning ajusta todos los parámetros; alternativas PEFT como LoRA ajustan solo un pequeño subconjunto. Más costoso que el prompting o RAG, pero internaliza el comportamiento.",
    definition_en:
      "Continuing the training of a pretrained model on a specific dataset, updating its weights by gradient descent to specialize it for a domain, format or style. Full fine-tuning adjusts all parameters; PEFT alternatives like LoRA adjust only a small subset. Costlier than prompting or RAG, but it internalizes the behavior.",
    links: [],
  },
  {
    id: "claude",
    term: "Claude",
    term_en: "Claude",
    category: "model",
    aliases: ["Anthropic"],
    definition:
      "Familia de modelos de IA de Anthropic, orientados a razonamiento, código y uso seguro. Disponible vía web, API y el CLI Claude Code.",
    definition_en:
      "Anthropic's family of AI models, geared toward reasoning, code and safe use. Available via web, API and the Claude Code CLI.",
    links: [
      { label: "claude.ai", url: "https://claude.ai" },
      { label: "Claude Code", url: "https://claude.com/claude-code" },
    ],
  },
  {
    id: "chatgpt",
    term: "ChatGPT",
    term_en: "ChatGPT",
    category: "model",
    aliases: ["OpenAI", "GPT"],
    definition:
      "Asistente conversacional de OpenAI basado en los modelos GPT, ampliamente usado para generación de texto y código.",
    definition_en:
      "OpenAI's conversational assistant based on the GPT models, widely used for text and code generation.",
    links: [{ label: "chatgpt.com", url: "https://chatgpt.com" }],
  },
  {
    id: "hermes",
    term: "Hermes (Nous Research)",
    term_en: "Hermes (Nous Research)",
    category: "model",
    aliases: ["Hermes 3", "Nous Hermes", "DeepHermes"],
    definition:
      "Familia de modelos open-weights de Nous Research: fine-tunes de Llama 3.1 (8B/70B/405B) orientados a agentes, con function calling fiable, salida estructurada (JSON), buen razonamiento y contexto largo, y una filosofía de alineación neutral «dirigida por el usuario» (el system prompt manda, con poco rechazo). La variante DeepHermes 3 añade un modo de razonamiento conmutable. Se ejecutan en local (p. ej. con Ollama) o vía proveedores de inferencia.",
    definition_en:
      "Nous Research's family of open-weights models: Llama 3.1 fine-tunes (8B/70B/405B) aimed at agents, with reliable function calling, structured output (JSON), strong reasoning and long context, and a neutral 'user-steered' alignment philosophy (the system prompt leads, with little refusal). The DeepHermes 3 variant adds a toggleable reasoning mode. They run locally (e.g. with Ollama) or via inference providers.",
    links: [
      { label: "nousresearch.com/hermes3", url: "https://nousresearch.com/hermes3" },
      { label: "Hugging Face", url: "https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B" },
    ],
  },
  {
    id: "gemini",
    term: "Gemini",
    term_en: "Gemini",
    category: "model",
    aliases: ["Google"],
    definition:
      "Familia de modelos multimodales de Google. Cuenta con app web, API y el Gemini CLI para usarlo desde la terminal.",
    definition_en:
      "Google's family of multimodal models. It has a web app, an API and the Gemini CLI for terminal use.",
    links: [
      { label: "gemini.google.com", url: "https://gemini.google.com" },
      { label: "Gemini CLI", url: "https://github.com/google-gemini/gemini-cli" },
    ],
  },
  {
    id: "cursor",
    term: "Cursor",
    term_en: "Cursor",
    category: "tool",
    aliases: [],
    definition:
      "Editor de código con IA integrada (basado en VS Code). Usa reglas en .cursor/rules para guiar al asistente dentro del proyecto.",
    definition_en:
      "A code editor with built-in AI (based on VS Code). It uses rules in .cursor/rules to steer the assistant inside the project.",
    links: [{ label: "cursor.com", url: "https://cursor.com" }],
  },
  {
    id: "opencode",
    term: "OpenCode",
    term_en: "OpenCode",
    category: "tool",
    aliases: [],
    definition:
      "CLI de agente de programación de código abierto. Organiza agentes, skills y comandos en la carpeta .opencode del repo.",
    definition_en:
      "An open-source coding-agent CLI. It organizes agents, skills and commands in the repo's .opencode folder.",
    links: [{ label: "opencode.ai", url: "https://opencode.ai" }],
  },
  {
    id: "ollama",
    term: "Ollama",
    term_en: "Ollama",
    category: "tool",
    aliases: [],
    definition:
      "Herramienta para ejecutar modelos de lenguaje localmente en tu máquina, con una API compatible con OpenAI. Útil para generar sin gastar tokens de la nube.",
    definition_en:
      "A tool to run language models locally on your machine, with an OpenAI-compatible API. Handy for generating without spending cloud tokens.",
    links: [{ label: "ollama.com", url: "https://ollama.com" }],
  },
  {
    id: "github-copilot",
    term: "GitHub Copilot",
    term_en: "GitHub Copilot",
    category: "tool",
    aliases: ["copilot"],
    definition:
      "Asistente de programación de GitHub que sugiere código en el editor y responde preguntas sobre el repositorio.",
    definition_en:
      "GitHub's coding assistant that suggests code in the editor and answers questions about the repository.",
    links: [{ label: "github.com/features/copilot", url: "https://github.com/features/copilot" }],
  },
  {
    id: "groq",
    term: "Groq",
    term_en: "Groq",
    category: "tool",
    aliases: [],
    definition:
      "Proveedor de inferencia de IA centrado en velocidad y bajo coste. En esta app genera las definiciones del glosario.",
    definition_en:
      "An AI inference provider focused on speed and low cost. In this app it generates the glossary definitions.",
    links: [{ label: "groq.com", url: "https://groq.com" }],
  },

  // ── Machine learning: architectures, training, statistics ──
  {
    id: "neural-network",
    term: "Red neuronal",
    term_en: "Neural network",
    category: "ml",
    aliases: ["neural network", "deep learning"],
    definition:
      "Función parametrizada compuesta por capas de transformaciones afines (y = Wx + b) intercaladas con no linealidades. Los pesos W se aprenden minimizando una función de pérdida por descenso de gradiente, con los gradientes calculados mediante retropropagación. «Deep» (profundo) alude a apilar muchas capas, lo que permite aprender representaciones jerárquicas.",
    definition_en:
      "A parameterized function made of layers of affine transforms (y = Wx + b) interleaved with nonlinearities. The weights W are learned by minimizing a loss function via gradient descent, with gradients computed by backpropagation. 'Deep' refers to stacking many layers, which lets it learn hierarchical representations.",
    links: [],
  },
  {
    id: "transformer",
    term: "Transformer",
    term_en: "Transformer",
    category: "ml",
    aliases: [],
    definition:
      "Arquitectura de red neuronal (Vaswani et al., 2017) basada en auto-atención en lugar de recurrencia o convoluciones, lo que permite procesar la secuencia en paralelo y modelar dependencias a larga distancia. Un bloque combina atención multi-cabeza, una red feed-forward, conexiones residuales y normalización por capas. Es la base de los LLM actuales.",
    definition_en:
      "A neural-network architecture (Vaswani et al., 2017) based on self-attention instead of recurrence or convolutions, which lets it process the sequence in parallel and model long-range dependencies. A block combines multi-head attention, a feed-forward network, residual connections and layer normalization. It's the basis of today's LLMs.",
    links: [{ label: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762" }],
  },
  {
    id: "encoder",
    term: "Encoder (codificador)",
    term_en: "Encoder",
    category: "ml",
    aliases: ["codificador"],
    definition:
      "La mitad del transformer que mapea una secuencia de entrada a representaciones contextuales usando auto-atención bidireccional (cada token atiende a todos). Adecuado para comprensión (clasificación, embeddings, NER); ejemplo: BERT. No genera texto de forma autoregresiva.",
    definition_en:
      "The half of the transformer that maps an input sequence to contextual representations using bidirectional self-attention (each token attends to all). Suited to understanding (classification, embeddings, NER); e.g. BERT. It doesn't generate text autoregressively.",
    links: [],
  },
  {
    id: "decoder",
    term: "Decoder (decodificador)",
    term_en: "Decoder",
    category: "ml",
    aliases: ["decodificador"],
    definition:
      "La parte generativa del transformer: predice el siguiente token de forma autoregresiva usando auto-atención con máscara causal (cada posición solo atiende a las anteriores). Los LLM tipo GPT/Claude son decoder-only. La generación token a token es lo que la KV cache acelera.",
    definition_en:
      "The generative part of the transformer: it predicts the next token autoregressively using self-attention with a causal mask (each position only attends to previous ones). GPT/Claude-style LLMs are decoder-only. Token-by-token generation is what the KV cache speeds up.",
    links: [],
  },
  {
    id: "encoder-decoder",
    term: "Encoder-decoder (seq2seq)",
    term_en: "Encoder-decoder (seq2seq)",
    category: "ml",
    aliases: ["seq2seq", "sequence to sequence"],
    definition:
      "Arquitectura en dos etapas: el encoder comprime la entrada en representaciones y el decoder las consume vía atención cruzada (cross-attention) para generar la salida. Pensada para tareas de transducción como traducción o resumen; ejemplos: el transformer original, T5, BART.",
    definition_en:
      "A two-stage architecture: the encoder compresses the input into representations and the decoder consumes them via cross-attention to generate the output. Designed for transduction tasks like translation or summarization; e.g. the original transformer, T5, BART.",
    links: [],
  },
  {
    id: "attention",
    term: "Atención (self-attention)",
    term_en: "Attention (self-attention)",
    category: "ml",
    aliases: ["self-attention", "auto-atención"],
    definition:
      "Mecanismo que, para cada token, calcula una mezcla ponderada de los valores (V) de todos los tokens, con pesos = softmax(QKᵀ/√d) a partir de consultas (Q) y claves (K). Permite que el modelo decida dinámicamente qué partes de la secuencia son relevantes para cada posición. Su coste es O(n²) en la longitud.",
    definition_en:
      "A mechanism that, for each token, computes a weighted mix of all tokens' values (V), with weights = softmax(QKᵀ/√d) from queries (Q) and keys (K). It lets the model dynamically decide which parts of the sequence are relevant for each position. Its cost is O(n²) in length.",
    links: [],
  },
  {
    id: "multi-head-attention",
    term: "Atención multi-cabeza",
    term_en: "Multi-head attention",
    category: "ml",
    aliases: ["multi-head attention"],
    definition:
      "Ejecutar varias atenciones en paralelo («cabezas»), cada una con sus propias proyecciones Q/K/V en subespacios distintos, y concatenar sus salidas. Cada cabeza puede especializarse en un tipo de relación (sintáctica, posicional, correferencia), aumentando la capacidad representacional sin elevar mucho el coste.",
    definition_en:
      "Running several attentions in parallel ('heads'), each with its own Q/K/V projections into distinct subspaces, then concatenating their outputs. Each head can specialize in a kind of relationship (syntactic, positional, coreference), increasing representational capacity without raising cost much.",
    links: [],
  },
  {
    id: "positional-encoding",
    term: "Codificación posicional",
    term_en: "Positional encoding",
    category: "ml",
    aliases: ["positional encoding", "RoPE"],
    definition:
      "Información de orden que se añade a los embeddings porque la atención es permutación-invariante (no «ve» la posición por sí sola). Puede ser fija (sinusoidal), aprendida o relativa/rotatoria (RoPE), siendo esta última clave para extrapolar a contextos largos.",
    definition_en:
      "Order information added to the embeddings because attention is permutation-invariant (it doesn't 'see' position by itself). It can be fixed (sinusoidal), learned or relative/rotary (RoPE), the latter being key to extrapolating to long contexts.",
    links: [],
  },
  {
    id: "layer-norm",
    term: "Normalización por capas (LayerNorm)",
    term_en: "Layer normalization (LayerNorm)",
    category: "ml",
    aliases: ["layer normalization", "RMSNorm"],
    definition:
      "Normaliza las activaciones de cada token (media 0, varianza 1) sobre la dimensión de features, con parámetros aprendidos de escala y sesgo. Estabiliza y acelera el entrenamiento. Variantes como RMSNorm y la colocación pre-norm son estándar en los LLM modernos.",
    definition_en:
      "Normalizes each token's activations (mean 0, variance 1) over the feature dimension, with learned scale and bias parameters. It stabilizes and speeds up training. Variants like RMSNorm and pre-norm placement are standard in modern LLMs.",
    links: [],
  },
  {
    id: "activation-function",
    term: "Función de activación",
    term_en: "Activation function",
    category: "ml",
    aliases: ["ReLU", "GELU", "SwiGLU"],
    definition:
      "No linealidad aplicada elemento a elemento que permite a la red aproximar funciones complejas (sin ella, apilar capas colapsa en una transformación lineal). ReLU = max(0, x) es la clásica; GELU y SwiGLU son habituales en transformers.",
    definition_en:
      "An element-wise nonlinearity that lets the network approximate complex functions (without it, stacking layers collapses into a single linear transform). ReLU = max(0, x) is the classic one; GELU and SwiGLU are common in transformers.",
    links: [],
  },
  {
    id: "softmax",
    term: "Softmax",
    term_en: "Softmax",
    category: "ml",
    aliases: [],
    definition:
      "Función que convierte un vector de logits en una distribución de probabilidad: softmax(z)_i = e^{z_i} / Σ_j e^{z_j}. Se usa en la capa de salida del modelo (para la distribución del siguiente token) y dentro de la atención. La temperatura escala los logits antes del softmax.",
    definition_en:
      "A function that turns a vector of logits into a probability distribution: softmax(z)_i = e^{z_i} / Σ_j e^{z_j}. Used in the model's output layer (for the next-token distribution) and inside attention. Temperature scales the logits before the softmax.",
    links: [],
  },
  {
    id: "logits",
    term: "Logits",
    term_en: "Logits",
    category: "ml",
    aliases: [],
    definition:
      "Las puntuaciones reales y sin normalizar que produce la última capa antes del softmax, una por cada token del vocabulario. Aplicar softmax (opcionalmente con temperatura, top-k o top-p) las convierte en la distribución de la que se muestrea el siguiente token.",
    definition_en:
      "The raw, unnormalized scores the last layer produces before the softmax, one per vocabulary token. Applying softmax (optionally with temperature, top-k or top-p) turns them into the distribution the next token is sampled from.",
    links: [],
  },
  {
    id: "backpropagation",
    term: "Retropropagación",
    term_en: "Backpropagation",
    category: "ml",
    aliases: ["backpropagation", "backprop"],
    definition:
      "Algoritmo para calcular el gradiente de la pérdida respecto a cada parámetro aplicando la regla de la cadena hacia atrás por el grafo de cómputo. Provee las derivadas que el optimizador usa para actualizar los pesos; es el motor del entrenamiento por gradiente.",
    definition_en:
      "An algorithm to compute the gradient of the loss with respect to each parameter by applying the chain rule backward through the compute graph. It provides the derivatives the optimizer uses to update the weights; it's the engine of gradient-based training.",
    links: [],
  },
  {
    id: "gradient-descent",
    term: "Descenso de gradiente (SGD, Adam)",
    term_en: "Gradient descent (SGD, Adam)",
    category: "ml",
    aliases: ["gradient descent", "SGD", "Adam", "optimizador"],
    definition:
      "Método de optimización que actualiza los parámetros en la dirección opuesta al gradiente de la pérdida: θ ← θ − η·∇L, con tasa de aprendizaje η. En la práctica se estima el gradiente por mini-batches (SGD estocástico) y se usan variantes con momento y tasas adaptativas como Adam/AdamW.",
    definition_en:
      "An optimization method that updates parameters in the direction opposite to the loss gradient: θ ← θ − η·∇L, with learning rate η. In practice the gradient is estimated over mini-batches (stochastic SGD) and variants with momentum and adaptive rates like Adam/AdamW are used.",
    links: [],
  },
  {
    id: "cross-entropy",
    term: "Entropía cruzada (función de pérdida)",
    term_en: "Cross-entropy (loss function)",
    category: "ml",
    aliases: ["cross-entropy", "log loss"],
    definition:
      "Pérdida estándar para clasificación y modelado de lenguaje: −Σ y·log(ŷ), que penaliza asignar baja probabilidad al token/clase correcto. Minimizarla equivale a la estimación por máxima verosimilitud. La perplejidad es su exponencial.",
    definition_en:
      "The standard loss for classification and language modeling: −Σ y·log(ŷ), which penalizes assigning low probability to the correct token/class. Minimizing it is equivalent to maximum-likelihood estimation. Perplexity is its exponential.",
    links: [],
  },
  {
    id: "maximum-likelihood",
    term: "Máxima verosimilitud (MLE)",
    term_en: "Maximum likelihood (MLE)",
    category: "ml",
    aliases: ["maximum likelihood", "MLE"],
    definition:
      "Principio estadístico que elige los parámetros que maximizan la probabilidad de los datos observados. Entrenar un modelo de lenguaje con entropía cruzada es MLE sobre la distribución del siguiente token. Se suele optimizar la log-verosimilitud negativa por estabilidad numérica.",
    definition_en:
      "A statistical principle that picks the parameters maximizing the probability of the observed data. Training a language model with cross-entropy is MLE over the next-token distribution. The negative log-likelihood is usually optimized for numerical stability.",
    links: [],
  },
  {
    id: "bias-variance",
    term: "Compromiso sesgo-varianza",
    term_en: "Bias-variance tradeoff",
    category: "ml",
    aliases: ["bias-variance tradeoff"],
    definition:
      "Descomposición del error de generalización en sesgo (error por suposiciones demasiado simples, infraajuste) y varianza (sensibilidad al ruido del dataset, sobreajuste). Reducir uno suele aumentar el otro; el objetivo es el punto que minimiza el error en datos no vistos.",
    definition_en:
      "A decomposition of generalization error into bias (error from overly simple assumptions, underfitting) and variance (sensitivity to dataset noise, overfitting). Reducing one tends to increase the other; the goal is the point that minimizes error on unseen data.",
    links: [],
  },
  {
    id: "overfitting",
    term: "Sobreajuste (overfitting)",
    term_en: "Overfitting",
    category: "ml",
    aliases: ["overfitting", "infraajuste", "underfitting"],
    definition:
      "Cuando el modelo memoriza el ruido del conjunto de entrenamiento y generaliza mal a datos nuevos (baja pérdida en train, alta en validación). Se mitiga con más datos, regularización, early stopping o reduciendo la capacidad. Lo contrario es el infraajuste.",
    definition_en:
      "When the model memorizes the training set's noise and generalizes poorly to new data (low train loss, high validation loss). Mitigated with more data, regularization, early stopping or reducing capacity. Its opposite is underfitting.",
    links: [],
  },
  {
    id: "regularization",
    term: "Regularización (L1/L2, dropout)",
    term_en: "Regularization (L1/L2, dropout)",
    category: "ml",
    aliases: ["regularization", "weight decay", "dropout"],
    definition:
      "Técnicas que restringen la complejidad efectiva del modelo para reducir el sobreajuste: penalizaciones L2 (weight decay) y L1 (que induce esparsidad) sobre los pesos, y dropout, que desactiva neuronas al azar en entrenamiento para evitar coadaptaciones.",
    definition_en:
      "Techniques that restrict the model's effective complexity to reduce overfitting: L2 (weight decay) and L1 (which induces sparsity) penalties on the weights, and dropout, which randomly disables neurons during training to prevent co-adaptation.",
    links: [],
  },
  {
    id: "cosine-similarity",
    term: "Similitud coseno",
    term_en: "Cosine similarity",
    category: "ml",
    aliases: ["cosine similarity"],
    definition:
      "Medida de parecido entre dos vectores = coseno del ángulo que forman = (a·b)/(‖a‖‖b‖), en [−1, 1]. Al ignorar la magnitud y mirar solo la dirección, es la métrica habitual para comparar embeddings en búsqueda semántica y RAG.",
    definition_en:
      "A similarity measure between two vectors = the cosine of the angle between them = (a·b)/(‖a‖‖b‖), in [−1, 1]. By ignoring magnitude and looking only at direction, it's the usual metric to compare embeddings in semantic search and RAG.",
    links: [],
  },
  {
    id: "tokenization-bpe",
    term: "Tokenización (BPE)",
    term_en: "Tokenization (BPE)",
    category: "ml",
    aliases: ["BPE", "byte pair encoding", "SentencePiece"],
    definition:
      "Proceso de partir el texto en tokens. Byte Pair Encoding fusiona iterativamente los pares de símbolos más frecuentes para construir un vocabulario de subwords, equilibrando tamaño de vocabulario y longitud de secuencia y manejando palabras desconocidas por composición.",
    definition_en:
      "The process of splitting text into tokens. Byte Pair Encoding iteratively merges the most frequent symbol pairs to build a subword vocabulary, balancing vocabulary size and sequence length and handling unknown words by composition.",
    links: [],
  },
  {
    id: "temperature-sampling",
    term: "Temperatura y muestreo (top-k, top-p)",
    term_en: "Temperature and sampling (top-k, top-p)",
    category: "ml",
    aliases: ["temperature", "top-p", "nucleus sampling", "top-k"],
    definition:
      "Controles de la aleatoriedad al generar. La temperatura escala los logits antes del softmax: <1 agudiza la distribución (más determinista), >1 la aplana. Top-k restringe el muestreo a los k tokens más probables; top-p (nucleus) al conjunto mínimo cuya probabilidad acumulada alcanza p.",
    definition_en:
      "Controls for randomness when generating. Temperature scales the logits before the softmax: <1 sharpens the distribution (more deterministic), >1 flattens it. Top-k restricts sampling to the k most probable tokens; top-p (nucleus) to the smallest set whose cumulative probability reaches p.",
    links: [],
  },
  {
    id: "perplexity",
    term: "Perplejidad",
    term_en: "Perplexity",
    category: "ml",
    aliases: ["perplexity"],
    definition:
      "Métrica de calidad de un modelo de lenguaje = exponencial de la entropía cruzada media por token. Intuitivamente, el número efectivo de opciones entre las que el modelo «duda» en cada paso; más baja es mejor. Útil para comparar modelos en un mismo conjunto.",
    definition_en:
      "A language-model quality metric = the exponential of the mean per-token cross-entropy. Intuitively, the effective number of options the model 'hesitates' among at each step; lower is better. Useful to compare models on the same set.",
    links: [],
  },
  {
    id: "kv-cache",
    term: "KV cache",
    term_en: "KV cache",
    category: "ml",
    aliases: ["key-value cache"],
    definition:
      "Optimización de inferencia que almacena las claves (K) y valores (V) ya calculados de los tokens previos, para no recomputarlos en cada paso autoregresivo. Acelera mucho la generación a costa de memoria, que crece de forma lineal con la longitud del contexto.",
    definition_en:
      "An inference optimization that stores the already-computed keys (K) and values (V) of previous tokens, so they aren't recomputed at each autoregressive step. It speeds up generation a lot at the cost of memory, which grows linearly with context length.",
    links: [],
  },
  {
    id: "lora",
    term: "LoRA / PEFT",
    term_en: "LoRA / PEFT",
    category: "ml",
    aliases: ["LoRA", "PEFT", "low-rank adaptation"],
    definition:
      "Familia de fine-tuning eficiente en parámetros (PEFT). LoRA congela el modelo base e inyecta matrices de bajo rango entrenables (ΔW = BA) en ciertas capas, reduciendo drásticamente los parámetros a entrenar y la memoria, con resultados cercanos al full fine-tuning.",
    definition_en:
      "A family of parameter-efficient fine-tuning (PEFT). LoRA freezes the base model and injects trainable low-rank matrices (ΔW = BA) into certain layers, drastically reducing the parameters to train and the memory, with results close to full fine-tuning.",
    links: [],
  },
  {
    id: "quantization",
    term: "Cuantización",
    term_en: "Quantization",
    category: "ml",
    aliases: ["quantization", "int8", "int4"],
    definition:
      "Reducir la precisión numérica de los pesos/activaciones (p. ej. de FP16 a int8 o int4) para recortar memoria y acelerar la inferencia, con una pérdida de calidad controlada. Permite ejecutar modelos grandes en hardware modesto; ejemplos: GPTQ, AWQ, GGUF.",
    definition_en:
      "Reducing the numerical precision of weights/activations (e.g. from FP16 to int8 or int4) to cut memory and speed up inference, with a controlled quality loss. It lets you run large models on modest hardware; e.g. GPTQ, AWQ, GGUF.",
    links: [],
  },
  {
    id: "distillation",
    term: "Destilación de conocimiento",
    term_en: "Knowledge distillation",
    category: "ml",
    aliases: ["knowledge distillation"],
    definition:
      "Entrenar un modelo pequeño («alumno») para imitar las salidas (logits o respuestas) de uno grande («maestro»), transfiriendo gran parte de su capacidad a un modelo más rápido y barato de servir. Base de muchas versiones «mini»/«flash».",
    definition_en:
      "Training a small model ('student') to imitate the outputs (logits or responses) of a large one ('teacher'), transferring much of its capability to a faster, cheaper-to-serve model. The basis of many 'mini'/'flash' versions.",
    links: [],
  },
  {
    id: "mixture-of-experts",
    term: "Mixture of Experts (MoE)",
    term_en: "Mixture of Experts (MoE)",
    category: "ml",
    aliases: ["MoE", "mezcla de expertos"],
    definition:
      "Arquitectura en la que una red de enrutado activa solo unos pocos sub-redes («expertos») por token, de modo que el número de parámetros totales es enorme pero el cómputo por token se mantiene acotado (activación esparsa). Permite escalar capacidad sin escalar proporcionalmente el coste de inferencia.",
    definition_en:
      "An architecture where a routing network activates only a few sub-networks ('experts') per token, so the total parameter count is huge but the compute per token stays bounded (sparse activation). It scales capacity without scaling inference cost proportionally.",
    links: [],
  },
  {
    id: "diffusion-model",
    term: "Modelo de difusión",
    term_en: "Diffusion model",
    category: "ml",
    aliases: ["diffusion", "difusión"],
    definition:
      "Modelo generativo que aprende a invertir un proceso de ruido: parte de ruido gaussiano y lo va «denoising» paso a paso hasta producir una muestra (imagen, audio). Domina la generación de imágenes (Stable Diffusion, DALL·E); distinto del paradigma autoregresivo de los LLM.",
    definition_en:
      "A generative model that learns to reverse a noising process: it starts from Gaussian noise and denoises it step by step until producing a sample (image, audio). It dominates image generation (Stable Diffusion, DALL·E); different from the autoregressive paradigm of LLMs.",
    links: [],
  },
  {
    id: "spring-bean",
    term: "Bean (Spring)",
    term_en: "Bean (Spring)",
    category: "jvm",
    aliases: ["bean", "IoC", "inyección de dependencias", "dependency injection"],
    definition:
      "Un objeto cuyo ciclo de vida (creación, configuración, destrucción) gestiona el contenedor de Spring en vez del propio código. Se declara con `@Component`/`@Service`/`@Repository`/`@Bean` y se inyecta donde haga falta (`@Autowired` o inyección por constructor), invirtiendo el control de quién crea las dependencias.",
    definition_en:
      "An object whose lifecycle (creation, configuration, destruction) is managed by the Spring container instead of your own code. Declared with `@Component`/`@Service`/`@Repository`/`@Bean` and injected wherever needed (`@Autowired` or constructor injection), inverting control over who creates dependencies.",
    links: [],
  },
  {
    id: "n-plus-one",
    term: "Problema N+1",
    term_en: "N+1 query problem",
    category: "jvm",
    aliases: ["n+1", "n plus one"],
    definition:
      "Antipatrón de acceso a datos donde cargar N registros dispara 1 query para la lista más N queries adicionales (una por registro) para cargar sus relaciones, típicamente por una asociación `LAZY` de JPA/Hibernate accedida dentro de un bucle. Se corrige con `JOIN FETCH`, `@EntityGraph` o batch fetching.",
    definition_en:
      "A data-access antipattern where loading N records fires 1 query for the list plus N additional queries (one per record) to load their relations — typically a JPA/Hibernate `LAZY` association accessed inside a loop. Fixed with `JOIN FETCH`, `@EntityGraph`, or batch fetching.",
    links: [],
  },
  {
    id: "aop-proxy",
    term: "Proxy AOP",
    term_en: "AOP proxy",
    category: "jvm",
    aliases: ["aop", "proxy", "programación orientada a aspectos"],
    definition:
      "El objeto envoltorio que Spring genera alrededor de un bean para aplicar comportamiento transversal (`@Transactional`, `@Cacheable`, `@Async`, seguridad) sin tocar su código. Explica por qué llamar a un método anotado *desde dentro de la misma clase* (self-invocation) se salta el aspecto: la llamada no pasa por el proxy.",
    definition_en:
      "The wrapper object Spring generates around a bean to apply cross-cutting behavior (`@Transactional`, `@Cacheable`, `@Async`, security) without touching its code. Explains why calling an annotated method *from within the same class* (self-invocation) skips the aspect: the call never goes through the proxy.",
    links: [],
  },
  {
    id: "virtual-threads",
    term: "Hilos virtuales (Project Loom)",
    term_en: "Virtual threads (Project Loom)",
    category: "jvm",
    aliases: ["virtual threads", "project loom", "hilos virtuales"],
    definition:
      "Hilos ligeros gestionados por la JVM (Java 21+) que se multiplexan sobre un pequeño número de hilos de plataforma (carrier threads), permitiendo millones de hilos concurrentes con el modelo de programación bloqueante tradicional. Con Spring Boot 3.2+, se activan con `spring.threads.virtual.enabled=true` para escalar I/O bloqueante (JDBC incluido) sin reescribir a reactivo.",
    definition_en:
      "Lightweight threads managed by the JVM (Java 21+) that are multiplexed over a small number of platform threads (carrier threads), enabling millions of concurrent threads while keeping the traditional blocking programming model. With Spring Boot 3.2+, enable via `spring.threads.virtual.enabled=true` to scale blocking I/O (including JDBC) without rewriting to reactive.",
    links: [],
  },
  {
    id: "transactional-propagation",
    term: "Propagación transaccional",
    term_en: "Transaction propagation",
    category: "jvm",
    aliases: ["propagation", "@transactional", "propagación"],
    definition:
      "La política que define cómo se comporta un método `@Transactional` cuando se llama dentro de una transacción ya activa: `REQUIRED` (por defecto, se une a la existente), `REQUIRES_NEW` (la suspende y abre una nueva e independiente), `NESTED` (savepoint dentro de la misma), etc. Elegir mal la propagación es una causa común de rollbacks parciales inesperados.",
    definition_en:
      "The policy defining how a `@Transactional` method behaves when called inside an already-active transaction: `REQUIRED` (default, joins the existing one), `REQUIRES_NEW` (suspends it and opens a new independent one), `NESTED` (savepoint within the same transaction), etc. Picking the wrong propagation is a common cause of unexpected partial rollbacks.",
    links: [],
  },
];

export function getGlossaryEntry(id) {
  return GLOSSARY_SEED.find((e) => e.id === id) || null;
}
