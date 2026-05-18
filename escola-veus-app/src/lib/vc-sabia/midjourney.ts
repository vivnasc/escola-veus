/**
 * Prompts Midjourney (v6 / v7 com `--video`) para motions da vc-sabia.
 *
 * O modo Runway foi descartado: imagens cinematograficas estaticas com
 * micro-movimento sao mais "contemplativas" que a animacao Runway.
 * Pipeline: o utilizador copia o prompt aqui gerado, cola no Midjourney,
 * exporta MP4 vertical 9:16 e carrega no Motion Library do vc-sabia.
 *
 * Tom: manha mocambicana / lusofona, luz suave, paleta dourada/creme, sem pessoas,
 * sem texto, sem mas, sem rostos. Imagem-poema parada com sopro.
 */

export const MJ_BASE_SUFFIX =
  "--ar 9:16 --style raw --stylize 200 --quality 1 --video";

const STYLE_BASE = [
  "contemplative morning lusophone poetry",
  "soft golden hour light",
  "cinematic film grain 35mm",
  "muted earth tones cream gold dust",
  "shallow depth of field",
  "no people no faces no text no logos",
  "slow micro-motion drifting particles or gentle breath",
];

type ThemeBlueprint = {
  subjects: string[];
  atmosphere: string;
};

const THEMES: Record<string, ThemeBlueprint> = {
  "autoamor": {
    subjects: [
      "a small ceramic bowl of warm milk",
      "hands cupping warm light through linen",
      "a folded soft blanket on wooden floor",
      "an open vintage book on a worn wooden desk with golden morning light catching the pages",
      "stack of old books on a windowsill bathed in warm dawn light, dust particles in the rays",
    ],
    atmosphere: "tender warmth, self-embrace, home as body",
  },
  "autoperdao": {
    subjects: [
      "rain washing a stone wall slowly",
      "fog clearing from a green valley",
      "a candle near a closed wooden door",
      "a single dandelion clock releasing seeds into warm morning light",
      "field of dandelions glowing translucent against rising sun, seeds drifting one by one",
    ],
    atmosphere: "release, soft cleansing, second chance after rain",
  },
  "florescer-no-tempo-certo": {
    subjects: [
      "a lotus opening at first light over still water",
      "wild flowers swaying in low golden grass",
      "a seedling pushing through cracked earth",
      "a sunflower wet with dew bending toward the rising sun, soft halo of light",
      "a meadow of wildflowers in muted yellow white and lilac at sunrise, dew clinging to petals",
    ],
    atmosphere: "patience rewarded, slow unfolding, trust in timing",
  },
  "presenca-leve": {
    subjects: [
      "morning dew on a single spider web",
      "steam rising from a clay cup at sunrise",
      "a feather floating slowly on still air",
      "a single hummingbird hovering at a wild orange flower at sunrise, frozen suspended motion",
      "a single beeswax candle burning on a wooden table at dawn, soft pink light from a window behind",
    ],
    atmosphere: "here-now suspension, breath made visible",
  },
  "suavidade-e-descanso": {
    subjects: [
      "linen curtains breathing in summer wind",
      "an unmade bed by an open window",
      "soft clouds slowly dissolving into pink sky",
      "a tabby cat curled on terracotta tiles in a soft morning sun beam, slow breathing",
      "rows of lavender swaying gently in a quiet field at dawn, soft purple haze and golden mist",
      "a clay teacup on a wooden windowsill with steam rising into morning sunlight, linen curtains softly in focus behind",
    ],
    atmosphere: "rest as virtue, gentle weight of body, slow exhale",
  },
  "sonhar-com-raizes": {
    subjects: [
      "ancient olive tree roots half-buried in red earth",
      "a wooden boat moored on a quiet river bank",
      "a small house lit from inside at blue hour",
      "ancient olive trees half-veiled in soft morning fog, red earth between roots",
      "a soft dirt path winding through pine forest with sun beams cutting through morning fog",
    ],
    atmosphere: "dream anchored in ground, future grown from past",
  },
  "inteireza": {
    subjects: [
      "a full moon reflected on calm sea",
      "a perfect round stone on wet sand",
      "concentric ripples on a still pond",
      "a fading pale moon over soft blue dawn sky above a sleeping valley",
      "crescent moon hanging low over a quiet lake at blue hour, single bird crossing the frame",
    ],
    atmosphere: "wholeness, return to center, circle closing softly",
  },
  "corpo-como-casa": {
    subjects: [
      "warm wooden interior with morning light through a window",
      "bare feet on terracotta tiles in summer",
      "hands kneading bread on a wooden table",
      "linen curtains breathing in summer wind through an open wooden window, soft golden light spilling onto a tile floor",
      "sheer curtains glowing against a pale blue morning sky behind an open shutter, dust motes drifting",
    ],
    atmosphere: "body as dwelling, slow rituals, sensory return",
  },
  "confianca-no-caminho": {
    subjects: [
      "a stone path winding through misty pine forest",
      "a single bird gliding over wide open valley",
      "a wooden bridge crossing a slow river",
      "tiny sparrows perched on a wire at first light, gentle silhouettes against soft pink sky",
      "silhouettes of swallows arcing across a pastel morning sky over red roofs, slow elegant gliding",
      "a slow river at sunrise reflecting pink and gold sky, gentle current carrying soft light streaks",
      "layers of misty mountain ridges fading into pink dawn light, no foreground details",
    ],
    atmosphere: "the way ahead unhurried, trust in the next step",
  },
  "gratidao": {
    subjects: [
      "a kitchen table set for one with figs and bread",
      "sunlight warming a worn wooden chair",
      "wild herbs in a glass jar by a window",
      "a wooden table at sunrise with a single ceramic plate, a fig cut in half, a slice of bread and a small glass of water",
      "a wheat field at golden hour with low sun grazing the tops, rolling slow waves of light",
    ],
    atmosphere: "grateful attention to small ordinary gifts",
  },
  "alegria-simples": {
    subjects: [
      "ripe yellow lemons in a blue ceramic bowl",
      "laundry drying in afternoon breeze",
      "a sunbeam crossing a wooden floor",
      "wild daisies and small grasses backlit by warm low sun, butterflies barely visible",
      "white cat stretching slowly on a windowsill against linen curtains and dawn light",
    ],
    atmosphere: "uncomplicated happiness, small bright pleasures",
  },
  "autoconhecimento": {
    subjects: [
      "still water reflecting a single tree",
      "an open window before sunrise",
      "a quiet path of stones through pale grass",
      "a single deer standing in golden morning mist at the edge of a forest, head turned softly",
      "still surface of a pond reflecting a single tree and pale morning sky, single leaf falling",
    ],
    atmosphere: "introspective stillness, deep listening, room for echo",
  },
  "beleza-de-existir": {
    subjects: [
      "first light over a misty mountain ridge",
      "a single wildflower in a cracked terracotta pot",
      "soft rain on stained glass at dawn",
      "backlit translucent young leaves at sunrise, veins glowing gold, soft cream sky behind",
      "a pastel pink and cream dawn sky with soft golden edged clouds, single bird passing",
      "a single warm paper lantern hanging from a low branch at dawn, soft glow against blue hour sky",
    ],
    atmosphere: "awe at simply being here, life as quiet miracle",
  },
};

/** Mood -> dica de movimento/ambiente. Casa com os audios mood do vc-sabia. */
const MOOD_HINTS: Record<string, string> = {
  birds_dawn: "distant birds, very subtle leaf movement",
  stream: "water surface gently rippling, slow current",
  wind: "soft wind through grass or curtains, slow drift",
  rain: "light rain on glass or stone, slow droplets",
  silence: "almost still, only dust particles drifting in light",
};

export type MjPromptOptions = {
  theme: string;
  /** Mood do audio (birds_dawn | stream | wind | rain | silence) */
  mood?: string | null;
  /** Indice 0/1/2 para variar a sugestao dentro do mesmo tema. */
  variant?: number;
  /** Texto da frase — usado apenas como nota interna, NUNCA aparece no MJ. */
  phrase?: string;
};

/**
 * Constroi um prompt Midjourney pronto para colar. Determinista por
 * (theme, mood, variant): copiar duas vezes o mesmo dia da o mesmo prompt.
 */
export function buildMjPrompt(opts: MjPromptOptions): string {
  const tpl = THEMES[opts.theme] ?? THEMES["beleza-de-existir"];
  const subject = tpl.subjects[(opts.variant ?? 0) % tpl.subjects.length];
  const moodHint = opts.mood ? MOOD_HINTS[opts.mood] : null;

  const parts = [
    subject,
    tpl.atmosphere,
    ...STYLE_BASE,
    moodHint || "subtle ambient motion",
  ];
  return `${parts.join(", ")} ${MJ_BASE_SUFFIX}`;
}

/** Lista das 3 variantes para um tema, para a UI poder oferecer escolha. */
export function mjPromptVariants(theme: string, mood?: string | null): string[] {
  const tpl = THEMES[theme] ?? THEMES["beleza-de-existir"];
  return tpl.subjects.map((_, i) => buildMjPrompt({ theme, mood, variant: i }));
}
