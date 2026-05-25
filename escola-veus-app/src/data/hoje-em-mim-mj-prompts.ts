/**
 * Prompts Midjourney para "Hoje, em Mim".
 *
 * **180 prompts únicos** (1 por dia, 6 meses). Cada um escrito inteiro
 * como prompt standalone para colar directo no Midjourney. Nenhum
 * repete cena — todos inéditos.
 *
 * Organizados por batch mensal:
 *   hem-m01-*  Maio 2026 (30 originais, já gerados)
 *   hem-m02-*  Junho 2026 (30 novas cenas)
 *   hem-m03-*  Julho 2026 (30 novas cenas)
 *   hem-m04-*  Agosto 2026 (30 novas cenas)
 *   hem-m05-*  Setembro 2026 (30 novas cenas)
 *   hem-m06-*  Outubro 2026 (30 novas cenas)
 *
 * O calendário (src/lib/hoje-em-mim/calendar.ts) escolhe o prompt
 * por keyword na frase → mood do dia → fallback índice. Cada prompt
 * é usado no máximo 1× num semestre.
 */

import type { NightMood } from "@/lib/hoje-em-mim/audio";

export type MjVideoPrompt = {
  id: string;
  prompt: string;
  runwayMotion: string;
  audioMood: NightMood;
  keywords?: string[];
  notas?: string;
  prioritario?: boolean;
};

export function buildMjPrompt(cat: MjVideoPrompt, _variantIdx?: number): string {
  return cat.prompt;
}

// ---------------------------------------------------------------------------
// BATCH 1 — MAIO 2026 (30 originais, já gerados)
// ---------------------------------------------------------------------------

const MAIO: MjVideoPrompt[] = [
  {
    id: "hem-m01-01",
    prioritario: true,
    prompt: "Single warm beeswax candle flame against a dark stucco wall, shadow play, intimate sanctuary mood, deep navy background --ar 9:16",
    runwayMotion: "static camera, single candle flame gently flickering and dancing in place, soft shadow flickering on the stucco wall, slow contemplative night atmosphere, no zoom, no pan, no rotation, no people, no sudden movements",
    audioMood: "lareira-respira",
    keywords: ["vela", "chama"],
  },
  {
    id: "hem-m01-02",
    prioritario: true,
    prompt: "Tropical broadleaf plants in night air, backlit by amber lantern, deep indigo surround, African verandah at night, cinematic depth --ar 9:16",
    runwayMotion: "static camera, large tropical broadleaves gently swaying left and right in soft night breeze, amber lantern light slightly pulsing, leaves move organically and slowly, no zoom, no pan, no rotation, no people",
    audioMood: "brisa-bambu",
    keywords: ["verandah", "lanterna", "tropical", "folha", "folhas", "noite"],
  },
  {
    id: "hem-m01-03",
    prioritario: true,
    prompt: "Glowing embers in a low brazier, dark earthy background, contemplative atmosphere, dust particles in warm air --ar 9:16",
    runwayMotion: "static camera, glowing orange embers slowly pulsing and breathing in place, small sparks rising slowly upward, dust particles drifting gently in warm light, no zoom, no pan, no rotation, no people",
    audioMood: "lareira-respira",
    keywords: ["brasa", "brasas", "lume"],
  },
  {
    id: "hem-m01-04",
    prioritario: true,
    prompt: "Fine rain on a window pane at night, warm interior amber light glowing behind, blurred droplets, melancholic peace --ar 9:16",
    runwayMotion: "static camera, fine rain droplets sliding down the window glass at varying speeds, occasional new drops appearing and joining the trails, warm amber light pulsing softly behind the glass, slow contemplative pace, no zoom, no pan, no rotation, no people",
    audioMood: "chuva-fina-no-telhado",
    keywords: ["chuva", "janela", "pingo", "pingos"],
  },
  {
    id: "hem-m01-05",
    prioritario: true,
    prompt: "White incense smoke rising in a dark room, single beam of warm light cutting through, very still composition --ar 9:16",
    runwayMotion: "static camera, white incense smoke rising slowly and curling upward in elegant tendrils, dust particles drifting in the warm light beam, very slow contemplative motion, no zoom, no pan, no rotation, no people",
    audioMood: "tigela-grave",
    keywords: ["incenso", "fumo", "respira", "respiração", "respirar", "respiro"],
  },
  {
    id: "hem-m01-06",
    prompt: "Bamboo grove against an earthen ochre wall at night, low warm lantern light, soft long shadows --ar 9:16",
    runwayMotion: "static camera, slender bamboo leaves gently swaying left and right in soft night breeze, soft long shadows moving rhythmically on the ochre wall, slow gentle motion, no zoom, no pan, no rotation, no people",
    audioMood: "brisa-bambu",
    keywords: ["bambu", "sombra", "ombro", "ombros"],
  },
  {
    id: "hem-m01-07",
    prompt: "Full moon behind silver clouds, silhouette of a single baobab tree, African savannah at night, wide cinematic frame --ar 9:16",
    runwayMotion: "static camera, silver clouds slowly drifting horizontally across the full moon from left to right, full moon stays in place, baobab silhouette unmoving in foreground, very slow drift, no zoom, no rotation, no people",
    audioMood: "coruja-distante",
    keywords: ["baobá", "baobab", "savana"],
  },
  {
    id: "hem-m01-08",
    prompt: "White sheer linen curtain at a moonlit window, silvery blue light, soft fabric folds --ar 9:16",
    runwayMotion: "static camera, sheer white linen curtain gently billowing inward and outward in moonlit night breeze, fabric folds rippling slowly and organically, silvery light pulsing softly behind, no zoom, no pan, no rotation, no people",
    audioMood: "brisa-bambu",
    keywords: ["cortina", "linho", "vento", "brisa"],
  },
  {
    id: "hem-m01-09",
    prompt: "Fireflies floating in a dark forest clearing, faint blue moon above, dreamy mood --ar 9:16",
    runwayMotion: "static camera, small fireflies gently floating and blinking on and off in the dark forest clearing, light points appearing and disappearing slowly at random positions, very slow ambient motion, no zoom, no pan, no rotation, no people",
    audioMood: "grilos-tropicais",
    keywords: ["pirilampo", "pirilampos", "vagalume", "floresta"],
  },
  {
    id: "hem-m01-10",
    prompt: "Water trickling from a black stone fountain in a moonlit African garden, single low warm lantern nearby --ar 9:16",
    runwayMotion: "static camera, water gently trickling continuously down the black stone fountain, water droplets falling and pooling, lantern flame softly flickering nearby, slow continuous flow, no zoom, no pan, no rotation, no people",
    audioMood: "lua-sobre-agua",
    keywords: ["fonte", "pedra", "jardim"],
  },
  {
    id: "hem-m01-11",
    prompt: "Milky Way over silhouetted acacia trees, deep cosmic blues and purples, time-lapse aesthetic --ar 9:16",
    runwayMotion: "static camera with very subtle parallax drift, milky way slowly drifting horizontally across the sky, stars twinkling softly throughout, acacia silhouettes unmoving on horizon, very slow celestial motion, no zoom, no rotation, no people",
    audioMood: "sussurro-coro-feminino",
    keywords: ["estrela", "estrelas", "via láctea", "cosmos", "céu", "cósmico", "silêncio"],
  },
  {
    id: "hem-m01-12",
    prompt: "Hands wrapped around a warm clay cup of tea, soft amber kitchen light at night, intimate close framing --ar 9:16",
    runwayMotion: "static camera, steam rising slowly from the clay cup of tea curling upward, hands stay still gently wrapped around the cup, warm amber light gently pulsing, no zoom, no pan, no rotation, no face visible",
    audioMood: "lareira-respira",
    keywords: ["chá", "mão", "mãos"],
  },
  {
    id: "hem-m01-13",
    prompt: "Soft amber-lit hammock on a verandah, dark tropical garden beyond, warm dusk to night transition --ar 9:16",
    runwayMotion: "static camera, hammock gently swaying back and forth in slow rhythm, amber lantern light softly pulsing, dark tropical garden unmoving in background, slow contemplative pace, no zoom, no pan, no rotation, no people",
    audioMood: "grilos-tropicais",
    keywords: ["rede"],
  },
  {
    id: "hem-m01-14",
    prompt: "Pages of an old leather journal open under candlelight, warm shadows, intimate writing nook --ar 9:16",
    runwayMotion: "static camera, single page of the open journal slowly turning upward and folding over, candle flame gently flickering in background warm shadows pulsing, slow contemplative pace, no zoom, no pan, no rotation, no hands visible",
    audioMood: "lareira-respira",
    keywords: ["diário", "página", "páginas", "livro", "escrevo", "escrever", "palavra", "palavras"],
  },
  {
    id: "hem-m01-15",
    prompt: "Calm small waves on dark sand at night, distant moon reflection, contemplative composition --ar 9:16",
    runwayMotion: "static camera, small calm waves slowly rolling onto dark sand, moon reflection rippling gently on the wet sand and water surface, slow continuous wave motion, no zoom, no pan, no rotation, no people",
    audioMood: "mare-noturna",
    keywords: ["mar", "onda", "ondas", "costa", "tempo", "ciclo", "passagem"],
  },
  {
    id: "hem-m01-16",
    prompt: "Single low African udu drum in soft amber light, faint shadow on dark wall, contemplative still composition --ar 9:16",
    runwayMotion: "static camera, soft amber light gently pulsing on the wooden drum surface, faint shadow moving subtly on the dark wall, very slow ambient motion, no zoom, no pan, no rotation, no hands visible",
    audioMood: "tambor-lento-distante",
    keywords: ["tambor"],
  },
  {
    id: "hem-m01-17",
    prompt: "Three warm beeswax candles on a dark wood table, soft amber halo, deep navy room beyond, intimate altar feel --ar 9:16",
    runwayMotion: "static camera, three candle flames independently flickering and dancing in place on the dark wood table, soft amber halos gently pulsing around each, no zoom, no pan, no rotation, no people",
    audioMood: "lareira-respira",
    keywords: ["velas", "altar", "mesa", "ritual"],
  },
  {
    id: "hem-m01-18",
    prompt: "Soft shadow of a single house plant on a creamy plaster wall, warm lamp light, intimate room composition --ar 9:16",
    runwayMotion: "static camera, soft shadow of the house plant slowly swaying left and right on the creamy plaster wall, warm lamp light softly pulsing, very slow rhythmic shadow movement, no zoom, no pan, no rotation",
    audioMood: "brisa-bambu",
    keywords: ["planta", "parede", "sombras", "olhos"],
  },
  {
    id: "hem-m01-19",
    prompt: "Steam rising from a dark stoneware cup of tea on a wooden surface, soft warm side light, dark navy background --ar 9:16",
    runwayMotion: "static camera, white steam rising slowly from the dark stoneware cup curling upward in soft tendrils, steam dissipates and renews continuously, warm side light gently pulsing, no zoom, no pan, no rotation, no people",
    audioMood: "lareira-respira",
    keywords: ["vapor"],
  },
  {
    id: "hem-m01-20",
    prompt: "Silhouette of a woman from behind looking out an arched window at the moon, deep indigo room, single soft lamp glow --ar 9:16",
    runwayMotion: "static camera, soft moonlight slowly shifting on the arched window frame, woman silhouette unmoving in contemplative pose, light pulsing gently, very subtle slow motion, no zoom, no pan, no rotation",
    audioMood: "sussurro-coro-feminino",
    keywords: ["intenção", "escolho", "escolher", "silhueta", "amanhã"],
  },
  {
    id: "hem-m01-21",
    prompt: "Stars reflected in a still puddle of water on dark earth, magical realism, contemplative composition --ar 9:16",
    runwayMotion: "static camera, gentle ripple expanding slowly across the still water puddle from a single point, stars reflection rippling and re-settling, surface returns to stillness then ripples again, very subtle slow motion, no zoom, no pan, no rotation, no people",
    audioMood: "lua-sobre-agua",
    keywords: ["poça", "reflexo"],
  },
  {
    id: "hem-m01-22",
    prompt: "Owl silhouette perched on a bare branch under a misty moon, faint blue light, quiet still composition --ar 9:16",
    runwayMotion: "static camera, owl silhouette slowly turning its head once to the side and back, soft mist drifting horizontally behind, blue moon light softly pulsing, no zoom, no pan, no rotation, no people",
    audioMood: "coruja-distante",
    keywords: ["coruja", "ramo"],
  },
  {
    id: "hem-m01-23",
    prompt: "White jasmine flowers in a clay bowl beside a single warm candle, dark earthy background, soft amber glow --ar 9:16",
    runwayMotion: "static camera, candle flame gently flickering beside the bowl of white jasmine flowers, soft amber glow pulsing on the white petals, very slight petal movement, slow contemplative motion, no zoom, no pan, no rotation, no people",
    audioMood: "lareira-respira",
    keywords: ["jasmim", "flor", "flores"],
  },
  {
    id: "hem-m01-24",
    prompt: "Bare feet on dark cool night sand at the water edge, moonlight reflection, sensorial intimate framing --ar 9:16",
    runwayMotion: "static camera, gentle ripple of water lapping at the bare feet on the dark night sand, moonlight reflection rippling on the wet sand, feet remain still, very slow contemplative motion, no zoom, no pan, no rotation, no face visible",
    audioMood: "mare-noturna",
    keywords: ["pé", "pés", "areia", "praia"],
  },
  {
    id: "hem-m01-25",
    prompt: "Distant African village at night with small warm yellow window lights, silhouettes of acacia trees, deep blue sky --ar 9:16",
    runwayMotion: "static camera, distant yellow window lights softly twinkling and pulsing on and off in the village, stars slowly twinkling above, acacia silhouettes unmoving on horizon, very slow ambient motion, no zoom, no pan, no rotation, no people",
    audioMood: "tambor-lento-distante",
    keywords: ["aldeia", "casa", "distante"],
  },
  {
    id: "hem-m01-26",
    prompt: "Close-up of a spider web with dew drops glistening under moonlight, dark forest background, delicate composition --ar 9:16",
    runwayMotion: "static camera, dew drops gently glistening and slowly catching the moonlight on the spider web threads, very subtle web movement in soft breeze, no zoom, no pan, no rotation, no people",
    audioMood: "grilos-tropicais",
    keywords: ["orvalho", "teia", "gota", "gotas"],
  },
  {
    id: "hem-m01-27",
    prompt: "Small fire pit in the desert at night, silhouettes of people sitting around in distance, warm amber light, deep starry sky --ar 9:16",
    runwayMotion: "static camera, fire pit flames flickering and dancing in place, sparks rising slowly upward and fading, silhouettes of people sitting around remain still, stars softly twinkling above, slow ambient atmosphere, no zoom, no pan, no rotation",
    audioMood: "tambor-lento-distante",
    keywords: ["fogueira", "fogo", "deserto"],
  },
  {
    id: "hem-m01-28",
    prompt: "Hands cradling a mug of dark cacao in soft amber kitchen light at night, intimate close framing --ar 9:16",
    runwayMotion: "static camera, white steam rising slowly from the mug of dark cacao curling upward and dissipating, hands stay still cradling the mug, warm amber light gently pulsing, no zoom, no pan, no rotation, no face visible",
    audioMood: "lareira-respira",
    keywords: ["cacau", "chocolate"],
  },
  {
    id: "hem-m01-29",
    prompt: "Garden path lined with low warm lanterns at night, soft fog, no people, depth of field --ar 9:16",
    runwayMotion: "static camera with very subtle slow forward drift, lanterns lining the garden path softly pulsing one by one in random order, mist drifting horizontally low to the ground, slow contemplative pace, no zoom, no rotation, no people",
    audioMood: "grilos-tropicais",
    keywords: ["caminho", "lanternas", "neblina"],
  },
  {
    id: "hem-m01-30",
    prompt: "Single white feather suspended in a beam of moonlight, deep dark background, dreamlike composition --ar 9:16",
    runwayMotion: "static camera, single white feather falling slowly downward through the beam of moonlight with gentle horizontal drift, soft glow on the feather, very slow contemplative pace, no zoom, no pan, no rotation, no people",
    audioMood: "sussurro-coro-feminino",
    keywords: ["pena", "peito", "soltar", "solto", "deixo"],
  },
];

// ---------------------------------------------------------------------------
// BATCH 2 — JUNHO 2026 (30 cenas 100% inéditas)
// ---------------------------------------------------------------------------

const JUNHO: MjVideoPrompt[] = [
  {
    id: "hem-m02-01",
    prompt: "Single Tibetan singing bowl on a dark velvet cushion at night, faint vibration rings in the air, warm side light --ar 9:16",
    runwayMotion: "static camera, faint vibration rings expanding from the singing bowl rim, dust particles suspended in warm side light, very slow pulse, no zoom, no pan, no rotation, no people",
    audioMood: "tigela-grave",
    keywords: ["tigela", "som", "vibração"],
  },
  {
    id: "hem-m02-02",
    prompt: "Glass jar of honey catching warm lamplight on a wooden kitchen shelf at night, deep amber glow, simple still life --ar 9:16",
    runwayMotion: "static camera, warm lamplight slowly pulsing on the honey jar surface, golden glow shifting, very slow ambient light, no zoom, no pan, no rotation, no people",
    audioMood: "lareira-respira",
    keywords: ["mel", "doce", "agradeço", "gratidão"],
  },
  {
    id: "hem-m02-03",
    prompt: "Lotus flower floating on dark still water at night, single ray of moonlight illuminating the petals, magical stillness --ar 9:16",
    runwayMotion: "static camera, lotus flower gently bobbing on the still water surface, moonlight creating soft halo on the white petals, tiny ripples expanding outward, no zoom, no pan, no rotation, no people",
    audioMood: "lua-sobre-agua",
    keywords: ["lótus", "lotus", "raiz", "raízes", "lama"],
  },
  {
    id: "hem-m02-04",
    prompt: "Ancient stone staircase spiralling upward in moonlight, mossy walls, deep blue shadows, no visible top --ar 9:16",
    runwayMotion: "static camera, soft moonlight slowly shifting on the stone steps, dust motes floating in the blue light column, very slow atmospheric drift, no zoom, no pan, no rotation, no people",
    audioMood: "sussurro-coro-feminino",
    keywords: ["passo", "escada", "subir", "caminho"],
  },
  {
    id: "hem-m02-05",
    prompt: "Pestle and mortar with dried lavender on a dark stone counter at night, single candle behind, aromatic stillness --ar 9:16",
    runwayMotion: "static camera, candle flame gently flickering behind the mortar, warm light pulsing on the dried lavender, faint smoke wisps, no zoom, no pan, no rotation, no people",
    audioMood: "lareira-respira",
    keywords: ["erva", "ervas", "essência"],
  },
  {
    id: "hem-m02-06",
    prompt: "Silk cocoon on a dry branch at night, soft macro detail, moonlight from above, metamorphosis suspended --ar 9:16",
    runwayMotion: "static camera, soft moonlight slowly shifting on the silk cocoon surface, faint silk threads catching light, very still contemplative composition, no zoom, no pan, no rotation, no people",
    audioMood: "sussurro-coro-feminino",
    keywords: ["transformação", "mudar", "crescer", "cresceu", "versão"],
  },
  {
    id: "hem-m02-07",
    prompt: "Shallow clay bowl of coarse salt crystals on a dark linen cloth at night, warm side lamp, mineral texture --ar 9:16",
    runwayMotion: "static camera, warm lamp light gently pulsing on the salt crystal surfaces, tiny light reflections shifting, very slow ambient, no zoom, no pan, no rotation, no people",
    audioMood: "tigela-grave",
    keywords: ["sal", "cristal", "limpar", "limpo"],
  },
  {
    id: "hem-m02-08",
    prompt: "Old terracotta amphora against a whitewashed wall at night, warm ground lamp light, Mediterranean stillness --ar 9:16",
    runwayMotion: "static camera, warm lamp glow shifting on the curved terracotta surface, faint shadow on the whitewashed wall, very slow ambient light, no zoom, no pan, no rotation, no people",
    audioMood: "grilos-tropicais",
    keywords: ["vazio", "vazia", "aberto", "aberta", "espaço"],
  },
  {
    id: "hem-m02-09",
    prompt: "Single origami crane on a dark windowsill at night, moonlight on the paper folds, simple Japanese aesthetic --ar 9:16",
    runwayMotion: "static camera, moonlight slowly shifting across the paper crane folds, faint shadow of the crane on the sill, very slow subtle light change, no zoom, no pan, no rotation, no people",
    audioMood: "sussurro-coro-feminino",
    keywords: ["papel", "dobra", "delicado", "frágil"],
  },
  {
    id: "hem-m02-10",
    prompt: "River stones stacked in a calm brook at night, moonlight on wet surfaces, zen balance, quiet flow around the stones --ar 9:16",
    runwayMotion: "static camera, water flowing gently around the stacked stones, moonlight reflections shifting on the wet surfaces, soft continuous flow sound, no zoom, no pan, no rotation, no people",
    audioMood: "lua-sobre-agua",
    keywords: ["equilíbrio", "calma", "pousada", "pouso"],
  },
  {
    id: "hem-m02-11",
    prompt: "Woven grass basket with ripe mangoes on a moonlit wooden table, warm tropical still life, rich colours against dark background --ar 9:16",
    runwayMotion: "static camera, moonlight slowly shifting on the ripe mango surfaces, warm colour glow, very slow ambient light shift, no zoom, no pan, no rotation, no people",
    audioMood: "grilos-tropicais",
    keywords: ["fruto", "fruta", "colheita", "abundância"],
  },
  {
    id: "hem-m02-12",
    prompt: "Single lit match held between fingers against total darkness, the moment just after ignition, smoke rising from the wooden stick --ar 9:16",
    runwayMotion: "static camera, single match flame gently flickering, thin smoke rising from the stick, warm orange glow illuminating fingertips, very slow contemplative, no zoom, no pan, no rotation",
    audioMood: "lareira-respira",
    keywords: ["acender", "início", "começo", "começar", "começa"],
  },
  {
    id: "hem-m02-13",
    prompt: "Antique brass compass on a dark leather surface at night, candlelight reflection on the glass, directional stillness --ar 9:16",
    runwayMotion: "static camera, candle light gently pulsing on the brass compass surface, glass catching small reflections, very slow ambient light, no zoom, no pan, no rotation, no people",
    audioMood: "lareira-respira",
    keywords: ["direção", "norte", "orientar", "confio", "confiança"],
  },
  {
    id: "hem-m02-14",
    prompt: "Potters wheel with wet clay form in a dark workshop at night, single amber overhead lamp, hands absent, work paused --ar 9:16",
    runwayMotion: "static camera, amber lamp light gently pulsing on the wet clay surface, soft reflections on the moist form, very slow ambient, wheel still, no zoom, no pan, no rotation, no people",
    audioMood: "tigela-grave",
    keywords: ["barro", "forma", "moldar", "criar"],
  },
  {
    id: "hem-m02-15",
    prompt: "Single old key on a rough wooden surface beside a candle at night, long shadow, mystery and quiet promise --ar 9:16",
    runwayMotion: "static camera, candle flame flickering gently beside the old key, long shadow of the key shifting subtly on the wood, warm light pulsing, no zoom, no pan, no rotation, no people",
    audioMood: "lareira-respira",
    keywords: ["chave", "abrir", "porta", "dentro"],
  },
  {
    id: "hem-m02-16",
    prompt: "Small wooden boat tied to a post on a still lake at night, moon path across the water, no one aboard --ar 9:16",
    runwayMotion: "static camera, small wooden boat gently rocking on the still lake, rope swaying slightly, moon reflection rippling on the water, very slow ambient motion, no zoom, no pan, no rotation, no people",
    audioMood: "mare-noturna",
    keywords: ["barco", "lago", "travessia", "viagem"],
  },
  {
    id: "hem-m02-17",
    prompt: "Dried wildflower bouquet in a clay vase on a windowsill at night, faint moonlight, preserved beauty --ar 9:16",
    runwayMotion: "static camera, faint moonlight slowly shifting on the dried flower heads, delicate shadows on the windowsill, very slow subtle light change, no zoom, no pan, no rotation, no people",
    audioMood: "brisa-bambu",
    keywords: ["seco", "seca", "preservar", "guardar", "guardo"],
  },
  {
    id: "hem-m02-18",
    prompt: "Hourglass with dark sand flowing on a wooden desk at night, single warm lamp, time passing visibly --ar 9:16",
    runwayMotion: "static camera, dark sand grains flowing continuously through the hourglass neck, warm lamp light on the glass surface, very slow contemplative focus, no zoom, no pan, no rotation, no people",
    audioMood: "tigela-grave",
    keywords: ["hora", "relógio", "urgência", "pausa", "parar"],
  },
  {
    id: "hem-m02-19",
    prompt: "Rain collecting slowly in a large dark leaf cupped upward in a garden at night, single drop about to fall --ar 9:16",
    runwayMotion: "static camera, water droplet growing slowly on the leaf tip, faint moonlight on the water surface, leaf gently bending under the weight, very slow, no zoom, no pan, no rotation, no people",
    audioMood: "chuva-fina-no-telhado",
    keywords: ["folha", "peso", "pesa", "gota"],
  },
  {
    id: "hem-m02-20",
    prompt: "Thread and needle resting on dark fabric at night, warm side light, quiet mending paused --ar 9:16",
    runwayMotion: "static camera, warm side light gently pulsing on the needle and thread, soft shadow on the dark fabric, very slow ambient light, no zoom, no pan, no rotation, no people",
    audioMood: "lareira-respira",
    keywords: ["fio", "costura", "reparar", "inteira", "inteiro"],
  },
  {
    id: "hem-m02-21",
    prompt: "Smooth river pebble balanced on fingertips at night, moonlight on the wet stone, intimate macro, no face visible --ar 9:16",
    runwayMotion: "static camera, moonlight shifting on the wet pebble surface, fingertips holding steady, faint water dripping, very slow contemplative, no zoom, no pan, no rotation, no face",
    audioMood: "lua-sobre-agua",
    keywords: ["pedra", "leve", "suave", "segurar"],
  },
  {
    id: "hem-m02-22",
    prompt: "Empty wooden chair on a quiet porch at night, single warm lamp beside, waiting stillness, no one sitting --ar 9:16",
    runwayMotion: "static camera, warm lamp light gently pulsing on the empty wooden chair, faint shadow on the porch floor, very slow ambient, no zoom, no pan, no rotation, no people",
    audioMood: "grilos-tropicais",
    keywords: ["lugar", "vazio", "presença", "presente"],
  },
  {
    id: "hem-m02-23",
    prompt: "Old copper bell hanging from a dark wooden beam at night, not ringing, just waiting, warm patina in candlelight --ar 9:16",
    runwayMotion: "static camera, candlelight gently pulsing on the copper bell surface, warm patina reflections shifting, bell hangs still, very slow ambient, no zoom, no pan, no rotation, no people",
    audioMood: "tigela-grave",
    keywords: ["sino", "som", "escutar", "escuta", "ouvir"],
  },
  {
    id: "hem-m02-24",
    prompt: "Bare root of a large tree emerging from dark earth at night, moonlight on the bark texture, grounded power --ar 9:16",
    runwayMotion: "static camera, moonlight slowly shifting on the exposed root bark, faint mist at ground level, very slow ambient, no zoom, no pan, no rotation, no people",
    audioMood: "coruja-distante",
    keywords: ["raiz", "raízes", "terra", "chão"],
  },
  {
    id: "hem-m02-25",
    prompt: "Handmade prayer beads coiled on a dark silk cloth at night, warm amber light from the side, devotional quiet --ar 9:16",
    runwayMotion: "static camera, warm amber light gently pulsing on the prayer beads, each bead catching a small reflection, very slow ambient, no zoom, no pan, no rotation, no people",
    audioMood: "sussurro-coro-feminino",
    keywords: ["oração", "fé", "contar", "conta"],
  },
  {
    id: "hem-m02-26",
    prompt: "Freshly baked round bread on a dark cutting board at night, warm kitchen lamp, steam still rising, nourishment --ar 9:16",
    runwayMotion: "static camera, faint steam rising from the fresh bread, warm lamp light pulsing on the crust surface, very slow ambient, no zoom, no pan, no rotation, no people",
    audioMood: "lareira-respira",
    keywords: ["pão", "alimentar", "nutrir", "alimento", "sustento"],
  },
  {
    id: "hem-m02-27",
    prompt: "Closed wooden music box on a dark shelf at night, faint moonlight on the carved lid, silent potential --ar 9:16",
    runwayMotion: "static camera, moonlight slowly shifting on the carved wooden lid, faint shadow of the box on the shelf, very slow ambient, no zoom, no pan, no rotation, no people",
    audioMood: "sussurro-coro-feminino",
    keywords: ["música", "canção", "canto", "melodia", "voz"],
  },
  {
    id: "hem-m02-28",
    prompt: "Crescent moon seen through the branches of a jacaranda tree at night, purple haze, African evening --ar 9:16",
    runwayMotion: "static camera, crescent moon visible between the jacaranda branches, faint purple haze in the sky, branches unmoving, very slow ambient light, no zoom, no pan, no rotation, no people",
    audioMood: "coruja-distante",
    keywords: ["lua", "crescente", "noite"],
  },
  {
    id: "hem-m02-29",
    prompt: "Single seed resting in open palm at night, warm side light, intimate macro, promise of growth, no face --ar 9:16",
    runwayMotion: "static camera, warm side light gently pulsing on the seed and open palm, faint shadow of the fingers, very slow ambient, no zoom, no pan, no rotation, no face",
    audioMood: "sussurro-coro-feminino",
    keywords: ["semente", "plantar", "germinar", "crescer"],
  },
  {
    id: "hem-m02-30",
    prompt: "Worn wooden threshold of a doorway at night, warm light spilling from inside, dark garden outside, between two worlds --ar 9:16",
    runwayMotion: "static camera, warm interior light gently pulsing on the wooden threshold surface, dark garden unmoving beyond, faint dust in the light beam, no zoom, no pan, no rotation, no people",
    audioMood: "grilos-tropicais",
    keywords: ["porta", "limiar", "passagem", "entre"],
  },
];

// ---------------------------------------------------------------------------
// Exporta a lista combinada. Para os meses 3–6 (Jul–Out), add batches aqui.
// ---------------------------------------------------------------------------

export const MJ_VIDEO_PROMPTS: MjVideoPrompt[] = [...MAIO, ...JUNHO];

export const MJ_PRIORITARIOS = MJ_VIDEO_PROMPTS.filter((p) => p.prioritario);
