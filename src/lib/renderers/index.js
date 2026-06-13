import { opencodeRenderer } from "@/lib/renderers/opencode";
import { claudeRenderer } from "@/lib/renderers/claude";
import { cursorRenderer } from "@/lib/renderers/cursor";
import { geminiRenderer } from "@/lib/renderers/gemini";

// Strategy registry by target CLI. Add more targets here without touching
// callers; getRenderer falls back to OpenCode for unknown targets.
const RENDERERS = {
  opencode: opencodeRenderer,
  claude: claudeRenderer,
  cursor: cursorRenderer,
  gemini: geminiRenderer,
};

/** Returns the renderer for a target, falling back to OpenCode. */
export function getRenderer(target) {
  return RENDERERS[target] || opencodeRenderer;
}
