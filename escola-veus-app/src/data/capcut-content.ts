// CapCut Content — pares imagem + áudio para montar vídeos
// Áudios em /public/audios/marketing/
// Gerados em /admin/voz com a voz da Vivianne (ElevenLabs)

import type { CarouselSlide } from "./content-calendar-weeks";

export type CapCutCategory =
  | "teasers-espelhos"
  | "stories"
  | "trailer"
  | "teasers-nos"
  | "ctas";

export type CapCutEntry = {
  id: string;
  category: CapCutCategory;
  categoryLabel: string;
  title: string;
  script: string; // texto gravado como áudio
  audioFile: string; // nome do ficheiro em /public/audios/marketing/
  slide: CarouselSlide;
};

// Cores por véu (de experiences.ts)
const VEU_COLORS = [
  { bg: "#2a2520", text: "#f7f5f0", accent: "#c9b896" }, // 1 Ilusão
  { bg: "#1e2620", text: "#f5f7f5", accent: "#8b9b8e" }, // 2 Medo
  { bg: "#261e1e", text: "#faf5f5", accent: "#b07a7a" }, // 3 Culpa
  { bg: "#252018", text: "#faf7f3", accent: "#ab9375" }, // 4 Identidade
  { bg: "#181e26", text: "#f3f6fa", accent: "#8aaaca" }, // 5 Controlo
  { bg: "#221820", text: "#faf5f8", accent: "#c08aaa" }, // 6 Desejo
  { bg: "#1e1a26", text: "#f7f5fa", accent: "#baaacc" }, // 7 Separação
];

const VEU_NAMES = [
  "Ilusão",
  "Medo",
  "Culpa",
  "Identidade",
  "Controlo",
  "Desejo",
  "Separação",
];

const ESPELHO_NAMES = [
  "O Espelho da Ilusão",
  "O Espelho do Medo",
  "O Espelho da Culpa",
  "O Espelho da Identidade",
  "O Espelho do Controlo",
  "O Espelho do Desejo",
  "O Espelho da Separação",
];

const ESPELHO_SLUGS = [
  "ilusao",
  "medo",
  "culpa",
  "identidade",
  "controlo",
  "desejo",
  "separacao",
];

const NO_NAMES = [
  "O Nó da Herança",
  "O Nó do Silêncio",
  "O Nó do Sacrifício",
  "O Nó da Vergonha",
  "O Nó da Solidão",
  "O Nó do Vazio",
  "O Nó da Pertença",
];

const NO_SLUGS = [
  "heranca",
  "silencio",
  "sacrificio",
  "vergonha",
  "solidao",
  "vazio",
  "pertenca",
];

// Scripts dos teasers dos Espelhos
const TEASER_ESPELHOS_SCRIPTS = [
  "Havia uma manhã em que Sara acordou e perguntou: quando foi que escolhi esta vida? Não houve resposta imediata. Mas a pergunta ficou. O Espelho da Ilusão espera por ti.",
  "Sabes o que queres. Mas algo decide antes de ti. Sempre. O Espelho do Medo é um convite a olhar para esse algo — de frente, com gentileza.",
  "Toda a vez que fazes algo só para ti, uma voz diz que não mereces. Esta experiência desafia essa voz. O Espelho da Culpa começa aqui.",
  "Tiras o papel de mãe, de filha, de profissional — e o que sobra? O Espelho da Identidade é uma pergunta que só tu podes responder.",
  "Seguras tudo porque acreditas que se largares, desmorona. O Espelho do Controlo é um convite a descobrir o que acontece quando soltas.",
  "Preenches o tempo e o espaço com coisas que não te preenchem. O Espelho do Desejo pergunta: o que queres, de verdade?",
  "Deste tanto para pertencer que te perdeste no processo. O Espelho da Separação é o caminho de volta a ti.",
];

// Scripts das Stories
const STORY_SCRIPTS = [
  "E se uma pergunta simples mudasse tudo? Sara fez essa pergunta numa manhã comum. Swipe para descobrir o teu espelho.",
  "O medo não é o inimigo. É um mensageiro antigo que aprendeu a falar demasiado alto. Dá-lhe atenção — no teu ritmo.",
  "Mereces não é algo que se conquista. É algo que já és. Só esqueceste. Este espelho lembra-te.",
  "Por baixo de todos os papéis que desempenhas existe alguém que nunca precisou de justificação para existir.",
  "Largar não é perder o controlo. É confiar que podes descansar sem que tudo desmorone.",
  "O desejo que procuras fora sempre esteve dentro. Esta experiência mostra-te o caminho.",
  "A separação que sentes do mundo começa sempre com a separação que criaste de ti mesma.",
];

// Scripts dos Teasers dos Nós
const TEASER_NOS_SCRIPTS = [
  "Sara viu o véu. Mas há um nó que ficou por desatar. A mãe sempre viu. Esperou anos. Agora que Sara acordou, Helena tem algo para lhe dizer.",
  "Rui e Ana nunca disseram o que sentiram. O medo calou-os por anos. O Nó do Silêncio é o que ficou por falar.",
  "Filipe dedicou a vida aos outros — e chamou a isso entrega. Luísa viu o que havia por baixo. O Nó do Sacrifício é essa conversa.",
  "Vítor e Mariana encontraram-se quando as máscaras já tinham caído. O Nó da Vergonha é o que acontece a seguir.",
  "Isabel controlou tudo para não perder ninguém. E perdeu Pedro assim mesmo. O Nó da Solidão é a verdade que ficou.",
  "Lena e Sofia chamaram amizade ao que era dependência. O Nó do Vazio é o espaço que sobrou quando a máscara caiu.",
  "Helena e Miguel separaram-se para se encontrar. O Nó da Pertença é a história de quem reinventou o lar.",
];

// ── TEASERS ESPELHOS ──────────────────────────────────────────────────────────

const teasersEspelhos: CapCutEntry[] = ESPELHO_NAMES.map((name, i) => ({
  id: `teaser-espelho-${ESPELHO_SLUGS[i]}`,
  category: "teasers-espelhos",
  categoryLabel: "Teaser Espelho",
  title: name,
  script: TEASER_ESPELHOS_SCRIPTS[i],
  audioFile: `teaser-espelho-${i + 1}-${ESPELHO_SLUGS[i]}.mp3`,
  slide: {
    bg: VEU_COLORS[i].bg,
    text: VEU_COLORS[i].text,
    accent: VEU_COLORS[i].accent,
    title: `Espelho ${i + 1}\n${VEU_NAMES[i]}`,
    body: TEASER_ESPELHOS_SCRIPTS[i].split(".")[0] + ".",
    footer: "seteveus.space",
  },
}));

// ── STORIES ───────────────────────────────────────────────────────────────────

const stories: CapCutEntry[] = ESPELHO_NAMES.map((name, i) => ({
  id: `story-${ESPELHO_SLUGS[i]}`,
  category: "stories",
  categoryLabel: "Story",
  title: `Story — ${VEU_NAMES[i]}`,
  script: STORY_SCRIPTS[i],
  audioFile: `story-espelho-${i + 1}-${ESPELHO_SLUGS[i]}.mp3`,
  slide: {
    bg: VEU_COLORS[i].bg,
    text: VEU_COLORS[i].text,
    accent: VEU_COLORS[i].accent,
    title: VEU_NAMES[i],
    body: STORY_SCRIPTS[i],
    footer: `Véu ${i + 1} · seteveus.space`,
  },
}));

// ── TRAILER JORNADA ───────────────────────────────────────────────────────────

const trailerJornada: CapCutEntry[] = [
  {
    id: "trailer-jornada",
    category: "trailer",
    categoryLabel: "Trailer",
    title: "Trailer — A Jornada Completa",
    script:
      "Sete espelhos. Sete histórias. Uma mulher que acorda, aos poucos, para si mesma. Cada véu é uma camada. Cada espelho, um convite. A jornada começa quando tu decides. Os Sete Véus do Despertar — ao teu ritmo.",
    audioFile: "trailer-jornada-completa.mp3",
    slide: {
      bg: "#1a1814",
      text: "#f7f5f0",
      accent: "#c9b896",
      title: "Sete espelhos.\nSete histórias.\nUma jornada.",
      body: "Cada véu é uma camada.\nCada espelho, um convite.\nComeça quando tu decides.",
      footer: "Os Sete Véus do Despertar",
    },
  },
];

// ── TEASERS NÓS ───────────────────────────────────────────────────────────────

const teasersNos: CapCutEntry[] = NO_NAMES.map((name, i) => ({
  id: `teaser-no-${NO_SLUGS[i]}`,
  category: "teasers-nos",
  categoryLabel: "Teaser Nó",
  title: name,
  script: TEASER_NOS_SCRIPTS[i],
  audioFile: `teaser-no-${i + 1}-${NO_SLUGS[i]}.mp3`,
  slide: {
    bg: VEU_COLORS[i].bg,
    text: VEU_COLORS[i].text,
    accent: VEU_COLORS[i].accent,
    title: `~ ${name}`,
    body: TEASER_NOS_SCRIPTS[i].split(".")[0] + ".",
    footer: `Espelho ${i + 1} completo · seteveus.space`,
  },
}));

// ── CHAMADAS À ACÇÃO ──────────────────────────────────────────────────────────

const ctas: CapCutEntry[] = [
  {
    id: "cta-comeca-por-aqui",
    category: "ctas",
    categoryLabel: "Chamada à Ação",
    title: "Começa por aqui",
    script:
      "O primeiro espelho está à tua espera. Ao teu ritmo. Começa por aqui.",
    audioFile: "cta-comeca-por-aqui.mp3",
    slide: {
      bg: "#1a1814",
      text: "#f7f5f0",
      accent: "#c9b896",
      title: "Começa por aqui.",
      body: "O primeiro espelho\nestá à tua espera.\nAo teu ritmo.",
      footer: "seteveus.space",
    },
  },
  {
    id: "cta-ha-mais-para-ti",
    category: "ctas",
    categoryLabel: "Chamada à Ação",
    title: "Há mais para ti",
    script:
      "Sete espelhos. Sete histórias. Uma jornada ao teu ritmo. Há mais para ti.",
    audioFile: "cta-ha-mais-para-ti.mp3",
    slide: {
      bg: "#1a1814",
      text: "#f7f5f0",
      accent: "#c9b896",
      title: "Há mais para ti.",
      body: "Sete espelhos.\nSete histórias.\nUma jornada ao teu ritmo.",
      footer: "seteveus.space",
    },
  },
  {
    id: "cta-e-se-comecasses",
    category: "ctas",
    categoryLabel: "Chamada à Ação",
    title: "E se começasses",
    script:
      "Não precisas de estar pronta. Precisas apenas de estar disposta. E se começasses por aqui?",
    audioFile: "cta-e-se-comecasses.mp3",
    slide: {
      bg: "#1a1814",
      text: "#f7f5f0",
      accent: "#c9b896",
      title: "E se começasses\nagora?",
      body: "Não precisas de estar pronta.\nPrecisas apenas\nde estar disposta.",
      footer: "seteveus.space",
    },
  },
];

// ── EXPORT ────────────────────────────────────────────────────────────────────

export const capcutContent: CapCutEntry[] = [
  ...teasersEspelhos,
  ...stories,
  ...trailerJornada,
  ...teasersNos,
  ...ctas,
];

export const CAPCUT_CATEGORIES: {
  id: CapCutCategory | "todos";
  label: string;
  count: number;
}[] = [
  { id: "todos", label: "Todos", count: capcutContent.length },
  { id: "teasers-espelhos", label: "Teasers", count: teasersEspelhos.length },
  { id: "stories", label: "Stories", count: stories.length },
  { id: "trailer", label: "Trailer", count: trailerJornada.length },
  { id: "teasers-nos", label: "Nós", count: teasersNos.length },
  { id: "ctas", label: "CTAs", count: ctas.length },
];

// URL base dos áudios no Supabase Storage
export const AUDIO_BASE_PATH = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audios`;
