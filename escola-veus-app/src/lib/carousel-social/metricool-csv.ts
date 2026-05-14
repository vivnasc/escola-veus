/**
 * Metricool CSV builder para carrosséis-vídeo · conta pessoal (IG + TikTok).
 *
 * Cada carrossel é UM MP4 (1080×1920, ~60s, gerado pelo workflow GitHub
 * Actions render-carrossel-veus e armazenado em
 * course-assets/carrossel-veus/<jobId>/videos/dia-N.mp4).
 *
 * Por cada dia geramos 2 linhas CSV:
 *  - Instagram (REEL · 1 vídeo)
 *  - TikTok (vídeo)
 *
 * WhatsApp Status fica de fora, é manual.
 */

import { CSV_HEADER, csvEscape } from "@/lib/weekly-social/metricool-csv";

export type CarouselPost = {
  /** Identificador legível (ex: "dia-1"). */
  id: string;
  /** Data ISO (YYYY-MM-DD) em fuso CAT. */
  date: string;
  /** Hora local "HH:MM". Metricool converte para o fuso da conta. */
  time: string;
  /** URL pública do MP4 (1080×1920). */
  videoUrl: string;
  /** Thumbnail opcional (capa do Reel). */
  thumbnailUrl?: string;
  /** Caption Instagram (com hashtags). */
  instagramCaption: string;
  /** Caption TikTok (mais curta). */
  tiktokCaption: string;
  /** Título opcional do TikTok. */
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

  // O MP4 vai no Picture Url 1 (Metricool aceita vídeo aí para Reels/TikTok).
  set("Picture Url 1", post.videoUrl);
  if (post.thumbnailUrl) set("Video Thumbnail Url", post.thumbnailUrl);

  if (kind === "instagram") {
    set("Text", post.instagramCaption);
    set("Instagram Post Type", "REEL");
    set("Instagram Show Reel On Feed", "TRUE");
  } else {
    set("Text", post.tiktokCaption);
    if (post.tiktokTitle) set("TikTok Title", post.tiktokTitle);
    set("TikTok Post Privacy", "PUBLIC_TO_EVERYONE");
    set("TikTok Auto Add Music", "FALSE");
    set("TikTok is AI generated content", "FALSE");
  }

  return row.map(csvEscape).join(",");
}

export function buildCarouselCsv(posts: CarouselPost[]): string {
  const lines = [CSV_HEADER.map(csvEscape).join(",")];
  for (const post of posts) {
    if (!post.videoUrl) continue;
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
  const fypHashes = ["#fyp", "#foryou"]
    .concat(tagsBase.slice(0, 5).map((t) => `#${t}`))
    .join(" ");

  if (opts.platform === "instagram") {
    return [
      opts.texto,
      "",
      "Vivianne dos Santos",
      "seteveus.space",
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
  return [opts.texto, "", "Vivianne · seteveus.space"].join("\n");
}
