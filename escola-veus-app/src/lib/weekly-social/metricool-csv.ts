/**
 * Metricool CSV builder — header confirmado pela utilizadora (Maio 2026,
 * Planning > Calendar > Import CSV). 87 colunas, 1 linha por
 * (post × plataforma) para permitir caption + hora distintas por canal.
 */

import type { PlatformCaptions } from "./captions";
import type { ScheduleSlot } from "./schedule";

export const CSV_HEADER = [
  "Text", "Date", "Time", "Draft", "Facebook", "Twitter/X", "LinkedIn", "GBP",
  "Instagram", "Pinterest", "TikTok", "Youtube", "Threads", "Bluesky",
  "Picture Url 1", "Picture Url 2", "Picture Url 3", "Picture Url 4",
  "Picture Url 5", "Picture Url 6", "Picture Url 7", "Picture Url 8",
  "Picture Url 9", "Picture Url 10",
  "Alt text picture 1", "Alt text picture 2", "Alt text picture 3",
  "Alt text picture 4", "Alt text picture 5", "Alt text picture 6",
  "Alt text picture 7", "Alt text picture 8", "Alt text picture 9",
  "Alt text picture 10",
  "Document title", "Shortener", "Video Thumbnail Url", "Video Cover Frame",
  "Twitter/X Can reply", "Twitter/X Type",
  "Twitter/X Poll Duration minutes",
  "Twitter/X Poll Option 1", "Twitter/X Poll Option 2",
  "Twitter/X Poll Option 3", "Twitter/X Poll Option 4",
  "Pinterest Board", "Pinterest Pin Title", "Pinterest Pin Link",
  "Pinterest Pin New Format",
  "Instagram Post Type", "Instagram Show Reel On Feed",
  "Youtube Video Title", "Youtube Video Type", "Youtube Video Privacy",
  "Youtube video for kids", "Youtube Video Category", "Youtube Video Tags",
  "Youtube playlist",
  "GBP Post Type", "Facebook Post Type", "Facebook Title",
  "First Comment Text",
  "TikTok Title", "TikTok disable comments", "TikTok disable duet",
  "TikTok disable stitch", "TikTok Post Privacy", "TikTok Branded Content",
  "TikTok Your Brand", "TikTok Auto Add Music", "TikTok Photo Cover Index",
  "TikTok musicId", "TikTok music title", "TikTok music author",
  "TikTok music previewUrl", "TikTok music thumbnailUrl",
  "TikTok music soundVolume", "TikTok music originalVolume",
  "TikTok music startMillis", "TikTok music endMillis",
  "TikTok is AI generated content",
  "LinkedIn Type", "LinkedIn Poll Question",
  "LinkedIn Poll Option 1", "LinkedIn Poll Option 2",
  "LinkedIn Poll Option 3", "LinkedIn Poll Option 4",
  "LinkedIn Poll Duration", "LinkedIn Show link preview",
  "LinkedIn Images as Carousel",
  "Threads Reply Control", "Threads Is Spoiler", "Threads Post Type",
] as const;

type Platform = "instagram" | "tiktok" | "youtube";
type CsvLineKind =
  | { type: "social"; platform: Platform }            // clip → IG Reel / TikTok / YT Shorts
  | { type: "youtube-canal" };                         // full → YT canal upload (vídeo longo)

export type CsvPost = {
  id: string;
  /** Clip URL — usado nas linhas social (IG/TT/YT Shorts). */
  videoUrl: string | null;
  /** Full URL — usado na linha YT canal. Se null, salta a linha YT canal. */
  fullVideoUrl?: string | null;
  thumbnailUrl: string | null;
  trackTitle?: string;
  captions: PlatformCaptions;
  /** Schedule do clip (social — IG/TT/YT Shorts). */
  schedule: Record<Platform, ScheduleSlot>;
  /** Schedule alternativo do full (AG: Mon/Wed/Fri vs clip Tue/Thu/Sat). Default = schedule. */
  fullSchedule?: Record<Platform, ScheduleSlot>;
};

export function csvEscape(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function buildRow(post: CsvPost, kind: CsvLineKind): string {
  const row = new Array<string>(CSV_HEADER.length).fill("");
  const col = (name: typeof CSV_HEADER[number], value: string) => {
    const idx = CSV_HEADER.indexOf(name);
    if (idx >= 0) row[idx] = value;
  };

  const isYoutubeCanal = kind.type === "youtube-canal";
  const platform: Platform = isYoutubeCanal ? "youtube" : kind.platform;
  // AG full usa fullSchedule (Mon/Wed/Fri) em vez do schedule do clip.
  const slot = isYoutubeCanal && post.fullSchedule
    ? post.fullSchedule[platform]
    : post.schedule[platform];
  col("Date", slot.date);
  col("Time", slot.time);
  col("Draft", "FALSE");

  col("Instagram", platform === "instagram" && !isYoutubeCanal ? "TRUE" : "FALSE");
  col("TikTok", platform === "tiktok" && !isYoutubeCanal ? "TRUE" : "FALSE");
  col("Youtube", platform === "youtube" ? "TRUE" : "FALSE");
  col("Facebook", "FALSE");
  col("Twitter/X", "FALSE");
  col("LinkedIn", "FALSE");
  col("GBP", "FALSE");
  col("Pinterest", "FALSE");
  col("Threads", "FALSE");
  col("Bluesky", "FALSE");

  // YT canal usa o full; resto usa clip.
  const url = isYoutubeCanal ? (post.fullVideoUrl || "") : (post.videoUrl || "");
  col("Picture Url 1", url);
  if (post.thumbnailUrl) col("Video Thumbnail Url", post.thumbnailUrl);

  if (kind.type === "social" && kind.platform === "instagram") {
    col("Text", post.captions.instagram);
    col("Instagram Post Type", "REEL");
    col("Instagram Show Reel On Feed", "TRUE");
  } else if (kind.type === "social" && kind.platform === "tiktok") {
    col("Text", post.captions.tiktok);
    col("TikTok Title", post.trackTitle || "");
    col("TikTok Post Privacy", "PUBLIC_TO_EVERYONE");
    col("TikTok Auto Add Music", "FALSE");
    col("TikTok is AI generated content", "FALSE");
  } else if (kind.type === "social" && kind.platform === "youtube") {
    col("Text", post.captions.youtube.description);
    col("Youtube Video Title", post.captions.youtube.title);
    col("Youtube Video Type", "SHORTS");
    col("Youtube Video Privacy", "PUBLIC");
    col("Youtube video for kids", "FALSE");
  } else if (isYoutubeCanal) {
    col("Text", post.captions.youtube.description);
    col("Youtube Video Title", post.captions.youtube.title);
    col("Youtube Video Type", "VIDEO");
    col("Youtube Video Privacy", "PUBLIC");
    col("Youtube video for kids", "FALSE");
  }

  return row.map(csvEscape).join(",");
}

export function buildCsv(posts: CsvPost[]): string {
  const lines = [CSV_HEADER.map(csvEscape).join(",")];
  for (const post of posts) {
    // 3 linhas social com o clip
    for (const platform of ["instagram", "tiktok", "youtube"] as const) {
      lines.push(buildRow(post, { type: "social", platform }));
    }
    // 1 linha YT canal com o full (se existir)
    if (post.fullVideoUrl) {
      lines.push(buildRow(post, { type: "youtube-canal" }));
    }
  }
  return lines.join("\r\n") + "\r\n";
}
