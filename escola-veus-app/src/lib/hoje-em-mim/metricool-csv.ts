/**
 * Metricool CSV builder para o pack mensal "Hoje, em Mim".
 *
 * Cada vídeo do pack gera 3 linhas no CSV (Instagram REEL, TikTok video,
 * YouTube Shorts) agendadas para 19h de cada dia (a melhor hora de noite
 * para esta produção contemplativa).
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
  fraseTexto?: string; // usado como título TikTok / YT
};

const DEFAULT_TIME = "19:00";

function buildRow(
  post: HemPost,
  kind: "instagram" | "tiktok" | "youtube"
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
  set("Youtube", kind === "youtube" ? "TRUE" : "FALSE");
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
  } else if (kind === "tiktok") {
    set("Text", post.captions.tiktok);
    if (post.fraseTexto) set("TikTok Title", post.fraseTexto.slice(0, 80));
    set("TikTok Post Privacy", "PUBLIC_TO_EVERYONE");
    set("TikTok Auto Add Music", "FALSE");
    set("TikTok is AI generated content", "FALSE");
  } else {
    // YouTube Shorts: usa whatsapp caption (minimalista) como descrição
    // porque o conteúdo é o mesmo e WA é o tom mais curto.
    set("Text", post.captions.whatsapp);
    set("Youtube Video Title", post.fraseTexto?.slice(0, 90) || "Hoje, em Mim");
    set("Youtube Video Type", "SHORTS");
    set("Youtube Video Privacy", "PUBLIC");
    set("Youtube video for kids", "FALSE");
  }

  return row.map(csvEscape).join(",");
}

export function buildHemCsv(
  posts: HemPost[],
  opts?: { includeYoutube?: boolean }
): string {
  const includeYt = opts?.includeYoutube !== false;
  const lines = [CSV_HEADER.map(csvEscape).join(",")];
  for (const p of posts) {
    if (!p.videoUrl) continue;
    lines.push(buildRow(p, "instagram"));
    lines.push(buildRow(p, "tiktok"));
    if (includeYt) lines.push(buildRow(p, "youtube"));
  }
  return lines.join("\r\n") + "\r\n";
}
