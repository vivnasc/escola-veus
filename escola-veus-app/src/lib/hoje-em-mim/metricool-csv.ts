/**
 * Metricool CSV builder para o pack mensal "Hoje, em Mim".
 *
 * Cada vídeo do pack gera 2 linhas no CSV (Instagram REEL e TikTok)
 * agendadas para 19h de cada dia (a melhor hora de noite para esta
 * produção contemplativa).
 *
 * YouTube Shorts foi retirado por decisão editorial: a produção não
 * publica neste canal.
 */

import { CSV_HEADER, csvEscape } from "@/lib/weekly-social/metricool-csv";

export type HemPost = {
  date: string;     // YYYY-MM-DD
  time?: string;    // HH:MM, default "19:00"
  videoUrl: string; // URL pública do MP4 1080x1920
  captions: {
    instagram: string;
    tiktok: string;
    whatsapp: string;
  };
  fraseTexto?: string; // usado como título TikTok
};

const DEFAULT_TIME = "19:00";

function buildRow(
  post: HemPost,
  kind: "instagram" | "tiktok"
): string {
  const row = new Array<string>(CSV_HEADER.length).fill("");
  const set = (name: typeof CSV_HEADER[number], value: string) => {
    const idx = CSV_HEADER.indexOf(name);
    if (idx >= 0) row[idx] = value;
  };

  const time = post.time || DEFAULT_TIME;
  set("Date", post.date);
  set("Time", /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : time);
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

  set("Picture Url 1", post.videoUrl);

  if (kind === "instagram") {
    set("Text", post.captions.instagram);
    set("Instagram Post Type", "REEL");
    set("Instagram Show Reel On Feed", "TRUE");
  } else {
    set("Text", post.captions.tiktok);
    if (post.fraseTexto) set("TikTok Title", post.fraseTexto.slice(0, 80));
    set("TikTok Post Privacy", "PUBLIC_TO_EVERYONE");
    set("TikTok Auto Add Music", "FALSE");
    set("TikTok is AI generated content", "FALSE");
  }

  return row.map(csvEscape).join(",");
}

export function buildHemCsv(posts: HemPost[]): string {
  const lines = [CSV_HEADER.map(csvEscape).join(",")];
  for (const p of posts) {
    if (!p.videoUrl) continue;
    lines.push(buildRow(p, "instagram"));
    lines.push(buildRow(p, "tiktok"));
  }
  return lines.join("\r\n") + "\r\n";
}
