/**
 * Prompts Midjourney V7 (imagens) + motion para Runway Gen4 Turbo, para a
 * motion library "Hoje, em Mim".
 *
 * Pipeline:
 *  1. Geras a IMAGEM no Midjourney com `prompt` (--ar 9:16, sem motion tag)
 *  2. Carregas a imagem no admin (hoje-em-mim → "Imagens MJ → Runway")
 *  3. App submete a Runway gen4_turbo image_to_video com `runwayMotion`
 *     (duração 10s, ratio 720:1280 vertical)
 *  4. Quando pronto, o MP4 fica em course-assets/hoje-em-mim-motions/ e
 *     aparece no library para usar como fundo
 *
 * O `runwayMotion` é SEMPRE específico para a cena (que se mexe, como, em
 * que direcção), nunca genérico. Câmara sempre estática (ou drift muito
 * subtil) para manter o tom contemplativo.
 *
 * Cada entrada inclui:
 *  - id: identificador estável
 *  - prompt: cola direto no Midjourney
 *  - runwayMotion: cola na Runway com a imagem MJ
 *  - audioMood: ElevenLabs SFX que combina
 *  - notas, prioritario (opcionais)
 */

import type { NightMood } from "@/lib/hoje-em-mim/audio";

export type MjVideoPrompt = {
  id: string;
  prompt: string;
  runwayMotion: string;
  audioMood: NightMood;
  /** Palavras-chave PT-PT que, se aparecerem na frase do dia,
   *  fazem o calendário escolher este prompt. Ordem importa: a
   *  primeira categoria que matcha (na ordem do array MJ_VIDEO_PROMPTS)
   *  ganha, por isso prompts específicos (jasmim, baobá, chuva) vêm
   *  antes de genéricos (vela aparece em vários, vela específico fica
   *  para o final). */
  keywords?: string[];
  notas?: string;
  prioritario?: boolean;
};

export const MJ_VIDEO_PROMPTS: MjVideoPrompt[] = [
  {
    id: "mj-01-vela-stucco",
    prioritario: true,
    prompt:
      "Single warm beeswax candle flame against a dark stucco wall, shadow play, intimate sanctuary mood, deep navy background --ar 9:16",
    runwayMotion:
      "static camera, single candle flame gently flickering and dancing in place, soft shadow flickering on the stucco wall, slow contemplative night atmosphere, no zoom, no pan, no rotation, no people, no sudden movements",
    audioMood: "lareira-respira",
    keywords: ["vela", "chama"],
  },
  {
    id: "mj-02-tropical-amber",
    prioritario: true,
    prompt:
      "Tropical broadleaf plants in night air, backlit by amber lantern, deep indigo surround, African verandah at night, cinematic depth --ar 9:16",
    runwayMotion:
      "static camera, large tropical broadleaves gently swaying left and right in soft night breeze, amber lantern light slightly pulsing, leaves move organically and slowly, no zoom, no pan, no rotation, no people",
    audioMood: "brisa-bambu",
    keywords: ["verandah", "lanterna", "tropical", "folha", "folhas"],
  },
  {
    id: "mj-03-brasas",
    prioritario: true,
    prompt:
      "Glowing embers in a low brazier, dark earthy background, contemplative atmosphere, dust particles in warm air --ar 9:16",
    runwayMotion:
      "static camera, glowing orange embers slowly pulsing and breathing in place, small sparks rising slowly upward, dust particles drifting gently in warm light, no zoom, no pan, no rotation, no people",
    audioMood: "lareira-respira",
    keywords: ["brasa", "brasas", "lume"],
  },
  {
    id: "mj-04-chuva-janela",
    prioritario: true,
    prompt:
      "Fine rain on a window pane at night, warm interior amber light glowing behind, blurred droplets, melancholic peace --ar 9:16",
    runwayMotion:
      "static camera, fine rain droplets sliding down the window glass at varying speeds, occasional new drops appearing and joining the trails, warm amber light pulsing softly behind the glass, slow contemplative pace, no zoom, no pan, no rotation, no people",
    audioMood: "chuva-fina-no-telhado",
    keywords: ["chuva", "janela", "pingo", "pingos"],
  },
  {
    id: "mj-05-incenso",
    prioritario: true,
    prompt:
      "White incense smoke rising in a dark room, single beam of warm light cutting through, very still composition --ar 9:16",
    runwayMotion:
      "static camera, white incense smoke rising slowly and curling upward in elegant tendrils, dust particles drifting in the warm light beam, very slow contemplative motion, no zoom, no pan, no rotation, no people",
    audioMood: "tigela-grave",
    keywords: ["incenso", "fumo", "respira", "respiração", "respirar", "respiro"],
  },
  {
    id: "mj-06-bambu-ocre",
    prompt:
      "Bamboo grove against an earthen ochre wall at night, low warm lantern light, soft long shadows --ar 9:16",
    runwayMotion:
      "static camera, slender bamboo leaves gently swaying left and right in soft night breeze, soft long shadows moving rhythmically on the ochre wall, slow gentle motion, no zoom, no pan, no rotation, no people",
    audioMood: "brisa-bambu",
    keywords: ["bambu", "sombra"],
  },
  {
    id: "mj-07-baobab-lua",
    prompt:
      "Full moon behind silver clouds, silhouette of a single baobab tree, African savannah at night, wide cinematic frame --ar 9:16",
    runwayMotion:
      "static camera, silver clouds slowly drifting horizontally across the full moon from left to right, full moon stays in place, baobab silhouette unmoving in foreground, very slow drift, no zoom, no rotation, no people",
    audioMood: "coruja-distante",
    keywords: ["baobá", "baobab", "savana"],
  },
  {
    id: "mj-08-cortina-linho",
    prompt:
      "White sheer linen curtain at a moonlit window, silvery blue light, soft fabric folds --ar 9:16",
    runwayMotion:
      "static camera, sheer white linen curtain gently billowing inward and outward in moonlit night breeze, fabric folds rippling slowly and organically, silvery light pulsing softly behind, no zoom, no pan, no rotation, no people",
    audioMood: "brisa-bambu",
    keywords: ["cortina", "linho", "vento", "brisa"],
  },
  {
    id: "mj-09-pirilampos",
    prompt:
      "Fireflies floating in a dark forest clearing, faint blue moon above, dreamy mood --ar 9:16",
    runwayMotion:
      "static camera, small fireflies gently floating and blinking on and off in the dark forest clearing, light points appearing and disappearing slowly at random positions, very slow ambient motion, no zoom, no pan, no rotation, no people",
    audioMood: "grilos-tropicais",
    keywords: ["pirilampo", "pirilampos", "vagalume", "floresta"],
  },
  {
    id: "mj-10-fonte-pedra",
    prompt:
      "Water trickling from a black stone fountain in a moonlit African garden, single low warm lantern nearby --ar 9:16",
    runwayMotion:
      "static camera, water gently trickling continuously down the black stone fountain, water droplets falling and pooling, lantern flame softly flickering nearby, slow continuous flow, no zoom, no pan, no rotation, no people",
    audioMood: "lua-sobre-agua",
    keywords: ["fonte", "pedra", "jardim"],
  },
  {
    id: "mj-11-via-lactea",
    prompt:
      "Milky Way over silhouetted acacia trees, deep cosmic blues and purples, time-lapse aesthetic --ar 9:16",
    runwayMotion:
      "static camera with very subtle parallax drift, milky way slowly drifting horizontally across the sky, stars twinkling softly throughout, acacia silhouettes unmoving on horizon, very slow celestial motion, no zoom, no rotation, no people",
    audioMood: "sussurro-coro-feminino",
    keywords: ["estrela", "estrelas", "via láctea", "cosmos", "céu", "cósmico"],
  },
  {
    id: "mj-12-cha-quente",
    prompt:
      "Hands wrapped around a warm clay cup of tea, soft amber kitchen light at night, intimate close framing --ar 9:16",
    runwayMotion:
      "static camera, steam rising slowly from the clay cup of tea curling upward, hands stay still gently wrapped around the cup, warm amber light gently pulsing, no zoom, no pan, no rotation, no face visible",
    audioMood: "lareira-respira",
    keywords: ["chá", "mão", "mãos"],
    notas: "Bom para sábado (corpo). Mãos como protagonistas, sem rosto.",
  },
  {
    id: "mj-13-rede-verandah",
    prompt:
      "Soft amber-lit hammock on a verandah, dark tropical garden beyond, warm dusk to night transition --ar 9:16",
    runwayMotion:
      "static camera, hammock gently swaying back and forth in slow rhythm, amber lantern light softly pulsing, dark tropical garden unmoving in background, slow contemplative pace, no zoom, no pan, no rotation, no people",
    audioMood: "grilos-tropicais",
    keywords: ["rede"],
  },
  {
    id: "mj-14-diario-cera",
    prompt:
      "Pages of an old leather journal open under candlelight, warm shadows, intimate writing nook --ar 9:16",
    runwayMotion:
      "static camera, single page of the open journal slowly turning upward and folding over, candle flame gently flickering in background warm shadows pulsing, slow contemplative pace, no zoom, no pan, no rotation, no hands visible",
    audioMood: "lareira-respira",
    keywords: ["diário", "página", "páginas", "livro", "escrevo", "escrever", "palavra", "palavras"],
    notas: "Bom para segunda (convite) e quinta (aprendi).",
  },
  {
    id: "mj-15-mar-noite",
    prompt:
      "Calm small waves on dark sand at night, distant moon reflection, contemplative composition --ar 9:16",
    runwayMotion:
      "static camera, small calm waves slowly rolling onto dark sand, moon reflection rippling gently on the wet sand and water surface, slow continuous wave motion, no zoom, no pan, no rotation, no people",
    audioMood: "mare-noturna",
    keywords: ["mar", "onda", "ondas", "costa"],
  },
  {
    id: "mj-16-tambor-shadow",
    prompt:
      "Single low African udu drum in soft amber light, faint shadow on dark wall, contemplative still composition --ar 9:16",
    runwayMotion:
      "static camera, soft amber light gently pulsing on the wooden drum surface, faint shadow moving subtly on the dark wall, very slow ambient motion, no zoom, no pan, no rotation, no hands visible",
    audioMood: "tambor-lento-distante",
    keywords: ["tambor"],
    notas: "Pode tentar 'djembe' se udu não devolver bem.",
  },
  {
    id: "mj-17-velas-mesa",
    prompt:
      "Three warm beeswax candles on a dark wood table, soft amber halo, deep navy room beyond, intimate altar feel --ar 9:16",
    runwayMotion:
      "static camera, three candle flames independently flickering and dancing in place on the dark wood table, soft amber halos gently pulsing around each, no zoom, no pan, no rotation, no people",
    audioMood: "lareira-respira",
    keywords: ["velas", "altar", "mesa", "ritual"],
  },
  {
    id: "mj-18-sombra-planta",
    prompt:
      "Soft shadow of a single house plant on a creamy plaster wall, warm lamp light, intimate room composition --ar 9:16",
    runwayMotion:
      "static camera, soft shadow of the house plant slowly swaying left and right on the creamy plaster wall, warm lamp light softly pulsing, very slow rhythmic shadow movement, no zoom, no pan, no rotation",
    audioMood: "brisa-bambu",
    keywords: ["planta", "parede", "sombras"],
    notas: "Bom para quarta (soltar). Movimento mínimo, quase abstrato.",
  },
  {
    id: "mj-19-vapor-cha",
    prompt:
      "Steam rising from a dark stoneware cup of tea on a wooden surface, soft warm side light, dark navy background --ar 9:16",
    runwayMotion:
      "static camera, white steam rising slowly from the dark stoneware cup curling upward in soft tendrils, steam dissipates and renews continuously, warm side light gently pulsing, no zoom, no pan, no rotation, no people",
    audioMood: "lareira-respira",
    keywords: ["vapor"],
  },
  {
    id: "mj-20-silhueta-janela",
    prompt:
      "Silhouette of a woman from behind looking out an arched window at the moon, deep indigo room, single soft lamp glow --ar 9:16",
    runwayMotion:
      "static camera, soft moonlight slowly shifting on the arched window frame, woman silhouette unmoving in contemplative pose, light pulsing gently, very subtle slow motion, no zoom, no pan, no rotation",
    audioMood: "sussurro-coro-feminino",
    keywords: ["intenção", "escolho", "escolher", "silhueta", "amanhã"],
    notas: "Bom para domingo (intenção).",
  },
  {
    id: "mj-21-estrelas-poca",
    prompt:
      "Stars reflected in a still puddle of water on dark earth, magical realism, contemplative composition --ar 9:16",
    runwayMotion:
      "static camera, gentle ripple expanding slowly across the still water puddle from a single point, stars reflection rippling and re-settling, surface returns to stillness then ripples again, very subtle slow motion, no zoom, no pan, no rotation, no people",
    audioMood: "lua-sobre-agua",
    keywords: ["poça", "reflexo"],
  },
  {
    id: "mj-22-coruja-ramo",
    prompt:
      "Owl silhouette perched on a bare branch under a misty moon, faint blue light, quiet still composition --ar 9:16",
    runwayMotion:
      "static camera, owl silhouette slowly turning its head once to the side and back, soft mist drifting horizontally behind, blue moon light softly pulsing, no zoom, no pan, no rotation, no people",
    audioMood: "coruja-distante",
    keywords: ["coruja", "ramo"],
  },
  {
    id: "mj-23-jasmim-vela",
    prompt:
      "White jasmine flowers in a clay bowl beside a single warm candle, dark earthy background, soft amber glow --ar 9:16",
    runwayMotion:
      "static camera, candle flame gently flickering beside the bowl of white jasmine flowers, soft amber glow pulsing on the white petals, very slight petal movement, slow contemplative motion, no zoom, no pan, no rotation, no people",
    audioMood: "lareira-respira",
    keywords: ["jasmim", "flor", "flores"],
    notas: "Bom para terça (gratidão) e sexta (celebrar).",
  },
  {
    id: "mj-24-pes-areia",
    prompt:
      "Bare feet on dark cool night sand at the water edge, moonlight reflection, sensorial intimate framing --ar 9:16",
    runwayMotion:
      "static camera, gentle ripple of water lapping at the bare feet on the dark night sand, moonlight reflection rippling on the wet sand, feet remain still, very slow contemplative motion, no zoom, no pan, no rotation, no face visible",
    audioMood: "mare-noturna",
    keywords: ["pé", "pés", "areia", "praia"],
    notas: "Bom para sábado (corpo).",
  },
  {
    id: "mj-25-aldeia-distante",
    prompt:
      "Distant African village at night with small warm yellow window lights, silhouettes of acacia trees, deep blue sky --ar 9:16",
    runwayMotion:
      "static camera, distant yellow window lights softly twinkling and pulsing on and off in the village, stars slowly twinkling above, acacia silhouettes unmoving on horizon, very slow ambient motion, no zoom, no pan, no rotation, no people",
    audioMood: "tambor-lento-distante",
    keywords: ["aldeia", "casa", "distante"],
  },
  {
    id: "mj-26-teia-orvalho",
    prompt:
      "Close-up of a spider web with dew drops glistening under moonlight, dark forest background, delicate composition --ar 9:16",
    runwayMotion:
      "static camera, dew drops gently glistening and slowly catching the moonlight on the spider web threads, very subtle web movement in soft breeze, no zoom, no pan, no rotation, no people",
    audioMood: "grilos-tropicais",
    keywords: ["orvalho", "teia", "gota", "gotas"],
  },
  {
    id: "mj-27-fogueira-silhuetas",
    prompt:
      "Small fire pit in the desert at night, silhouettes of people sitting around in distance, warm amber light, deep starry sky --ar 9:16",
    runwayMotion:
      "static camera, fire pit flames flickering and dancing in place, sparks rising slowly upward and fading, silhouettes of people sitting around remain still, stars softly twinkling above, slow ambient atmosphere, no zoom, no pan, no rotation",
    audioMood: "tambor-lento-distante",
    keywords: ["fogueira", "fogo", "deserto"],
  },
  {
    id: "mj-28-chocolate-vapor",
    prompt:
      "Hands cradling a mug of dark cacao in soft amber kitchen light at night, intimate close framing --ar 9:16",
    runwayMotion:
      "static camera, white steam rising slowly from the mug of dark cacao curling upward and dissipating, hands stay still cradling the mug, warm amber light gently pulsing, no zoom, no pan, no rotation, no face visible",
    audioMood: "lareira-respira",
    keywords: ["cacau", "chocolate"],
  },
  {
    id: "mj-29-caminho-lanternas",
    prompt:
      "Garden path lined with low warm lanterns at night, soft fog, no people, depth of field --ar 9:16",
    runwayMotion:
      "static camera with very subtle slow forward drift, lanterns lining the garden path softly pulsing one by one in random order, mist drifting horizontally low to the ground, slow contemplative pace, no zoom, no rotation, no people",
    audioMood: "grilos-tropicais",
    keywords: ["caminho", "lanternas", "neblina"],
  },
  {
    id: "mj-30-pena-cai",
    prompt:
      "Single white feather suspended in a beam of moonlight, deep dark background, dreamlike composition --ar 9:16",
    runwayMotion:
      "static camera, single white feather falling slowly downward through the beam of moonlight with gentle horizontal drift, soft glow on the feather, very slow contemplative pace, no zoom, no pan, no rotation, no people",
    audioMood: "sussurro-coro-feminino",
    keywords: ["pena", "peito", "soltar", "solto", "deixo"],
    notas: "Bom para quarta (soltar) e domingo (intenção).",
  },
];

export const MJ_PRIORITARIOS = MJ_VIDEO_PROMPTS.filter((p) => p.prioritario);
