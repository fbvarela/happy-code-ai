// Curated baseline for the AI Glossary. Pure data — safe to import from server
// AND client (no DB / SDK import). Definitions here are committed static text
// (pre-generated, 0 runtime tokens); user-added terms get Groq-generated
// definitions cached in the `glossary_entries` table. Keep entries concise.

export const GLOSSARY_CATEGORIES = [
  { id: "concept", label: "Conceptos" },
  { id: "ml", label: "Machine learning" },
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
      "El número máximo de tokens (prompt + generación) que el modelo atiende en una pasada. Está acotada porque la auto-atención escala O(n²) en cómputo y memoria con la longitud de secuencia, y la KV cache crece de forma lineal. Al llenarse hay que truncar, resumir o recuperar selectivamente (RAG).",
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
      "Patrón que acopla un recuperador y un generador: la consulta se convierte en embedding, se buscan los fragmentos más similares en un índice vectorial (k-NN por similitud coseno) y se inyectan en el prompt como contexto. Reduce alucinaciones y aporta conocimiento actualizado sin reentrenar el modelo.",
    links: [],
  },
  {
    id: "token",
    term: "Token",
    category: "concept",
    aliases: ["subword"],
    definition:
      "La unidad de entrada del modelo: un subword producido por un tokenizador (típicamente BPE/SentencePiece), no una palabra ni un carácter. Regla práctica: ~4 caracteres o ~0,75 palabras por token en inglés. Cada token se mapea a un id entero y luego a un vector de embedding; el coste y los límites se miden en tokens.",
    links: [],
  },
  {
    id: "embedding",
    term: "Embedding",
    category: "ml",
    aliases: ["vector"],
    definition:
      "Vector denso en R^d que representa un token, texto o ítem, aprendido de forma que la geometría del espacio codifica semántica (la cercanía por similitud coseno o producto escalar implica significado parecido). Sustenta la búsqueda semántica, RAG y la capa de entrada de los transformers.",
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
    category: "ml",
    aliases: ["ajuste fino"],
    definition:
      "Continuar el entrenamiento de un modelo preentrenado sobre un dataset específico, actualizando sus pesos por descenso de gradiente para especializarlo en un dominio, formato o estilo. El full fine-tuning ajusta todos los parámetros; alternativas PEFT como LoRA ajustan solo un pequeño subconjunto. Más costoso que el prompting o RAG, pero internaliza el comportamiento.",
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

  // ── Machine learning: architectures, training, statistics ──
  {
    id: "neural-network",
    term: "Red neuronal",
    category: "ml",
    aliases: ["neural network", "deep learning"],
    definition:
      "Función parametrizada compuesta por capas de transformaciones afines (y = Wx + b) intercaladas con no linealidades. Los pesos W se aprenden minimizando una función de pérdida por descenso de gradiente, con los gradientes calculados mediante retropropagación. «Deep» (profundo) alude a apilar muchas capas, lo que permite aprender representaciones jerárquicas.",
    links: [],
  },
  {
    id: "transformer",
    term: "Transformer",
    category: "ml",
    aliases: [],
    definition:
      "Arquitectura de red neuronal (Vaswani et al., 2017) basada en auto-atención en lugar de recurrencia o convoluciones, lo que permite procesar la secuencia en paralelo y modelar dependencias a larga distancia. Un bloque combina atención multi-cabeza, una red feed-forward, conexiones residuales y normalización por capas. Es la base de los LLM actuales.",
    links: [{ label: "Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762" }],
  },
  {
    id: "encoder",
    term: "Encoder (codificador)",
    category: "ml",
    aliases: ["codificador"],
    definition:
      "La mitad del transformer que mapea una secuencia de entrada a representaciones contextuales usando auto-atención bidireccional (cada token atiende a todos). Adecuado para comprensión (clasificación, embeddings, NER); ejemplo: BERT. No genera texto de forma autoregresiva.",
    links: [],
  },
  {
    id: "decoder",
    term: "Decoder (decodificador)",
    category: "ml",
    aliases: ["decodificador"],
    definition:
      "La parte generativa del transformer: predice el siguiente token de forma autoregresiva usando auto-atención con máscara causal (cada posición solo atiende a las anteriores). Los LLM tipo GPT/Claude son decoder-only. La generación token a token es lo que la KV cache acelera.",
    links: [],
  },
  {
    id: "encoder-decoder",
    term: "Encoder-decoder (seq2seq)",
    category: "ml",
    aliases: ["seq2seq", "sequence to sequence"],
    definition:
      "Arquitectura en dos etapas: el encoder comprime la entrada en representaciones y el decoder las consume vía atención cruzada (cross-attention) para generar la salida. Pensada para tareas de transducción como traducción o resumen; ejemplos: el transformer original, T5, BART.",
    links: [],
  },
  {
    id: "attention",
    term: "Atención (self-attention)",
    category: "ml",
    aliases: ["self-attention", "auto-atención"],
    definition:
      "Mecanismo que, para cada token, calcula una mezcla ponderada de los valores (V) de todos los tokens, con pesos = softmax(QKᵀ/√d) a partir de consultas (Q) y claves (K). Permite que el modelo decida dinámicamente qué partes de la secuencia son relevantes para cada posición. Su coste es O(n²) en la longitud.",
    links: [],
  },
  {
    id: "multi-head-attention",
    term: "Atención multi-cabeza",
    category: "ml",
    aliases: ["multi-head attention"],
    definition:
      "Ejecutar varias atenciones en paralelo («cabezas»), cada una con sus propias proyecciones Q/K/V en subespacios distintos, y concatenar sus salidas. Cada cabeza puede especializarse en un tipo de relación (sintáctica, posicional, correferencia), aumentando la capacidad representacional sin elevar mucho el coste.",
    links: [],
  },
  {
    id: "positional-encoding",
    term: "Codificación posicional",
    category: "ml",
    aliases: ["positional encoding", "RoPE"],
    definition:
      "Información de orden que se añade a los embeddings porque la atención es permutación-invariante (no «ve» la posición por sí sola). Puede ser fija (sinusoidal), aprendida o relativa/rotatoria (RoPE), siendo esta última clave para extrapolar a contextos largos.",
    links: [],
  },
  {
    id: "layer-norm",
    term: "Normalización por capas (LayerNorm)",
    category: "ml",
    aliases: ["layer normalization", "RMSNorm"],
    definition:
      "Normaliza las activaciones de cada token (media 0, varianza 1) sobre la dimensión de features, con parámetros aprendidos de escala y sesgo. Estabiliza y acelera el entrenamiento. Variantes como RMSNorm y la colocación pre-norm son estándar en los LLM modernos.",
    links: [],
  },
  {
    id: "activation-function",
    term: "Función de activación",
    category: "ml",
    aliases: ["ReLU", "GELU", "SwiGLU"],
    definition:
      "No linealidad aplicada elemento a elemento que permite a la red aproximar funciones complejas (sin ella, apilar capas colapsa en una transformación lineal). ReLU = max(0, x) es la clásica; GELU y SwiGLU son habituales en transformers.",
    links: [],
  },
  {
    id: "softmax",
    term: "Softmax",
    category: "ml",
    aliases: [],
    definition:
      "Función que convierte un vector de logits en una distribución de probabilidad: softmax(z)_i = e^{z_i} / Σ_j e^{z_j}. Se usa en la capa de salida del modelo (para la distribución del siguiente token) y dentro de la atención. La temperatura escala los logits antes del softmax.",
    links: [],
  },
  {
    id: "logits",
    term: "Logits",
    category: "ml",
    aliases: [],
    definition:
      "Las puntuaciones reales y sin normalizar que produce la última capa antes del softmax, una por cada token del vocabulario. Aplicar softmax (opcionalmente con temperatura, top-k o top-p) las convierte en la distribución de la que se muestrea el siguiente token.",
    links: [],
  },
  {
    id: "backpropagation",
    term: "Retropropagación",
    category: "ml",
    aliases: ["backpropagation", "backprop"],
    definition:
      "Algoritmo para calcular el gradiente de la pérdida respecto a cada parámetro aplicando la regla de la cadena hacia atrás por el grafo de cómputo. Provee las derivadas que el optimizador usa para actualizar los pesos; es el motor del entrenamiento por gradiente.",
    links: [],
  },
  {
    id: "gradient-descent",
    term: "Descenso de gradiente (SGD, Adam)",
    category: "ml",
    aliases: ["gradient descent", "SGD", "Adam", "optimizador"],
    definition:
      "Método de optimización que actualiza los parámetros en la dirección opuesta al gradiente de la pérdida: θ ← θ − η·∇L, con tasa de aprendizaje η. En la práctica se estima el gradiente por mini-batches (SGD estocástico) y se usan variantes con momento y tasas adaptativas como Adam/AdamW.",
    links: [],
  },
  {
    id: "cross-entropy",
    term: "Entropía cruzada (función de pérdida)",
    category: "ml",
    aliases: ["cross-entropy", "log loss"],
    definition:
      "Pérdida estándar para clasificación y modelado de lenguaje: −Σ y·log(ŷ), que penaliza asignar baja probabilidad al token/clase correcto. Minimizarla equivale a la estimación por máxima verosimilitud. La perplejidad es su exponencial.",
    links: [],
  },
  {
    id: "maximum-likelihood",
    term: "Máxima verosimilitud (MLE)",
    category: "ml",
    aliases: ["maximum likelihood", "MLE"],
    definition:
      "Principio estadístico que elige los parámetros que maximizan la probabilidad de los datos observados. Entrenar un modelo de lenguaje con entropía cruzada es MLE sobre la distribución del siguiente token. Se suele optimizar la log-verosimilitud negativa por estabilidad numérica.",
    links: [],
  },
  {
    id: "bias-variance",
    term: "Compromiso sesgo-varianza",
    category: "ml",
    aliases: ["bias-variance tradeoff"],
    definition:
      "Descomposición del error de generalización en sesgo (error por suposiciones demasiado simples, infraajuste) y varianza (sensibilidad al ruido del dataset, sobreajuste). Reducir uno suele aumentar el otro; el objetivo es el punto que minimiza el error en datos no vistos.",
    links: [],
  },
  {
    id: "overfitting",
    term: "Sobreajuste (overfitting)",
    category: "ml",
    aliases: ["overfitting", "infraajuste", "underfitting"],
    definition:
      "Cuando el modelo memoriza el ruido del conjunto de entrenamiento y generaliza mal a datos nuevos (baja pérdida en train, alta en validación). Se mitiga con más datos, regularización, early stopping o reduciendo la capacidad. Lo contrario es el infraajuste.",
    links: [],
  },
  {
    id: "regularization",
    term: "Regularización (L1/L2, dropout)",
    category: "ml",
    aliases: ["regularization", "weight decay", "dropout"],
    definition:
      "Técnicas que restringen la complejidad efectiva del modelo para reducir el sobreajuste: penalizaciones L2 (weight decay) y L1 (que induce esparsidad) sobre los pesos, y dropout, que desactiva neuronas al azar en entrenamiento para evitar coadaptaciones.",
    links: [],
  },
  {
    id: "cosine-similarity",
    term: "Similitud coseno",
    category: "ml",
    aliases: ["cosine similarity"],
    definition:
      "Medida de parecido entre dos vectores = coseno del ángulo que forman = (a·b)/(‖a‖‖b‖), en [−1, 1]. Al ignorar la magnitud y mirar solo la dirección, es la métrica habitual para comparar embeddings en búsqueda semántica y RAG.",
    links: [],
  },
  {
    id: "tokenization-bpe",
    term: "Tokenización (BPE)",
    category: "ml",
    aliases: ["BPE", "byte pair encoding", "SentencePiece"],
    definition:
      "Proceso de partir el texto en tokens. Byte Pair Encoding fusiona iterativamente los pares de símbolos más frecuentes para construir un vocabulario de subwords, equilibrando tamaño de vocabulario y longitud de secuencia y manejando palabras desconocidas por composición.",
    links: [],
  },
  {
    id: "temperature-sampling",
    term: "Temperatura y muestreo (top-k, top-p)",
    category: "ml",
    aliases: ["temperature", "top-p", "nucleus sampling", "top-k"],
    definition:
      "Controles de la aleatoriedad al generar. La temperatura escala los logits antes del softmax: <1 agudiza la distribución (más determinista), >1 la aplana. Top-k restringe el muestreo a los k tokens más probables; top-p (nucleus) al conjunto mínimo cuya probabilidad acumulada alcanza p.",
    links: [],
  },
  {
    id: "perplexity",
    term: "Perplejidad",
    category: "ml",
    aliases: ["perplexity"],
    definition:
      "Métrica de calidad de un modelo de lenguaje = exponencial de la entropía cruzada media por token. Intuitivamente, el número efectivo de opciones entre las que el modelo «duda» en cada paso; más baja es mejor. Útil para comparar modelos en un mismo conjunto.",
    links: [],
  },
  {
    id: "kv-cache",
    term: "KV cache",
    category: "ml",
    aliases: ["key-value cache"],
    definition:
      "Optimización de inferencia que almacena las claves (K) y valores (V) ya calculados de los tokens previos, para no recomputarlos en cada paso autoregresivo. Acelera mucho la generación a costa de memoria, que crece de forma lineal con la longitud del contexto.",
    links: [],
  },
  {
    id: "lora",
    term: "LoRA / PEFT",
    category: "ml",
    aliases: ["LoRA", "PEFT", "low-rank adaptation"],
    definition:
      "Familia de fine-tuning eficiente en parámetros (PEFT). LoRA congela el modelo base e inyecta matrices de bajo rango entrenables (ΔW = BA) en ciertas capas, reduciendo drásticamente los parámetros a entrenar y la memoria, con resultados cercanos al full fine-tuning.",
    links: [],
  },
  {
    id: "quantization",
    term: "Cuantización",
    category: "ml",
    aliases: ["quantization", "int8", "int4"],
    definition:
      "Reducir la precisión numérica de los pesos/activaciones (p. ej. de FP16 a int8 o int4) para recortar memoria y acelerar la inferencia, con una pérdida de calidad controlada. Permite ejecutar modelos grandes en hardware modesto; ejemplos: GPTQ, AWQ, GGUF.",
    links: [],
  },
  {
    id: "distillation",
    term: "Destilación de conocimiento",
    category: "ml",
    aliases: ["knowledge distillation"],
    definition:
      "Entrenar un modelo pequeño («alumno») para imitar las salidas (logits o respuestas) de uno grande («maestro»), transfiriendo gran parte de su capacidad a un modelo más rápido y barato de servir. Base de muchas versiones «mini»/«flash».",
    links: [],
  },
  {
    id: "mixture-of-experts",
    term: "Mixture of Experts (MoE)",
    category: "ml",
    aliases: ["MoE", "mezcla de expertos"],
    definition:
      "Arquitectura en la que una red de enrutado activa solo unos pocos sub-redes («expertos») por token, de modo que el número de parámetros totales es enorme pero el cómputo por token se mantiene acotado (activación esparsa). Permite escalar capacidad sin escalar proporcionalmente el coste de inferencia.",
    links: [],
  },
  {
    id: "diffusion-model",
    term: "Modelo de difusión",
    category: "ml",
    aliases: ["diffusion", "difusión"],
    definition:
      "Modelo generativo que aprende a invertir un proceso de ruido: parte de ruido gaussiano y lo va «denoising» paso a paso hasta producir una muestra (imagen, audio). Domina la generación de imágenes (Stable Diffusion, DALL·E); distinto del paradigma autoregresivo de los LLM.",
    links: [],
  },
];

export function getGlossaryEntry(id) {
  return GLOSSARY_SEED.find((e) => e.id === id) || null;
}
