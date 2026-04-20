import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
// Accepts up to a 1h 1080p MP4 (~1GB). Bound by Vercel's function payload cap;
// large files go through direct-to-Supabase from the browser if needed.
export const maxDuration = 300;

/**
 * POST /api/admin/youtube/upload-mp4
 *
 * Multipart form:
 * - file: MP4 blob
 * - title: string (used to slug the filename)
 * - thumbnailUrl?: string (http or data: URL)
 * - seo?: JSON-stringified SeoMeta
 */
export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado." }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const title = (form.get("title") || "youtube").toString();
  const thumbnailUrl = form.get("thumbnailUrl")?.toString();
  const seoRaw = form.get("seo")?.toString();

  if (!(file instanceof Blob)) {
    return NextResponse.json({ erro: "file obrigatorio (multipart)." }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);
  const stamp = Date.now();

  const videoPath = `youtube/videos/${slug}-${stamp}.mp4`;
  const videoBuffer = new Uint8Array(await file.arrayBuffer());
  const { error: videoErr } = await supabase.storage
    .from("course-assets")
    .upload(videoPath, videoBuffer, { contentType: "video/mp4", upsert: true });
  if (videoErr) return NextResponse.json({ erro: `Upload MP4: ${videoErr.message}` }, { status: 500 });
  const publicVideoUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${videoPath}`;

  // Thumbnail companion.
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

  // SEO sidecar.
  let publicSeoUrl: string | null = null;
  if (seoRaw) {
    try {
      const seoPath = `youtube/videos/${slug}-${stamp}-seo.json`;
      const seoBuffer = new Uint8Array(Buffer.from(seoRaw, "utf-8"));
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
    filename: `${slug}-${stamp}.mp4`,
  });
}
