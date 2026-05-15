/**
 * 4 elementos contemplativos para o VC Sabia.
 *
 * Geracao via ElevenLabs Sound Effects API (3-22s, MP3). Prompts curtos
 * e directos — o modelo responde melhor a 1 frase iconica do que a
 * paragrafo literario.
 */

export type MorningMood = "agua" | "vento" | "lume" | "terra";

export const MOOD_LABELS: Record<MorningMood, string> = {
  agua: "Água",
  vento: "Vento",
  lume: "Lume",
  terra: "Terra",
};

export const MOOD_PROMPTS: Record<MorningMood, string> = {
  agua: "Gentle forest stream flowing over rocks, calm nature ambience",
  vento: "Soft wind through tall grass on a quiet hillside, peaceful",
  lume: "Crackling wood fireplace in a quiet room, warm and intimate",
  terra: "Deep cave ambience with subtle water drips and natural reverb",
};

export const MORNING_MOODS: MorningMood[] = Object.keys(MOOD_PROMPTS) as MorningMood[];

export const DEFAULT_DURATION_SEC = 12;
export const DEFAULT_PROMPT_INFLUENCE = 0.25;
