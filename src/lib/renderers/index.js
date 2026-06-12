import { opencodeRenderer } from "@/lib/renderers/opencode";

// Strategy registry by target CLI. OpenCode is the MVP; add more here later
// (claude, cursor, …) without touching callers.
const RENDERERS = {
  opencode: opencodeRenderer,
};

/** Returns the renderer for a target, falling back to OpenCode. */
export function getRenderer(target) {
  return RENDERERS[target] || opencodeRenderer;
}
