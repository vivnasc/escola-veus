// Constrói CSV Metricool a partir de uma lista de posts planeados.
//
// Header confirmado pela utilizadora (Maio 2026) — Planning > Calendar > Import CSV.
// Estratégia: 1 linha por (post × plataforma), permite caption + hora distinta.

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
];

export function csvEscape(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/**
 * Constrói uma linha CSV para 1 (post × plataforma).
 *
 * post: {
 *   date, time, videoUrl, thumbnailUrl, captions: { instagram, tiktok, youtube: {title, description} },
 *   trackTitle?, albumTitle?, brandSlug
 * }
 * platform: "instagram" | "tiktok" | "youtube"
 */
export function buildRow(post, platform) {
  const row = new Array(CSV_HEADER.length).fill("");
  const col = (name, value) => {
    const idx = CSV_HEADER.indexOf(name);
    if (idx >= 0) row[idx] = value ?? "";
  };

  col("Date", post.date);
  col("Time", post.time);
  col("Draft", "FALSE");

  // Plataforma flags
  col("Instagram", platform === "instagram" ? "TRUE" : "FALSE");
  col("TikTok", platform === "tiktok" ? "TRUE" : "FALSE");
  col("Youtube", platform === "youtube" ? "TRUE" : "FALSE");
  col("Facebook", "FALSE");
  col("Twitter/X", "FALSE");
  col("LinkedIn", "FALSE");
  col("GBP", "FALSE");
  col("Pinterest", "FALSE");
  col("Threads", "FALSE");
  col("Bluesky", "FALSE");

  // Vídeo
  col("Picture Url 1", post.videoUrl || "");
  if (post.thumbnailUrl) col("Video Thumbnail Url", post.thumbnailUrl);

  if (platform === "instagram") {
    col("Text", post.captions.instagram);
    col("Instagram Post Type", "REEL");
    col("Instagram Show Reel On Feed", "TRUE");
  } else if (platform === "tiktok") {
    col("Text", post.captions.tiktok);
    col("TikTok Title", post.trackTitle || "");
    col("TikTok Post Privacy", "PUBLIC_TO_EVERYONE");
    col("TikTok Auto Add Music", "FALSE");
    col("TikTok is AI generated content", "FALSE");
  } else if (platform === "youtube") {
    col("Text", post.captions.youtube.description);
    col("Youtube Video Title", post.captions.youtube.title);
    col("Youtube Video Type", "SHORTS");
    col("Youtube Video Privacy", "PUBLIC");
    col("Youtube video for kids", "FALSE");
  }

  return row.map(csvEscape).join(",");
}

export function buildCsv(posts) {
  const lines = [CSV_HEADER.map(csvEscape).join(",")];
  for (const post of posts) {
    for (const platform of ["instagram", "tiktok", "youtube"]) {
      lines.push(buildRow(post, platform));
    }
  }
  return lines.join("\r\n") + "\r\n";
}

/**
 * Divide um CSV em chunks de N posts (por causa do limite de 50 do Metricool).
 * Cada chunk = N posts × 3 plataformas = ≤50 linhas (default chunkPosts=15).
 */
export function chunkCsvs(posts, chunkPosts = 15) {
  const chunks = [];
  for (let i = 0; i < posts.length; i += chunkPosts) {
    chunks.push(buildCsv(posts.slice(i, i + chunkPosts)));
  }
  return chunks;
}
