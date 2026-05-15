/**
 * Sons de natureza para o VC Sabia (geracao via ElevenLabs SFX, 3-22s).
 *
 * Os 8 moods aqui sao especificos para o que faz sentido com motions
 * de flora/lotus/agua que a utilizadora tem: chuva, gotas, ribeiro,
 * pássaros, vento em folhas. SEM elementos abstractos (fogo, taca
 * tibetana, etc) que nao existem nos clips.
 *
 * Prompts curtos e directos — modelos de text-to-audio respondem mal
 * a poesia, bem a 1 frase iconica.
 */

export type MorningMood =
  | "chuva-suave"
  | "gotas-orvalho"
  | "ribeiro"
  | "nascente"
  | "passaros-amanhecer"
  | "vento-folhas"
  | "folhas-rustle"
  | "floresta-silencio";

export const MOOD_LABELS: Record<MorningMood, string> = {
  "chuva-suave": "Chuva suave",
  "gotas-orvalho": "Gotas de orvalho",
  ribeiro: "Ribeiro",
  nascente: "Nascente",
  "passaros-amanhecer": "Pássaros ao amanhecer",
  "vento-folhas": "Vento entre folhas",
  "folhas-rustle": "Folhas a oscilar",
  "floresta-silencio": "Silêncio de floresta",
};

export const MOOD_PROMPTS: Record<MorningMood, string> = {
  "chuva-suave": "Gentle soft rain falling on leaves in a calm forest",
  "gotas-orvalho":
    "Small water drops slowly falling on leaves, very gentle and rhythmic",
  ribeiro: "Gentle forest stream flowing softly over rocks",
  nascente: "Small water spring trickling slowly in a quiet nature setting",
  "passaros-amanhecer":
    "Gentle morning birds chirping softly at dawn in a peaceful forest",
  "vento-folhas":
    "Soft slow wind moving through the leaves of tall trees",
  "folhas-rustle": "Subtle rustling of leaves in a quiet breeze",
  "floresta-silencio":
    "Quiet forest ambience with very distant birds and gentle breeze",
};

export const MORNING_MOODS: MorningMood[] = Object.keys(MOOD_PROMPTS) as MorningMood[];

export const DEFAULT_DURATION_SEC = 12;
export const DEFAULT_PROMPT_INFLUENCE = 0.25;
