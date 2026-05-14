/**
 * Gera captions prontos para os 3 canais a partir de uma frase + tema.
 *
 * - Instagram: kicker + frase + assinatura + bloco de hashtags (separado para
 *   facilitar copy/paste e baixar ranking de spam).
 * - TikTok: 1 linha kicker + frase, hashtags fyp + tema na mesma linha.
 * - WhatsApp Status: minimalista. Kicker + frase + assinatura curta.
 */

const HASHTAGS_BASE = [
  "viviannedossantos",
  "seteveus",
  "escoladosveus",
  "manhãs",
  "despertar",
  "consciencia",
  "espiritualidade",
  "pt",
  "portugal",
];

const HASHTAGS_POR_TEMA: Record<string, string[]> = {
  "autoconhecimento": ["autoconhecimento", "selfknowledge", "introspeccao"],
  "autoamor": ["autoamor", "amorproprio", "selflove"],
  "autoperdao": ["autoperdao", "liberta", "recomeço"],
  "florescer-no-tempo-certo": ["florescer", "lotusflower", "lotus", "paciencia"],
  "presenca-leve": ["presenca", "mindfulness", "aquiagora"],
  "suavidade-e-descanso": ["suavidade", "descanso", "equilibrio"],
  "sonhar-com-raizes": ["sonhar", "manifestar", "raizes"],
  "inteireza": ["inteireza", "integridade", "unidade"],
  "corpo-como-casa": ["corpo", "respiracao", "embodiment"],
  "confianca-no-caminho": ["confianca", "fé", "fluir"],
  "gratidao": ["gratidao", "gratitude", "abundancia"],
  "alegria-simples": ["alegria", "alegriasimples", "pequenasalegrias"],
  "beleza-de-existir": ["beleza", "poesiadavida", "manhã"],
};

const HASHTAGS_TIKTOK_EXTRA = ["fyp", "foryou", "fypシ"];

export type CaptionSet = {
  instagram: string;
  tiktok: string;
  whatsapp: string;
};

function tagsFor(theme: string): string[] {
  return HASHTAGS_POR_TEMA[theme] ?? [];
}

function hashesJoined(tags: string[]): string {
  return tags.map((t) => `#${t}`).join(" ");
}

export function phraseToCaptions(opts: {
  phrase: string;
  theme: string;
}): CaptionSet {
  const themeTags = tagsFor(opts.theme);
  const allTags = [...themeTags, ...HASHTAGS_BASE];

  const instagram = [
    "Sabias que...",
    "",
    opts.phrase,
    "",
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
    ...themeTags,
    "viviannedossantos",
    "seteveus",
    "manhãs",
    "pt",
  ];
  const tiktok = [
    `Sabias que... ${opts.phrase}`,
    "",
    hashesJoined(tiktokTags),
  ].join("\n");

  const whatsapp = [
    "Sabias que...",
    "",
    opts.phrase,
    "",
    "Vivianne · seteveus.space",
  ].join("\n");

  return { instagram, tiktok, whatsapp };
}
