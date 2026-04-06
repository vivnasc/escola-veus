/**
 * Scene Image Prompts — Escola dos Véus
 *
 * Prompts for Flux (via fal.ai) to generate FLAT EDITORIAL ILLUSTRATIONS
 * in the style of School of Life / Kurzgesagt / editorial animation.
 *
 * Style: Simple flat illustration, limited palette, no photorealism,
 * faceless generic figures (no race, no age), clean lines, minimal detail,
 * warm muted tones on dark background.
 */

// The Escola dos Véus visual style — NOT a copy of School of Life
// Differences: dark atmosphere, abstract silhouette figures, gold/terracotta tones, contemplative
const STYLE =
  "flat minimalist editorial illustration, dark navy blue background (#1A1A2E), human figures as solid terracotta (#C4745A) silhouettes with subtle golden (#D4A853) outline glow — no face no features no skin texture just a warm-colored shape clearly visible against the dark background, warm gold and terracotta accent colors, clean simple shapes, limited muted palette, contemplative mood, no photorealism, no cartoon faces, no text, no words, no letters";

// ─── PROMPT BUILDER ─────────────────────────────────────────────────────────

/**
 * Builds the image prompt for a scene.
 *
 * Priority: uses the visualNote from the script (which describes exactly
 * what should appear in each scene). Falls back to generic scene-type
 * prompt if no visualNote.
 */
export function buildScenePrompt(
  courseSlug: string,
  sceneType: string,
  visualNote?: string,
): string {
  // The visualNote already describes the illustration — use it directly
  if (visualNote && visualNote.length > 20) {
    // Strip any technical notes (like hex codes) and add style
    const cleaned = visualNote
      .replace(/#[0-9A-Fa-f]{6}/g, "")
      .replace(/\(.*?\)/g, "")
      .trim();
    return `${cleaned}, ${STYLE}`;
  }

  // Fallback generic prompts by scene type
  const fallback = FALLBACK_PROMPTS[sceneType] || FALLBACK_PROMPTS["situacao"];
  return `${fallback}, ${STYLE}`;
}

const FALLBACK_PROMPTS: Record<string, string> = {
  abertura:
    "wide establishing shot, dark sky with a single warm light in the distance, minimal landscape",
  pergunta:
    "a single faceless figure standing alone, looking at something in the distance, contemplative pose",
  situacao:
    "everyday scene, a figure in a recognizable daily situation, simple environment with key objects",
  revelacao:
    "a figure having a realization, symbolic visual metaphor, something hidden becoming visible",
  gesto:
    "a figure with hand on chest, moment of awareness, small light or warmth where hand touches",
  frase_final:
    "dark background with warm glow at center, empty space, contemplative void",
  cta:
    "a figure walking calmly toward a warm light, simple path, invitation",
  fecho:
    "dark background fading to deeper dark, minimal, ending",
};

/**
 * Reference image URLs for Flux Kontext character consistency.
 * TODO: Upload reference illustrations to Supabase and add URLs here.
 */
export const REFERENCE_IMAGE_URLS: string[] = [];
