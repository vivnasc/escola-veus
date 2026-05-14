/**
 * 4 elementos contemplativos para o VC Sabia.
 *
 * Cada motion fica tagged com 1 elemento (manual ou via auto-tag Claude).
 * Cada elemento tem 1 audio activo, escolhido de varias geracoes.
 *
 * Tipo `MorningMood` mantem o nome legado mas agora so tem 4 valores.
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
    "Soft spring water trickling gently through mossy stones in a deep forest, fog-damped silence around it, occasional very distant bird, very slow rhythm, intimate and grounding, natural reverb, contemplative meditation, no music",
  vento:
    "Soft slow wind through tall grass and distant trees in a wide open space, very airy and unhurried, occasional leaf rustle, vast spaciousness, ancient and patient, contemplative, no music",
  lume:
    "Low wood fire crackling softly in a quiet room, deep embers settling, occasional gentle pop, very slow and warm, deeply intimate, contemplative golden hour feeling, no music",
  terra:
    "A single deep Tibetan singing bowl struck slowly, very long resonant decay, monastic stone hall natural reverb, sacred and grounding, deep contemplative meditation, no other instruments",
};

export const MORNING_MOODS: MorningMood[] = Object.keys(MOOD_PROMPTS) as MorningMood[];

export const DEFAULT_DURATION_SEC = 12;
export const DEFAULT_PROMPT_INFLUENCE = 0.25;
