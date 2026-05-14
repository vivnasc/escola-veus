/**
 * Captions para "Hoje, em Mim". Post de fecho do dia, conta pessoal.
 *
 * Estrutura editorial: rotação por dia da semana (7 formatos).
 * Cada dia tem um kicker próprio que ancora o ritual:
 *  seg convite · ter gratidão · qua soltar · qui aprender ·
 *  sex celebrar · sáb corpo · dom intenção.
 *
 * Captions são gerados para IG/TikTok (Metricool) e WhatsApp Status (manual).
 *
 * Nota tipográfica: sem travessões. Pontuação usa vírgula, ponto, ou
 * quebra de linha conforme o ritmo da frase.
 */

export type DiaSemana = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const KICKER_POR_DIA: Record<DiaSemana, string> = {
  mon: "olha hoje",
  tue: "hoje agradeço",
  wed: "solto hoje",
  thu: "hoje aprendi",
  fri: "celebro hoje",
  sat: "hoje, no corpo",
  sun: "amanhã, escolho",
};

export const LABEL_POR_DIA: Record<DiaSemana, string> = {
  mon: "Convite a olhar para dentro",
  tue: "Gratidão",
  wed: "Soltar",
  thu: "O que aprendi",
  fri: "Celebrar o caminho",
  sat: "Ritual do corpo",
  sun: "Intenção para amanhã",
};

/** Glifo discreto que aparece no canto do frame e ao lado do kicker. */
export const GLIFO_POR_DIA: Record<DiaSemana, string> = {
  mon: "✶",
  tue: "☉",
  wed: "◌",
  thu: "〜",
  fri: "♢",
  sat: "◯",
  sun: "→",
};

/** Nome do dia em minúsculas para escrever vertical no frame. */
export const DIA_LONGO_PT: Record<DiaSemana, string> = {
  mon: "segunda",
  tue: "terça",
  wed: "quarta",
  thu: "quinta",
  fri: "sexta",
  sat: "sábado",
  sun: "domingo",
};

const HASHTAGS_BASE = [
  "viviannedossantos",
  "seteveus",
  "escoladosveus",
  "fechodoDia",
  "introspeccao",
  "noite",
  "contemplativo",
  "evolução",
  "pt",
  "portugal",
];

const HASHTAGS_POR_DIA: Record<DiaSemana, string[]> = {
  mon: ["olhardentro", "autoconhecimento", "presenca"],
  tue: ["gratidao", "gratitude", "agradecer"],
  wed: ["soltar", "liberta", "deixaire"],
  thu: ["aprendizagem", "aprendi", "lesson"],
  fri: ["celebrar", "celebracao", "vitoriasinvisiveis"],
  sat: ["corpo", "embodiment", "respiracao"],
  sun: ["intencao", "amanha", "manifestar"],
};

const HASHTAGS_TIKTOK_EXTRA = ["fyp", "foryou", "fypシ"];

export type CaptionSet = {
  instagram: string;
  tiktok: string;
  whatsapp: string;
};

function hashesJoined(tags: string[]): string {
  return tags.map((t) => `#${t}`).join(" ");
}

export function phraseToCaptions(opts: {
  phrase: string;
  dia: DiaSemana;
}): CaptionSet {
  const kicker = KICKER_POR_DIA[opts.dia];
  const diaTags = HASHTAGS_POR_DIA[opts.dia];
  const allTags = [...diaTags, ...HASHTAGS_BASE];

  const instagram = [
    kicker,
    "",
    opts.phrase,
    "",
    "Vivianne dos Santos",
    "seteveus.space",
    "",
    ".",
    ".",
    ".",
    "",
    hashesJoined(allTags),
  ].join("\n");

  const tiktokTags = [
    ...HASHTAGS_TIKTOK_EXTRA,
    ...diaTags,
    "viviannedossantos",
    "seteveus",
    "fechodoDia",
    "pt",
  ];
  const tiktok = [`${kicker}. ${opts.phrase}`, "", hashesJoined(tiktokTags)].join("\n");

  const whatsapp = [
    kicker,
    "",
    opts.phrase,
    "",
    "Vivianne · seteveus.space",
  ].join("\n");

  return { instagram, tiktok, whatsapp };
}

export function diaSemanaHoje(d: Date = new Date()): DiaSemana {
  const map: DiaSemana[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[d.getDay()];
}
