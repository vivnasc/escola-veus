/**
 * Prompts Midjourney V7 (imagens) + motion para Runway Gen4 Turbo, para a
 * motion library "Hoje, em Mim".
 *
 * Estrutura: 30 categorias × 6 variantes = **180 cenas únicas**, cobre
 * 6 meses de produção diária sem repetir composição. Espelha a estrutura
 * do VC Sabia (`vc-sabia-motions.seed.json` com 25 cats × 8 subjects).
 *
 * Pipeline:
 *  1. O calendário escolhe (categoria, variante) por dia via keyword da
 *     frase → mood do dia → ciclo. Cada (cat, variant) é único.
 *  2. Geras a IMAGEM no Midjourney com `buildMjPrompt(cat, variantIdx)`
 *  3. Carregas a imagem no admin → app submete a Runway com `runwayMotion`
 *  4. MP4 fica em course-assets/hoje-em-mim-motions/, aparece no library
 *
 * Cada categoria partilha:
 *   - audioMood, keywords, runwayMotion (motion é por categoria, não por variante)
 *   - 6 subjects diferentes: variações visuais do mesmo tema/mood
 */

import type { NightMood } from "@/lib/hoje-em-mim/audio";

const STYLE_SUFFIX =
  "contemplative night atmosphere, intimate sanctuary mood, cinematic film grain 35mm, muted earth tones cobre cream indigo, shallow depth of field, no people no faces no text no logos --ar 9:16";

export type MjVideoPrompt = {
  id: string;
  /** Variações visuais do mesmo tema. Cada variante é um subject
   *  diferente que produz uma imagem distinta no MJ mas mantém o
   *  mood/keywords/runwayMotion da categoria. */
  subjects: string[];
  /** Motion Runway aplicado a TODAS as variantes desta categoria —
   *  o tipo de movimento é igual, só a composição visual muda. */
  runwayMotion: string;
  audioMood: NightMood;
  /** Palavras-chave PT-PT que, se aparecerem na frase do dia, fazem
   *  o calendário escolher esta categoria. */
  keywords?: string[];
  notas?: string;
  prioritario?: boolean;
};

export function buildMjPrompt(cat: MjVideoPrompt, variantIdx: number): string {
  const subject = cat.subjects[variantIdx % cat.subjects.length];
  return `${subject}, ${STYLE_SUFFIX}`;
}

export const MJ_VIDEO_PROMPTS: MjVideoPrompt[] = [
  {
    id: "mj-01-vela-stucco",
    prioritario: true,
    audioMood: "lareira-respira",
    keywords: ["vela", "chama"],
    runwayMotion:
      "static camera, single candle flame gently flickering and dancing in place, soft shadow flickering on the wall, slow contemplative night atmosphere, no zoom, no pan, no rotation, no people, no sudden movements",
    subjects: [
      "Single warm beeswax candle flame against a dark stucco wall, shadow play, deep navy background",
      "Tall white taper candle burning slowly against a moss green plaster wall, single warm flame",
      "Short stubby candle in an iron holder on a stone ledge, dark room behind, golden flame",
      "Single church candle in a small alcove of a cob wall, deep umber tones, shadow halo",
      "Beeswax pillar candle on a wooden bench against a charcoal limewash wall, intimate corner",
      "Single black taper candle with bright honey flame against a terracotta plaster wall at night",
    ],
  },
  {
    id: "mj-02-tropical-amber",
    prioritario: true,
    audioMood: "brisa-bambu",
    keywords: ["verandah", "lanterna", "tropical", "folha", "folhas", "noite"],
    runwayMotion:
      "static camera, large tropical broadleaves gently swaying left and right in soft night breeze, amber lantern light slightly pulsing, leaves move organically and slowly, no zoom, no pan, no rotation, no people",
    subjects: [
      "Tropical broadleaf plants in night air, backlit by amber lantern, deep indigo surround, African verandah",
      "Banana leaves swaying behind a single warm hurricane lantern on a wooden verandah railing at night",
      "Palm fronds in moonlight overlapping a softly-lit covered veranda, deep blue dusk",
      "Monstera leaves in silhouette against a glowing paper lantern, intimate verandah corner",
      "Bird-of-paradise leaves at night with a low amber sconce lighting them from below",
      "Heliconia leaves backlit by a single dim verandah bulb, deep tropical garden behind",
    ],
  },
  {
    id: "mj-03-brasas",
    prioritario: true,
    audioMood: "lareira-respira",
    keywords: ["brasa", "brasas", "lume"],
    runwayMotion:
      "static camera, glowing orange embers slowly pulsing and breathing in place, small sparks rising slowly upward, dust particles drifting gently in warm light, no zoom, no pan, no rotation, no people",
    subjects: [
      "Glowing embers in a low brazier, dark earthy background, dust particles in warm air",
      "Bed of dying embers in a clay pot at night, deep amber and red glow, intimate close framing",
      "Cast iron brazier full of orange embers on a stone floor at night, soft rising sparks",
      "Embers cooling in a circle of stones, dark indigo night, single dust mote suspended",
      "Last embers in an outdoor fire bowl, deep coal red, ash settling slowly",
      "Smoldering embers in a hand-thrown pot under a tin shelter, warm pulsing glow",
    ],
  },
  {
    id: "mj-04-chuva-janela",
    prioritario: true,
    audioMood: "chuva-fina-no-telhado",
    keywords: ["chuva", "janela", "pingo", "pingos"],
    runwayMotion:
      "static camera, fine rain droplets sliding down the window glass at varying speeds, occasional new drops appearing and joining the trails, warm amber light pulsing softly behind the glass, slow contemplative pace, no zoom, no pan, no rotation, no people",
    subjects: [
      "Fine rain on a window pane at night, warm interior amber light glowing behind, blurred droplets",
      "Rain trails on a kitchen window at night, warm soft yellow light blurred behind, intimate",
      "Window covered in rain droplets, single bedside lamp glowing behind, indigo night outside",
      "Wet window glass at night with city haze of warm orange streetlights blurred through",
      "Old wooden window frame with rain streaking down, candle flickering inside, deep blue night",
      "Tall arched window with fine rain at night, warm fire light inside, contemplative",
    ],
  },
  {
    id: "mj-05-incenso",
    prioritario: true,
    audioMood: "tigela-grave",
    keywords: ["incenso", "fumo", "respira", "respiração", "respirar", "respiro"],
    runwayMotion:
      "static camera, white incense smoke rising slowly and curling upward in elegant tendrils, dust particles drifting in the warm light beam, very slow contemplative motion, no zoom, no pan, no rotation, no people",
    subjects: [
      "White incense smoke rising in a dark room, single beam of warm light cutting through, very still",
      "Smoke ribbon from a stick of sandalwood incense in a clay holder, dim ochre wall behind",
      "Curling palo santo smoke in a single shaft of moonlight on a wooden altar",
      "Incense smoke rising past a small bronze bowl on dark fabric, deep navy background",
      "Coil of frankincense smoke against a black wall, warm side lamp casting it golden",
      "Slow column of white smoke from a smudge stick on dark stone, intimate sanctuary",
    ],
  },
  {
    id: "mj-06-bambu-ocre",
    audioMood: "brisa-bambu",
    keywords: ["bambu", "sombra", "ombro", "ombros"],
    runwayMotion:
      "static camera, slender bamboo leaves gently swaying left and right in soft night breeze, soft long shadows moving rhythmically on the wall, slow gentle motion, no zoom, no pan, no rotation, no people",
    subjects: [
      "Bamboo grove against an earthen ochre wall at night, low warm lantern light, soft long shadows",
      "Single bamboo stalk in a black vase against a cob wall, side amber lamp casting long shadow",
      "Bamboo shoots clustered in moonlight against a sienna stucco wall, faint silhouettes",
      "Tall bamboo silhouettes behind a sheer curtain at night, soft warm interior glow",
      "Bamboo leaves overlapping in a moonlit corner, ochre clay wall textured by light",
      "Bamboo branches against an old earth-colored door at night, single lamp from the side",
    ],
  },
  {
    id: "mj-07-baobab-lua",
    audioMood: "coruja-distante",
    keywords: ["baobá", "baobab", "savana"],
    runwayMotion:
      "static camera, silver clouds slowly drifting horizontally across the full moon from left to right, full moon stays in place, baobab silhouette unmoving in foreground, very slow drift, no zoom, no rotation, no people",
    subjects: [
      "Full moon behind silver clouds, silhouette of a single baobab tree, African savannah at night",
      "Twin baobabs in silhouette under a rising moon, vast empty savannah, deep purple sky",
      "Single baobab against a starry African sky, low horizon, faint moon halo",
      "Baobab in foreground with a distant warm village light, full moon rising behind",
      "Lone baobab silhouette under the milky way, dry grass below, contemplative space",
      "Baobab branches like roots against a luminous full moon, deep savannah blue",
    ],
  },
  {
    id: "mj-08-cortina-linho",
    audioMood: "brisa-bambu",
    keywords: ["cortina", "linho", "vento", "brisa"],
    runwayMotion:
      "static camera, sheer white linen curtain gently billowing inward and outward in moonlit night breeze, fabric folds rippling slowly and organically, silvery light pulsing softly behind, no zoom, no pan, no rotation, no people",
    subjects: [
      "White sheer linen curtain at a moonlit window, silvery blue light, soft fabric folds",
      "Long cream linen drape against an open balcony door at night, moon glow behind",
      "Pale curtain billowing gently in a dark bedroom, blue moonlight on the wall behind",
      "Sheer linen panel half-tucked at a tall window, candle glow inside, indigo night outside",
      "Two linen curtains parted slightly at a wooden window frame, soft silver light streaming through",
      "Lightweight cotton drape moving in a soft breeze at a moonlit verandah opening",
    ],
  },
  {
    id: "mj-09-pirilampos",
    audioMood: "grilos-tropicais",
    keywords: ["pirilampo", "pirilampos", "vagalume", "floresta"],
    runwayMotion:
      "static camera, small fireflies gently floating and blinking on and off in the dark forest clearing, light points appearing and disappearing slowly at random positions, very slow ambient motion, no zoom, no pan, no rotation, no people",
    subjects: [
      "Fireflies floating in a dark forest clearing, faint blue moon above, dreamy mood",
      "Cluster of fireflies dancing above tall night grass, deep velvet blue sky",
      "Single firefly glowing on a leaf at night, dark forest depth behind, magical close-up",
      "Fireflies above a still pond in dense forest, faint moon reflection on water",
      "Fireflies among ferns at night, soft mist between them, deep emerald and indigo tones",
      "Trail of fireflies along a narrow forest path at night, ground in moss",
    ],
  },
  {
    id: "mj-10-fonte-pedra",
    audioMood: "lua-sobre-agua",
    keywords: ["fonte", "pedra", "jardim"],
    runwayMotion:
      "static camera, water gently trickling continuously down the stone fountain, water droplets falling and pooling, lantern flame softly flickering nearby, slow continuous flow, no zoom, no pan, no rotation, no people",
    subjects: [
      "Water trickling from a black stone fountain in a moonlit African garden, single low warm lantern",
      "Old terracotta wall fountain dripping into a stone basin, ferns at the base, moonlight",
      "Small zen stone fountain in a dark garden at night, single hurricane lamp glow",
      "Carved granite fountain with a quiet trickle, ivy creeping up the wall, blue night",
      "Hand-cast bronze water spout into a clay bowl at night, soft amber lamp beside",
      "Garden fountain with mossy stones, low moon casting a silver reflection on the surface",
    ],
  },
  {
    id: "mj-11-via-lactea",
    audioMood: "sussurro-coro-feminino",
    keywords: ["estrela", "estrelas", "via láctea", "cosmos", "céu", "cósmico", "silêncio"],
    runwayMotion:
      "static camera with very subtle parallax drift, milky way slowly drifting horizontally across the sky, stars twinkling softly throughout, silhouettes unmoving on horizon, very slow celestial motion, no zoom, no rotation, no people",
    subjects: [
      "Milky Way over silhouetted acacia trees, deep cosmic blues and purples, time-lapse aesthetic",
      "Star field above a long quiet horizon, single faint shooting star, deep indigo sky",
      "Milky way arcing over a dark mountain ridge, no foreground details, vast cosmic stillness",
      "Sky full of stars over a still desert horizon, faint zodiacal light glow",
      "Galactic core above silhouetted palm trees, deep violet and dust orange",
      "Dense star cluster above a dark ocean horizon, no moon, only stars",
    ],
  },
  {
    id: "mj-12-cha-quente",
    audioMood: "lareira-respira",
    keywords: ["chá", "mão", "mãos"],
    notas: "Bom para sábado (corpo). Mãos como protagonistas, sem rosto.",
    runwayMotion:
      "static camera, steam rising slowly from the cup curling upward, hands stay still gently wrapped around the cup, warm amber light gently pulsing, no zoom, no pan, no rotation, no face visible",
    subjects: [
      "Hands wrapped around a warm clay cup of tea, soft amber kitchen light at night, intimate close framing",
      "Single hand holding a small ceramic teacup over a wooden table, candlelight, no face visible",
      "Two hands cradling a vintage enamel mug of tea, soft warm side light, no face",
      "Hands holding a small Moroccan tea glass with steam rising, dark wood table",
      "Hand resting beside a cup of tea on a windowsill at night, warm interior lamp",
      "Hands warming on a chunky stoneware mug of tea, deep navy wall behind, no face",
    ],
  },
  {
    id: "mj-13-rede-verandah",
    audioMood: "grilos-tropicais",
    keywords: ["rede"],
    runwayMotion:
      "static camera, hammock gently swaying back and forth in slow rhythm, amber lantern light softly pulsing, dark tropical garden unmoving in background, slow contemplative pace, no zoom, no pan, no rotation, no people",
    subjects: [
      "Soft amber-lit hammock on a verandah, dark tropical garden beyond, warm dusk to night transition",
      "Empty rope hammock between two trees at night, single hurricane lantern beside, soft mood",
      "Striped hammock on a wide wooden porch at night, palm leaves in dark background",
      "Macrame hammock with linen pillows on a verandah, low amber lamp casting warm light",
      "Single hammock under a thatched roof at night, deep tropical garden, low fairy lights",
      "Old rope hammock on a stone terrace, full moon rising over distant trees",
    ],
  },
  {
    id: "mj-14-diario-cera",
    audioMood: "lareira-respira",
    keywords: ["diário", "página", "páginas", "livro", "escrevo", "escrever", "palavra", "palavras"],
    notas: "Bom para segunda (convite) e quinta (aprendi).",
    runwayMotion:
      "static camera, single page of the open journal slowly turning upward and folding over, candle flame gently flickering in background warm shadows pulsing, slow contemplative pace, no zoom, no pan, no rotation, no hands visible",
    subjects: [
      "Pages of an old leather journal open under candlelight, warm shadows, intimate writing nook",
      "Open notebook with a fountain pen resting on it, single candle beside, dark wood desk",
      "Half-open leather book of poetry on a worn wooden table, warm lamp light",
      "Open journal with handwritten lines (illegible) by lamp light, soft amber tones",
      "Stack of old letters tied with twine and an open journal page, candle nearby",
      "Worn diary with pressed flower between pages, candle glow on the cream paper",
    ],
  },
  {
    id: "mj-15-mar-noite",
    audioMood: "mare-noturna",
    keywords: ["mar", "onda", "ondas", "costa", "tempo", "ciclo", "passagem"],
    runwayMotion:
      "static camera, small calm waves slowly rolling onto dark sand, moon reflection rippling gently on the wet sand and water surface, slow continuous wave motion, no zoom, no pan, no rotation, no people",
    subjects: [
      "Calm small waves on dark sand at night, distant moon reflection, contemplative composition",
      "Quiet ocean shore at night with phosphorescent foam, deep blue water",
      "Long exposure of gentle waves on black volcanic sand at dusk turning to night",
      "Moonlight path across calm sea, single small wave breaking on the shore",
      "Wet shoreline at low tide at night, reflective patches of moonlight",
      "Empty cove at moonrise, small ripples meeting the curve of dark sand",
    ],
  },
  {
    id: "mj-16-tambor-shadow",
    audioMood: "tambor-lento-distante",
    keywords: ["tambor"],
    notas: "Pode tentar 'djembe' se udu não devolver bem.",
    runwayMotion:
      "static camera, soft amber light gently pulsing on the wooden drum surface, faint shadow moving subtly on the dark wall, very slow ambient motion, no zoom, no pan, no rotation, no hands visible",
    subjects: [
      "Single low African udu drum in soft amber light, faint shadow on dark wall, contemplative still",
      "Small djembe drum on a wooden floor at night, single side lamp casting deep shadow",
      "Pair of clay hand drums on a dark rug, warm side glow, dim room",
      "Goblet drum on a low table, leather skin catching warm light, deep umber walls",
      "Wooden frame drum hanging on a clay wall, soft lantern beside, dark shadows",
      "Talking drum upright on a hand-woven mat, single oil lamp lighting one side",
    ],
  },
  {
    id: "mj-17-velas-mesa",
    audioMood: "lareira-respira",
    keywords: ["velas", "altar", "mesa", "ritual"],
    runwayMotion:
      "static camera, multiple candle flames independently flickering and dancing in place, soft amber halos gently pulsing around each, no zoom, no pan, no rotation, no people",
    subjects: [
      "Three warm beeswax candles on a dark wood table, soft amber halo, deep navy room beyond, intimate altar",
      "Cluster of five small votive candles on a stone slab altar at night, soft glow",
      "Two tall taper candles flanking a small bowl of jasmine, dark wood table",
      "Row of seven candles on a wooden mantel at night, soft warm glow on the wall",
      "Group of mismatched candles on a low altar with dried herbs, deep indigo room",
      "Triangle of three candles on a velvet cloth, dark walls, intimate ritual mood",
    ],
  },
  {
    id: "mj-18-sombra-planta",
    audioMood: "brisa-bambu",
    keywords: ["planta", "parede", "sombras", "olhos"],
    notas: "Bom para quarta (soltar). Movimento mínimo, quase abstrato.",
    runwayMotion:
      "static camera, soft shadow of the house plant slowly swaying left and right on the creamy plaster wall, warm lamp light softly pulsing, very slow rhythmic shadow movement, no zoom, no pan, no rotation",
    subjects: [
      "Soft shadow of a single house plant on a creamy plaster wall, warm lamp light, intimate room",
      "Shadow of fern leaves dancing on a cream wall, side amber lamp, abstract pattern",
      "Silhouette of a potted snake plant cast on an ochre wall by a single bulb",
      "Shadow of swaying eucalyptus branches on a white plaster wall at night",
      "Olive branch shadow on a sienna wall, soft side light, very still composition",
      "Bird-of-paradise leaf shadow on a beige plaster wall, single tall lamp",
    ],
  },
  {
    id: "mj-19-vapor-cha",
    audioMood: "lareira-respira",
    keywords: ["vapor"],
    runwayMotion:
      "static camera, white steam rising slowly from the cup curling upward in soft tendrils, steam dissipates and renews continuously, warm side light gently pulsing, no zoom, no pan, no rotation, no people",
    subjects: [
      "Steam rising from a dark stoneware cup of tea on a wooden surface, soft warm side light, dark navy background",
      "Curling steam over a small ceramic bowl of broth, dim warm lamp on the side",
      "Steam from a clay teapot on a wooden tray, dark kitchen, single candle beside",
      "Vapor rising from a hand-thrown mug on a stone counter at night, low amber light",
      "Steam columns over a cast iron pot on a wooden stand, dim warm side glow",
      "Soft vapor over a small porcelain cup on a worn wooden table, deep umber wall",
    ],
  },
  {
    id: "mj-20-silhueta-janela",
    audioMood: "sussurro-coro-feminino",
    keywords: ["intenção", "escolho", "escolher", "silhueta", "amanhã"],
    notas: "Bom para domingo (intenção).",
    runwayMotion:
      "static camera, soft moonlight slowly shifting on the arched window frame, woman silhouette unmoving in contemplative pose, light pulsing gently, very subtle slow motion, no zoom, no pan, no rotation",
    subjects: [
      "Silhouette of a woman from behind looking out an arched window at the moon, deep indigo room, single soft lamp glow",
      "Silhouette from behind seated by a tall window, moonlight on the wall, soft contemplation",
      "Outline of a person from behind standing in a doorway at moonrise, deep blue night beyond",
      "Silhouette of a head and shoulders against a moonlit curtain, intimate room scale",
      "Faceless silhouette by an oval window, hands holding a cup, soft moon glow",
      "Outline of a figure seated at a low altar by a window, candle on the sill",
    ],
  },
  {
    id: "mj-21-estrelas-poca",
    audioMood: "lua-sobre-agua",
    keywords: ["poça", "reflexo"],
    runwayMotion:
      "static camera, gentle ripple expanding slowly across the still water puddle from a single point, stars reflection rippling and re-settling, surface returns to stillness then ripples again, very subtle slow motion, no zoom, no pan, no rotation, no people",
    subjects: [
      "Stars reflected in a still puddle of water on dark earth, magical realism, contemplative composition",
      "Moonlight reflected on a quiet rain puddle on cobblestones at night",
      "Star reflections in a shallow stone bowl of water in a moonlit garden",
      "Sky reflected in a black mirror of still water on cracked earth at dusk",
      "Single moon reflection in a clay bowl of water, dark room behind",
      "Galactic reflection in a tide pool on dark sand at night",
    ],
  },
  {
    id: "mj-22-coruja-ramo",
    audioMood: "coruja-distante",
    keywords: ["coruja", "ramo"],
    runwayMotion:
      "static camera, owl silhouette slowly turning its head once to the side and back, soft mist drifting horizontally behind, blue moon light softly pulsing, no zoom, no pan, no rotation, no people",
    subjects: [
      "Owl silhouette perched on a bare branch under a misty moon, faint blue light, quiet still composition",
      "Barn owl on a fence post at night, soft moon glow, deep blue field behind",
      "Tawny owl in silhouette against a full moon, gnarled branch in foreground",
      "Snowy owl outline on a low rock at night, faint mist, distant treeline",
      "Pair of small owls on a thin branch, deep blue night sky behind",
      "Owl on a broken tree limb against a starry navy sky, light fog at base",
    ],
  },
  {
    id: "mj-23-jasmim-vela",
    audioMood: "lareira-respira",
    keywords: ["jasmim", "flor", "flores"],
    notas: "Bom para terça (gratidão) e sexta (celebrar).",
    runwayMotion:
      "static camera, candle flame gently flickering beside the flowers, soft amber glow pulsing on the white petals, very slight petal movement, slow contemplative motion, no zoom, no pan, no rotation, no people",
    subjects: [
      "White jasmine flowers in a clay bowl beside a single warm candle, dark earthy background, soft amber glow",
      "Single white gardenia floating in a dish of water beside a candle on a wooden table",
      "Bouquet of small white flowers on dark linen with a single taper candle behind",
      "Frangipani flowers scattered around a low candle on a stone slab, intimate altar",
      "White hibiscus closed for the night on a wooden tray, warm candle beside it",
      "Sprig of jasmine in a tiny glass vase, beeswax candle behind, deep umber background",
    ],
  },
  {
    id: "mj-24-pes-areia",
    audioMood: "mare-noturna",
    keywords: ["pé", "pés", "areia", "praia"],
    notas: "Bom para sábado (corpo).",
    runwayMotion:
      "static camera, gentle ripple of water lapping at the bare feet on the dark sand, moonlight reflection rippling on the wet sand, feet remain still, very slow contemplative motion, no zoom, no pan, no rotation, no face visible",
    subjects: [
      "Bare feet on dark cool night sand at the water edge, moonlight reflection, sensorial intimate framing",
      "Two feet half-buried in cool sand at night, faint moon glow, no face visible",
      "Feet on wet smooth pebbles at the shore at night, water lapping softly",
      "Bare feet on a woven straw mat beside the night sea, soft warm side lantern",
      "Top-down view of feet on dark wet sand under moonlight, no face",
      "Feet on cold stone steps leading into the sea at night, moon path on water",
    ],
  },
  {
    id: "mj-25-aldeia-distante",
    audioMood: "tambor-lento-distante",
    keywords: ["aldeia", "casa", "distante"],
    runwayMotion:
      "static camera, distant yellow window lights softly twinkling and pulsing on and off in the village, stars slowly twinkling above, silhouettes unmoving on horizon, very slow ambient motion, no zoom, no pan, no rotation, no people",
    subjects: [
      "Distant African village at night with small warm yellow window lights, silhouettes of acacia trees, deep blue sky",
      "Tiny mountain village in the distance at dusk, single road lit by warm lamps, cool night sky",
      "Hamlet across a wide field at night, lit windows like fireflies, dark blue mood",
      "Distant fishing village on a quiet coast at night, warm pier light, calm sea",
      "Small clay village in a valley at night, single chimney smoke rising, deep navy sky",
      "Faraway settlement under a starry sky, two warm windows visible, vast empty landscape",
    ],
  },
  {
    id: "mj-26-teia-orvalho",
    audioMood: "grilos-tropicais",
    keywords: ["orvalho", "teia", "gota", "gotas"],
    runwayMotion:
      "static camera, dew drops gently glistening and slowly catching the moonlight on the web threads, very subtle web movement in soft breeze, no zoom, no pan, no rotation, no people",
    subjects: [
      "Close-up of a spider web with dew drops glistening under moonlight, dark forest background, delicate composition",
      "Single dewdrop on a fern frond at dawn-night transition, moon halo behind",
      "Cobweb stretched between two branches at night, beaded with dew, soft blue glow",
      "Dewdrops on long grass at moonrise, deep blue field behind, intimate macro",
      "Web in a corner of a wooden window, faint moonlight catching each droplet",
      "Spiderweb on a rosemary bush at night, dewdrops catching warm porch light beyond",
    ],
  },
  {
    id: "mj-27-fogueira-silhuetas",
    audioMood: "tambor-lento-distante",
    keywords: ["fogueira", "fogo", "deserto"],
    runwayMotion:
      "static camera, fire pit flames flickering and dancing in place, sparks rising slowly upward and fading, silhouettes of people sitting around remain still, stars softly twinkling above, slow ambient atmosphere, no zoom, no pan, no rotation",
    subjects: [
      "Small fire pit in the desert at night, silhouettes of people sitting around in distance, warm amber light, deep starry sky",
      "Bonfire on a quiet beach at night, distant figures around it, dark sea behind",
      "Open fire in a clearing of a forest at night, three silhouettes around, faint mist",
      "Small ritual fire in a stone circle at night, deep amber flames, no faces visible",
      "Outdoor cooking fire in a savannah camp, distant silhouettes, starry sky",
      "Fire in a brazier on a rooftop at night, two seated silhouettes, city lights below",
    ],
  },
  {
    id: "mj-28-chocolate-vapor",
    audioMood: "lareira-respira",
    keywords: ["cacau", "chocolate"],
    runwayMotion:
      "static camera, white steam rising slowly from the mug curling upward and dissipating, hands stay still cradling the mug, warm amber light gently pulsing, no zoom, no pan, no rotation, no face visible",
    subjects: [
      "Hands cradling a mug of dark cacao in soft amber kitchen light at night, intimate close framing",
      "Single hand holding a stoneware mug of cacao on a wooden table, candle on the side",
      "Two hands wrapping a warm mug of cacao, no face, dark linen cloth in foreground",
      "Mug of cacao with cinnamon stick on a saucer, warm side lamp, no face",
      "Cocoa drink on a windowsill at night with hands resting beside, no face",
      "Hand pouring cacao from a small pot into a mug, candle behind, no face",
    ],
  },
  {
    id: "mj-29-caminho-lanternas",
    audioMood: "grilos-tropicais",
    keywords: ["caminho", "lanternas", "neblina"],
    runwayMotion:
      "static camera with very subtle slow forward drift, lanterns lining the path softly pulsing one by one in random order, mist drifting horizontally low to the ground, slow contemplative pace, no zoom, no rotation, no people",
    subjects: [
      "Garden path lined with low warm lanterns at night, soft fog, no people, depth of field",
      "Stone path through a dark garden lined with paper lanterns, deep emerald shrubs",
      "Forest path with small hanging lanterns between trees, soft mist on the ground",
      "Wooden walkway lit by low pole lanterns at night, deep blue sky above",
      "Curving sand path with bamboo torches, mist drifting low between palms",
      "Cobblestone path with iron lanterns at intervals, soft glow on damp stones",
    ],
  },
  {
    id: "mj-30-pena-cai",
    audioMood: "sussurro-coro-feminino",
    keywords: ["pena", "peito", "soltar", "solto", "deixo"],
    notas: "Bom para quarta (soltar) e domingo (intenção).",
    runwayMotion:
      "static camera, single feather falling slowly downward through the beam of moonlight with gentle horizontal drift, soft glow on the feather, very slow contemplative pace, no zoom, no pan, no rotation, no people",
    subjects: [
      "Single white feather suspended in a beam of moonlight, deep dark background, dreamlike composition",
      "Pale grey feather floating slowly against a dark velvet backdrop, soft side glow",
      "Feather caught mid-fall in a shaft of warm lamp light, deep navy room",
      "Long owl feather drifting against a starry indigo sky, magical realism",
      "Soft down feather floating above a wooden floor, single moon beam from a window",
      "Single dove feather suspended in a quiet dark room, dust particles around it",
    ],
  },
];

export const MJ_PRIORITARIOS = MJ_VIDEO_PROMPTS.filter((p) => p.prioritario);
