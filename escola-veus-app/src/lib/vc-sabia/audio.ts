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
  agua:
    "Field recording of a small forest spring trickling gently over mossy stones, deep forest quiet around it, occasional very distant bird, natural reverb, no music, no melody, no instruments, pure nature ambience, slow contemplative atmosphere",
  vento:
    "Field recording of soft slow wind through tall grass and distant trees in a wide open meadow, very airy and unhurried, occasional leaf rustle, vast spaciousness, no music, no melody, no instruments, pure nature ambience, contemplative",
  lume:
    "Field recording of a small wood fire crackling softly in a quiet stone hearth, deep embers settling, occasional gentle pop, intimate and warm, no music, no melody, no instruments, pure ambience, contemplative",
  terra:
    "Field recording of a deep stone cave at dusk, very low wind drone moving through the space, occasional distant water drip echoing, vast natural reverb, ancient and grounding, no music, no melody, no instruments, pure ambience, contemplative",
};

export const MORNING_MOODS: MorningMood[] = Object.keys(MOOD_PROMPTS) as MorningMood[];

export const DEFAULT_DURATION_SEC = 15;
export const DEFAULT_PROMPT_INFLUENCE = 0.25;
