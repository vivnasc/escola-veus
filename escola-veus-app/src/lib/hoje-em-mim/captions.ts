/**
 * Captions para "Hoje, em Mim" — post de fecho do dia, conta pessoal.
 *
 * Estrutura editorial: rotação por dia da semana (7 formatos).
 * Cada dia tem um kicker próprio que ancora o ritual:
 *  Seg pergunta · Ter gratidão · Qua soltar · Qui aprender ·
 *  Sex celebrar · Sáb corpo · Dom intenção.
 *
 * Captions são gerados para IG/TikTok (Metricool) e WhatsApp Status (manual).
 */

export type DiaSemana = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const KICKER_POR_DIA: Record<DiaSemana, string> = {
  mon: "Pergunta-te hoje —",
  tue: "Hoje agradeço —",
  wed: "Solto hoje —",
  thu: "Hoje aprendi —",
  fri: "Celebro hoje —",
  sat: "Hoje, no corpo —",
  sun: "Amanhã, escolho —",
};

export const LABEL_POR_DIA: Record<DiaSemana, string> = {
  mon: "Pergunta de introspeção",
  tue: "Gratidão",
  wed: "Soltar",
  thu: "O que aprendi",
  fri: "Celebrar o caminho",
  sat: "Ritual do corpo",
  sun: "Intenção para amanhã",
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
  mon: ["pergunta", "autoconhecimento", "questionate"],
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
    "—",
    "Vivianne dos Santos · seteveus.space",
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
  const tiktok = [`${kicker} ${opts.phrase}`, "", hashesJoined(tiktokTags)].join(
    "\n"
  );

  const whatsapp = [
    kicker,
    "",
    opts.phrase,
    "",
    "— Vivianne · seteveus.space",
  ].join("\n");

  return { instagram, tiktok, whatsapp };
}

export function diaSemanaHoje(d: Date = new Date()): DiaSemana {
  const map: DiaSemana[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[d.getDay()];
}
