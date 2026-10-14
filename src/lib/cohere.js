import { createCohere } from "@ai-sdk/cohere";

/** Cohere — official AI SDK provider, used as a free fallback generator.
 *  Trial API keys are free (≈1,000 calls/month, ~20/min chat) and work with
 *  all Command models; not for commercial production use.
 *  Get a key at https://dashboard.cohere.com/api-keys */
export const COHERE_DEFAULT_MODEL = "command-a-03-2025";

export function isCohereConfigured() {
  return !!process.env.COHERE_API_KEY;
}

/** Returns a callable model instance for Cohere, or null when not configured. */
export function getCohereModel() {
  if (!process.env.COHERE_API_KEY) return null;
  const cohere = createCohere({
    apiKey: process.env.COHERE_API_KEY,
  });
  return cohere(process.env.COHERE_MODEL || COHERE_DEFAULT_MODEL);
}
