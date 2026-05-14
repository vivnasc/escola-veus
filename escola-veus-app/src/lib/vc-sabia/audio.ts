/**
 * 4 elementos contemplativos para o VC Sabia.
 *
 * Geracao via FAL Stable Audio (modelo de ambient/atmospheric, max 47s).
 * Prompts em estilo "field recording / ambient texture" — instrucao
 * explicita "no music, no melody" porque Stable Audio e treinado em
 * musica e tende a meter melodia se nao se pedir o contrario.
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

export const DEFAULT_DURATION_SEC = 15;
export const DEFAULT_PROMPT_INFLUENCE = 0.25;
