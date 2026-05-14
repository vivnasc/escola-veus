/**
 * Metricool CSV builder para carrosséis (conta pessoal · IG + TikTok).
 *
 * Header igual ao usado para Loranne/AG (93 colunas). Cada dia gera 2 linhas:
 *  - Instagram (post type CAROUSEL, até 10 Picture Urls)
 *  - TikTok (carrossel de fotos, mesmas URLs)
 *
 * WhatsApp Status fica de fora — é manual.
 */

import { CSV_HEADER, csvEscape } from "@/lib/weekly-social/metricool-csv";

export type CarouselPost = {
  /** Identificador legível (ex: "dia-1"). */
  id: string;
  /** Data ISO (YYYY-MM-DD) em fuso CAT. */
  date: string;
  /** Hora local "HH:MM" — Metricool converte para o fuso da conta. */
  time: string;
  /** URLs públicas dos slides (1 a 10). 1ª URL é a capa. */
  slideUrls: string[];
  /** Caption Instagram (com hashtags). */
  instagramCaption: string;
  /** Caption TikTok (mais curta). */
  tiktokCaption: string;
  /** Título opcional do carrossel TikTok. */
  tiktokTitle?: string;
};

type RowKind = "instagram" | "tiktok";

function buildRow(post: CarouselPost, kind: RowKind): string {
  const row = new Array<string>(CSV_HEADER.length).fill("");
  const set = (name: typeof CSV_HEADER[number], value: string) => {
    const idx = CSV_HEADER.indexOf(name);
    if (idx >= 0) row[idx] = value;
  };

  set("Date", post.date);
  set(
    "Time",
    /^\d{2}:\d{2}$/.test(post.time) ? `${post.time}:00` : post.time
  );
  set("Draft", "FALSE");

  set("Instagram", kind === "instagram" ? "TRUE" : "FALSE");
  set("TikTok", kind === "tiktok" ? "TRUE" : "FALSE");
  set("Youtube", "FALSE");
  set("Facebook", "FALSE");
  set("Twitter/X", "FALSE");
  set("LinkedIn", "FALSE");
  set("GBP", "FALSE");
  set("Pinterest", "FALSE");
  set("Threads", "FALSE");
  set("Bluesky", "FALSE");

  // 1-10 Picture Urls
  const slides = post.slideUrls.slice(0, 10);
  for (let i = 0; i < slides.length; i++) {
    const colName = `Picture Url ${i + 1}` as typeof CSV_HEADER[number];
    set(colName, slides[i]);
  }

  if (kind === "instagram") {
    set("Text", post.instagramCaption);
    // Carrossel IG (não Reel) — várias imagens
    set("Instagram Post Type", "CAROUSEL");
  } else {
    set("Text", post.tiktokCaption);
    if (post.tiktokTitle) set("TikTok Title", post.tiktokTitle);
    set("TikTok Post Privacy", "PUBLIC_TO_EVERYONE");
    set("TikTok Auto Add Music", "TRUE");
    set("TikTok is AI generated content", "FALSE");
    // Capa = primeiro slide (índice 0)
    set("TikTok Photo Cover Index", "0");
  }

  return row.map(csvEscape).join(",");
}

export function buildCarouselCsv(posts: CarouselPost[]): string {
  const lines = [CSV_HEADER.map(csvEscape).join(",")];
  for (const post of posts) {
    if (post.slideUrls.length === 0) continue;
    lines.push(buildRow(post, "instagram"));
    lines.push(buildRow(post, "tiktok"));
  }
  return lines.join("\r\n") + "\r\n";
}

/** Hashtags base para carrosséis pessoais (Vivianne · Escola dos Veus). */
export const CAROUSEL_HASHTAGS_BASE = [
  "viviannedossantos",
  "seteveus",
  "escoladosveus",
  "carrossel",
  "espiritualidade",
  "despertar",
  "consciencia",
  "pt",
  "portugal",
];

export function buildCarouselCaption(opts: {
  texto: string;
  tema?: string;
  cta?: string;
  platform: "instagram" | "tiktok" | "whatsapp";
}): string {
  const tagsBase = opts.tema
    ? [opts.tema.replace(/[-\s]+/g, "").toLowerCase(), ...CAROUSEL_HASHTAGS_BASE]
    : CAROUSEL_HASHTAGS_BASE;

  const hashes = tagsBase.map((t) => `#${t}`).join(" ");
  const fypHashes = ["#fyp", "#foryou"].concat(tagsBase.slice(0, 5).map((t) => `#${t}`)).join(" ");

  if (opts.platform === "instagram") {
    return [
      opts.texto,
      "",
      "—",
      "Vivianne dos Santos · seteveus.space",
      opts.cta ?? "",
      "",
      ".",
      ".",
      ".",
      "",
      hashes,
    ]
      .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
      .join("\n");
  }

  if (opts.platform === "tiktok") {
    return [opts.texto, "", fypHashes].join("\n");
  }

  // whatsapp
  return [opts.texto, "", "— Vivianne · seteveus.space"].join("\n");
}
