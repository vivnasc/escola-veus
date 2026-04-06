/**
 * Scene Image Prompts — Escola dos Véus
 *
 * Prompts for Flux Kontext Pro (via fal.ai) to generate scene images.
 * Each scene type has a base prompt. Course-specific elements are injected.
 *
 * Style: Oil painting, faceless woman in long navy dress with translucent
 * golden veil, deep navy-blue background, painterly brushstrokes, cinematic.
 *
 * Reference images (for Flux Kontext character consistency):
 *   CURSOS/imagens/18-silhueta-coragem.png
 *   CURSOS/imagens/19-silhueta-juntas.png
 *   CURSOS/imagens/21-silhueta-adulta-crianca.png
 *   CURSOS/imagens/24-silhueta-soltar.png
 *   CURSOS/imagens/25-silhueta-abrir-porta.png
 */

const STYLE_SUFFIX =
  "oil painting style, deep navy blue background, painterly brushstrokes, cinematic lighting, contemplative mood, no text, no words, no letters";

const FIGURE_BASE =
  "faceless woman in long flowing navy dress with translucent golden veil";

// ─── SCENE TYPE PROMPTS ─────────────────────────────────────────────────────

/**
 * Base prompts by scene type. These work for any course.
 * The orchestrator injects course-specific details via visualNote.
 */
export const SCENE_TYPE_PROMPTS: Record<string, string> = {
  abertura:
    `wide establishing shot, vast atmospheric landscape, golden light in the distance, fog and golden dust particles, dreamlike, ${STYLE_SUFFIX}`,

  pergunta:
    `${FIGURE_BASE}, standing still seen from behind, soft golden glow behind her like a halo, alone in vast dark space, ${STYLE_SUFFIX}`,

  situacao:
    `${FIGURE_BASE}, in a shadowy interior, emotional tension, reaching toward something but hesitating, golden light seeping through, ${STYLE_SUFFIX}`,

  revelacao:
    `${FIGURE_BASE}, slowly straightening her posture, golden veil becoming more luminous, dramatic unveiling moment, golden light growing, ${STYLE_SUFFIX}`,

  gesto:
    `${FIGURE_BASE}, extending her open palm forward, golden particles floating gently around her hand, warm light emanating from her palm, gentle power, ${STYLE_SUFFIX}`,

  frase_final:
    `abstract deep navy blue background with very subtle golden glow at center, barely visible golden dust particles, dark atmospheric void, minimal, ${STYLE_SUFFIX}`,

  cta:
    `magnificent luminous interior transformed by golden light, warm and inviting, golden frames gleaming, golden dust dancing in light beams, hope, invitation, ${STYLE_SUFFIX}`,

  fecho:
    `golden light dissolving upward into deep navy blue sky, ascending particles, dreamlike dissolution, ethereal, ending, release, ${STYLE_SUFFIX}`,
};

// ─── COURSE-SPECIFIC TERRITORY PROMPTS ──────────────────────────────────────

/**
 * Each course has a unique "territory" — the visual world of the course.
 * These prompts are prepended to the scene type prompt for course-specific imagery.
 */
export const TERRITORY_PROMPTS: Record<string, string> = {
  "ouro-proprio":
    "room of ornate golden-framed mirrors, some covered with dark fabric, golden coins scattered, golden reflections",
  "sangue-e-seda":
    "ancient tree with deep red leaves and visible tangled roots, crimson and navy atmosphere",
  "a-arte-da-inteireza":
    "luminous bridge connecting two separated shores, violet and blue light, water below",
  "depois-do-fogo":
    "burned field with green shoots emerging, ember glow on horizon, renewal after destruction",
  "olhos-abertos":
    "misty crossroads with multiple paths, grey and silver atmosphere, distant light breaking through clouds",
  "pele-nua":
    "terracotta hills and body-like landscape at sunset, warm skin tones, intimate vastness",
  "limite-sagrado":
    "ancient stone wall with a single door of golden light, boundary between darkness and warmth",
  "flores-no-escuro":
    "underground cavern with bioluminescent flowers, blue and purple light, hidden garden",
  "o-peso-e-o-chao":
    "rocky path with golden stepping stones under moonlight, heavy stones alongside, weight and journey",
  "voz-de-dentro":
    "purple circular room with golden concentric rings on floor, echo chamber, resonance",
};

// ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────

/**
 * Build a complete prompt for a scene, combining territory + scene type + visual note.
 */
export function buildScenePrompt(
  courseSlug: string,
  sceneType: string,
  visualNote?: string,
): string {
  const territory = TERRITORY_PROMPTS[courseSlug] || "";
  const sceneBase = SCENE_TYPE_PROMPTS[sceneType] || SCENE_TYPE_PROMPTS["situacao"];

  const parts = [territory, sceneBase];
  if (visualNote) parts.push(visualNote);

  return parts.filter(Boolean).join(", ");
}

/**
 * Reference image URLs for Flux Kontext character consistency.
 * These should be publicly accessible URLs (Supabase or GitHub raw).
 * Update these after uploading the reference images.
 */
export const REFERENCE_IMAGE_URLS: string[] = [
  // TODO: Replace with actual public URLs after uploading to Supabase
  // "https://your-supabase.co/storage/v1/object/public/course-assets/reference/18-silhueta-coragem.png",
  // "https://your-supabase.co/storage/v1/object/public/course-assets/reference/24-silhueta-soltar.png",
  // "https://your-supabase.co/storage/v1/object/public/course-assets/reference/25-silhueta-abrir-porta.png",
];
