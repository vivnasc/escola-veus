/**
 * Biblioteca de moods de áudio contemplativo para a sub-produção VC Sabia.
 *
 * Cada mood mapeia para um prompt do ElevenLabs Sound Effects API.
 * Prompts escritos para máxima contemplatividade: espaço, distância,
 * reverb, ritmos lentos, elementos únicos isolados em silêncio.
 *
 * Duração default: 12s. Prompt influence 0.25 (= mais espaço criativo
 * ao modelo). Para prompts mais literais subir para 0.4-0.6.
 */

export type MorningMood =
  | "birds-dawn"
  | "birds-dusk"
  | "forest-stream"
  | "ocean-calm"
  | "soft-rain"
  | "gentle-wind"
  | "desert-wind"
  | "crickets-twilight"
  | "bamboo-water"
  | "garden-morning"
  | "fireplace"
  | "singing-bowl"
  | "koshi-chimes"
  | "felt-piano";

export const MOOD_LABELS: Record<MorningMood, string> = {
  "birds-dawn": "Pássaros ao amanhecer",
  "birds-dusk": "Pássaros ao crepúsculo",
  "forest-stream": "Nascente na floresta",
  "ocean-calm": "Mar calmo",
  "soft-rain": "Chuva suave",
  "gentle-wind": "Vento entre folhas",
  "desert-wind": "Vento no deserto",
  "crickets-twilight": "Grilos ao crepúsculo",
  "bamboo-water": "Bambu e água zen",
  "garden-morning": "Jardim ao amanhecer",
  "fireplace": "Lareira",
  "singing-bowl": "Taça tibetana",
  "koshi-chimes": "Koshi chimes",
  "felt-piano": "Piano feltrado",
};

export const MOOD_PROMPTS: Record<MorningMood, string> = {
  "birds-dawn":
    "Predawn hush, a single thrush singing slowly, distant forest still asleep, fog-muted, reverberant, sacred dawn light feeling, very spacious, unhurried, no human sound, no music",
  "birds-dusk":
    "Last hour of golden light, a few birds calling slowly across a wide meadow, distant church bell once in the distance, very spacious, contemplative end of day, no music",
  "forest-stream":
    "A small spring trickling gently through mossy stones, deep forest silence around it, occasional distant bird, fog-damped, contemplative, unhurried rhythm, intimate and grounding, no music",
  "ocean-calm":
    "Slow ocean breathing on a calm beach, very long intervals between waves, no seagulls, no wind, distant fog horn once, deeply contemplative, vast and patient, no music",
  "soft-rain":
    "Light rain on broad leaves in a quiet forest, no thunder, no wind, very gentle and steady, contemplative, almost a whisper, intimate and tender, no music",
  "gentle-wind":
    "Soft wind through tall grass and distant trees, very airy, occasional leaf rustle, vast open space feeling, contemplative and slow, no music",
  "desert-wind":
    "Wide empty desert wind, low and slow, distant sand moving across dunes, ancient and timeless feeling, very spacious, sacred emptiness, no human sound, no music",
  "crickets-twilight":
    "Crickets at deep twilight in an old garden, gentle and rhythmic, a very distant evening bird call once, warm summer night, contemplative, no music",
  "bamboo-water":
    "Japanese tea garden at dawn, single bamboo water spout dripping slowly into a stone basin, distant temple wind chime once, deeply contemplative, sacred simplicity, no music",
  "garden-morning":
    "Quiet walled garden at sunrise, dew dropping from leaves, gentle birds far away, light breeze through ivy, intimate and tender, contemplative, no music",
  "fireplace":
    "Low fire crackling softly in a quiet room, deep wood embers settling, occasional gentle pop, very slow and warm, deeply contemplative, intimate, no music",
  "singing-bowl":
    "A single deep Tibetan singing bowl struck slowly, very long resonant decay, monastic stone hall reverb, sacred and grounding, contemplative meditation, no instruments besides the bowl",
  "koshi-chimes":
    "Koshi chimes tuned to earth element, slow gentle movement, very spacious natural reverb, deep contemplative meditation, ethereal and grounding, no other music",
  "felt-piano":
    "Single sparse felt piano notes played very slowly with long silences between, gentle air noise of hammers, deeply contemplative, melancholic and tender, ambient piano",
};

export const MORNING_MOODS: MorningMood[] = Object.keys(MOOD_PROMPTS) as MorningMood[];

export const DEFAULT_DURATION_SEC = 12;
export const DEFAULT_PROMPT_INFLUENCE = 0.25;
