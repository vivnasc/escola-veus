/**
 * Moods de áudio para "Hoje, em Mim". Fecho do dia.
 *
 * Cada mood mapeia para um prompt ElevenLabs Sound Effects API.
 * Prompts pedem "no music" porque a frase é o foco. Áudio é só ambiente
 * noturno, autoral, com sabor a noite tropical africana e a santuário.
 *
 * Duração default: 12s, com loop e fade no encoder até 15s.
 */

export type NightMood =
  | "grilos-tropicais"
  | "brisa-bambu"
  | "chuva-fina-no-telhado"
  | "lareira-respira"
  | "lua-sobre-agua"
  | "coruja-distante"
  | "tigela-grave"
  | "mare-noturna"
  | "tambor-lento-distante"
  | "sussurro-coro-feminino";

export const NIGHT_MOOD_LABELS: Record<NightMood, string> = {
  "grilos-tropicais": "Grilos tropicais",
  "brisa-bambu": "Brisa entre bambus",
  "chuva-fina-no-telhado": "Chuva fina no telhado",
  "lareira-respira": "Lareira que respira",
  "lua-sobre-agua": "Lua sobre água",
  "coruja-distante": "Coruja distante",
  "tigela-grave": "Tigela tibetana grave",
  "mare-noturna": "Maré noturna",
  "tambor-lento-distante": "Tambor lento, distante",
  "sussurro-coro-feminino": "Sussurro de coro feminino",
};

export const NIGHT_MOOD_PROMPTS: Record<NightMood, string> = {
  "grilos-tropicais":
    "Gentle warm African night crickets, soft layered chirps, distant tree frogs, no cicadas, no wind, contemplative, no music",
  "brisa-bambu":
    "Soft night wind through bamboo grove, occasional gentle creak, distant crickets, peaceful, no music",
  "chuva-fina-no-telhado":
    "Very gentle rain on a tin or thatched roof at night, soft drops, no thunder, no wind, intimate, no music",
  "lareira-respira":
    "Low fire embers crackling slowly, occasional soft pop, warm intimate room ambience, very quiet, no music",
  "lua-sobre-agua":
    "Calm shallow water lapping against rocks at night, very gentle, distant crickets, peaceful pond, no music",
  "coruja-distante":
    "Distant owl hooting softly at night, faint wind in tall trees, peaceful forest at rest, no music",
  "tigela-grave":
    "Deep low Tibetan singing bowl resonance, very slow strikes, long sustained tail, evening meditation, no music",
  "mare-noturna":
    "Calm ocean waves on dark sand at night, soft rhythmic lapping, no wind, no seagulls, contemplative, no music",
  "tambor-lento-distante":
    "Very low slow African udu drum heartbeat, distant, around 50 bpm, dark warm space, no melody, no music layer",
  "sussurro-coro-feminino":
    "Soft female choir drone, breath sound only, no words, very low sustained note, ethereal, contemplative, no music melody",
};

export const NIGHT_MOODS: NightMood[] = Object.keys(NIGHT_MOOD_PROMPTS) as NightMood[];

export const DEFAULT_NIGHT_DURATION_SEC = 12;
export const DEFAULT_NIGHT_PROMPT_INFLUENCE = 0.4;
