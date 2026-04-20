import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
// Downloading a 1h MP4 from Shotstack then uploading to Supabase can take a
// minute or two but is bounded — well under 5min.
export const maxDuration = 300;

/**
 * POST /api/admin/youtube/render-save
 *
 * Downloads a finished Shotstack MP4 and uploads it to Supabase
 * (course-assets/youtube/videos/) together with optional thumbnail and SEO
 * sidecar JSON. Designed to be called by the client after status=done.
 *
 * Body: {
 *   shotstackUrl: string,           // final MP4 URL from render-status
 *   title: string,                  // used to slug the filename
 *   thumbnailUrl?: string,          // http(s) URL or data:image/...;base64,...
 *   seo?: { postTitle, description, hashtags, thumbnailTitle }
 * }
 *
 * Returns: { videoUrl, thumbnailUrl, seoUrl }
 */
export async function POST(req: NextRequest) {
  const { shotstackUrl, title, thumbnailUrl, seo } = await req.json();

  if (!shotstackUrl) return NextResponse.json({ erro: "shotstackUrl obrigatorio." }, { status: 400 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado." }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const slug = (title || "youtube").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
  const stamp = Date.now();

  // 1) Video.
  const videoRes = await fetch(shotstackUrl);
  if (!videoRes.ok) return NextResponse.json({ erro: `Shotstack download HTTP ${videoRes.status}.` }, { status: 502 });
  const videoBuffer = new Uint8Array(await videoRes.arrayBuffer());
  const videoPath = `youtube/videos/${slug}-${stamp}.mp4`;
  const { error: videoErr } = await supabase.storage
    .from("course-assets")
    .upload(videoPath, videoBuffer, { contentType: "video/mp4", upsert: true });
  if (videoErr) return NextResponse.json({ erro: `Supabase upload: ${videoErr.message}` }, { status: 500 });
  const publicVideoUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${videoPath}`;

  // 2) Thumbnail (optional — composed data: URL or external URL).
  let publicThumbnailUrl: string | null = null;
  if (thumbnailUrl) {
    try {
      let thumbBuffer: Uint8Array | null = null;
      let contentType = "image/jpeg";
      let safeExt = "jpg";
      if (thumbnailUrl.startsWith("data:")) {
        const match = thumbnailUrl.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          contentType = match[1];
          safeExt = contentType.split("/")[1] || "png";
          thumbBuffer = new Uint8Array(Buffer.from(match[2], "base64"));
        }
      } else {
        const tRes = await fetch(thumbnailUrl);
        if (tRes.ok) {
          const ext = (thumbnailUrl.split("?")[0].split(".").pop() || "jpg").toLowerCase();
          safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
          contentType = tRes.headers.get("content-type") || `image/${safeExt}`;
          thumbBuffer = new Uint8Array(await tRes.arrayBuffer());
        }
      }
      if (thumbBuffer) {
        const thumbPath = `youtube/videos/${slug}-${stamp}-thumb.${safeExt}`;
        await supabase.storage
          .from("course-assets")
          .upload(thumbPath, thumbBuffer, { contentType, upsert: true });
        publicThumbnailUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${thumbPath}`;
      }
    } catch { /* optional */ }
  }

  // 3) SEO sidecar (optional).
  let publicSeoUrl: string | null = null;
  if (seo && (seo.postTitle || seo.description)) {
    try {
      const seoPath = `youtube/videos/${slug}-${stamp}-seo.json`;
      const seoBuffer = new Uint8Array(Buffer.from(JSON.stringify(seo, null, 2), "utf-8"));
      await supabase.storage
        .from("course-assets")
        .upload(seoPath, seoBuffer, { contentType: "application/json", upsert: true });
      publicSeoUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${seoPath}`;
    } catch { /* optional */ }
  }

  return NextResponse.json({
    videoUrl: publicVideoUrl,
    thumbnailUrl: publicThumbnailUrl,
    seoUrl: publicSeoUrl,
  });
}
