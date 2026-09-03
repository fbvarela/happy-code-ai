import { createOpenAI } from "@ai-sdk/openai";

/** Agnes 2.0 — OpenAI-compatible gateway (replaces Groq as the
 *  fast + cheap fallback generator). Docs: https://agnes-ai.com/doc/overview */
const AGNES_BASE_URL = "https://apihub.agnes-ai.com/v1";
export const AGNES_DEFAULT_MODEL = "agnes-2.0-flash";

export function isAgnesConfigured() {
  return !!process.env.AGNES_API_KEY;
}

/** Returns a callable model instance for Agnes, or null when not configured. */
export function getAgnesModel() {
  if (!process.env.AGNES_API_KEY) return null;
  const agnes = createOpenAI({
    apiKey: process.env.AGNES_API_KEY,
    baseURL: AGNES_BASE_URL,
  });
  return agnes(process.env.AGNES_MODEL || AGNES_DEFAULT_MODEL);
}
