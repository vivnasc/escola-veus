/**
 * Metricool CSV builder para VC Sabia (so Instagram Reel + TikTok).
 * Header de 93 colunas confirmado pela utilizadora (mesmo do Loranne/AG).
 * 1 linha por (post x plataforma).
 */

const CSV_HEADER = [
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

export type VcSabiaCsvPost = {
  date: string; // "YYYY-MM-DD"
  videoUrl: string;
  captionInstagram: string;
  captionTiktok: string;
  /** HH:MM local time Maputo */
  timeInstagram?: string;
  /** HH:MM local time Maputo */
  timeTiktok?: string;
};

function csvEscape(v: string | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function buildRow(post: VcSabiaCsvPost, platform: "instagram" | "tiktok"): string {
  const row = new Array<string>(CSV_HEADER.length).fill("");
  const col = (name: (typeof CSV_HEADER)[number], value: string) => {
    const idx = CSV_HEADER.indexOf(name);
    if (idx >= 0) row[idx] = value;
  };

  const time = platform === "instagram"
    ? (post.timeInstagram || "10:00")
    : (post.timeTiktok || "10:30");
  col("Date", post.date);
  col("Time", /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : time);
  col("Draft", "FALSE");

  col("Instagram", platform === "instagram" ? "TRUE" : "FALSE");
  col("TikTok", platform === "tiktok" ? "TRUE" : "FALSE");
  col("Youtube", "FALSE");
  col("Facebook", "FALSE");
  col("Twitter/X", "FALSE");
  col("LinkedIn", "FALSE");
  col("GBP", "FALSE");
  col("Pinterest", "FALSE");
  col("Threads", "FALSE");
  col("Bluesky", "FALSE");

  col("Picture Url 1", post.videoUrl);

  if (platform === "instagram") {
    col("Text", post.captionInstagram);
    col("Instagram Post Type", "REEL");
    col("Instagram Show Reel On Feed", "TRUE");
  } else {
    col("Text", post.captionTiktok);
    col("TikTok Post Privacy", "PUBLIC_TO_EVERYONE");
    col("TikTok Auto Add Music", "FALSE");
    col("TikTok is AI generated content", "FALSE");
  }

  return row.map(csvEscape).join(",");
}

export function buildVcSabiaCsv(posts: VcSabiaCsvPost[]): string {
  const lines = [CSV_HEADER.map(csvEscape).join(",")];
  for (const post of posts) {
    lines.push(buildRow(post, "instagram"));
    lines.push(buildRow(post, "tiktok"));
  }
  return lines.join("\r\n") + "\r\n";
}
