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

// The style suffix that makes Flux generate illustrations, not photos
const STYLE =
  "flat editorial illustration style, simple clean vector-like shapes, limited color palette, faceless generic human figure with no race and no visible skin color, warm muted tones, dark navy background, minimal detail, no photorealism, no text, no words, inspired by School of Life and Kurzgesagt animation style";

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
