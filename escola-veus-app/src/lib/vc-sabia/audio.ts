/**
 * Biblioteca de moods de áudio de manhã para a sub-produção VC Sabia Que…?.
 *
 * Cada mood mapeia para um prompt do ElevenLabs Sound Effects API.
 * Os prompts pedem explicitamente "no music" porque a frase é o foco —
 * o áudio é só ambiente.
 *
 * Duração default: 12s (o post final faz loop com fade até 15s).
 */

export type MorningMood =
  | "birds-dawn"
  | "forest-stream"
  | "soft-rain"
  | "gentle-wind"
  | "ocean-calm"
  | "garden-morning"
  | "singing-bowl"
  | "bamboo-water";

export const MOOD_LABELS: Record<MorningMood, string> = {
  "birds-dawn": "Pássaros ao amanhecer",
  "forest-stream": "Ribeiro na floresta",
  "soft-rain": "Chuva suave",
  "gentle-wind": "Vento entre folhas",
  "ocean-calm": "Ondas calmas",
  "garden-morning": "Jardim de manhã",
  "singing-bowl": "Taça tibetana",
  "bamboo-water": "Bambu e água",
};

export const MOOD_PROMPTS: Record<MorningMood, string> = {
  "birds-dawn":
    "Gentle morning bird songs at dawn, soft chirping, distant forest ambience, contemplative, peaceful, no wind, no music",
  "forest-stream":
    "Soft forest stream flowing over rocks, gentle water sounds, distant morning birdsong, peaceful, contemplative, no music",
  "soft-rain":
    "Soft gentle rain on leaves, peaceful, no thunder, no wind, contemplative morning, slow rhythm, no music",
  "gentle-wind":
    "Soft wind moving through leaves and branches, peaceful, distant birds, gentle, contemplative, no music",
  "ocean-calm":
    "Calm ocean waves on a peaceful beach, soft rhythmic lapping, no wind, no seagulls, contemplative, no music",
  "garden-morning":
    "Garden morning ambience, gentle birds chirping softly, light breeze, distant water fountain, peaceful, no music",
  "singing-bowl":
    "Distant Tibetan singing bowl resonance, soft, deep, peaceful, contemplative meditation ambience, no music",
  "bamboo-water":
    "Japanese garden, bamboo water fountain trickling softly, gentle morning birds, peaceful, contemplative, no music",
};

export const MORNING_MOODS: MorningMood[] = Object.keys(MOOD_PROMPTS) as MorningMood[];

export const DEFAULT_DURATION_SEC = 12;
export const DEFAULT_PROMPT_INFLUENCE = 0.4;
