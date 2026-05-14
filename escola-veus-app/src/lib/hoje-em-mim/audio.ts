/**
 * Moods de áudio para "Hoje, em Mim" — fecho do dia.
 *
 * Cada mood mapeia para um prompt ElevenLabs Sound Effects API.
 * Prompts pedem "no music" porque a frase é o foco — áudio é só ambiente noturno.
 *
 * Duração default: 12s (post faz loop com fade até 15s).
 */

export type NightMood =
  | "crickets-night"
  | "moonlit-water"
  | "soft-rain-night"
  | "wind-bamboo"
  | "fireplace-low"
  | "owl-distant"
  | "tibetan-bowl-low"
  | "ocean-night";

export const NIGHT_MOOD_LABELS: Record<NightMood, string> = {
  "crickets-night": "Grilos à noite",
  "moonlit-water": "Água ao luar",
  "soft-rain-night": "Chuva fina à noite",
  "wind-bamboo": "Vento entre bambus",
  "fireplace-low": "Lareira baixa",
  "owl-distant": "Coruja distante",
  "tibetan-bowl-low": "Taça tibetana grave",
  "ocean-night": "Maré nocturna",
};

export const NIGHT_MOOD_PROMPTS: Record<NightMood, string> = {
  "crickets-night":
    "Soft crickets and distant night insects, very gentle, peaceful summer evening, no music, no wind",
  "moonlit-water":
    "Soft water lapping against rocks at night, peaceful pond ambience, very quiet, contemplative, no music",
  "soft-rain-night":
    "Very gentle rain at night, soft drops on leaves, peaceful, no thunder, contemplative, no music",
  "wind-bamboo":
    "Soft wind moving through bamboo at night, gentle creaking, distant crickets, peaceful, no music",
  "fireplace-low":
    "Low fireplace crackling softly, gentle warmth, very quiet, intimate evening ambience, no music",
  "owl-distant":
    "Distant owl hooting softly at night, peaceful forest ambience, gentle wind in trees, no music",
  "tibetan-bowl-low":
    "Deep low Tibetan singing bowl resonance, slow, contemplative, evening meditation ambience, no music",
  "ocean-night":
    "Calm ocean waves at night, soft rhythmic lapping on sand, peaceful, no wind, contemplative, no music",
};

export const NIGHT_MOODS: NightMood[] = Object.keys(
  NIGHT_MOOD_PROMPTS
) as NightMood[];

export const DEFAULT_NIGHT_DURATION_SEC = 12;
export const DEFAULT_NIGHT_PROMPT_INFLUENCE = 0.4;
