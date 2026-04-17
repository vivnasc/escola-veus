import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/thinkdiffusion/list-images
 *
 * Lists all uploaded images from Supabase youtube/images/ folders.
 * Uses service role key (server-side only).
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ images: [] });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const found: Array<{ name: string; url: string; promptId: string }> = [];

  const { data: folders } = await supabase.storage
    .from("course-assets")
    .list("youtube/images", { limit: 500 });

  if (!folders) return NextResponse.json({ images: [] });

  for (const folder of folders) {
    if (!folder.name || folder.name.includes(".")) continue;

    for (const orient of ["horizontal", "vertical"]) {
      const path = `youtube/images/${folder.name}/${orient}`;
      const { data: files } = await supabase.storage
        .from("course-assets")
        .list(path, { limit: 500 });

      if (!files) continue;

      for (const f of files) {
        if (!f.name.match(/\.(png|jpg|jpeg)$/i)) continue;
        const promptId = f.name.replace(/-[hv]-\d+\.\w+$/, "");
        found.push({
          name: f.name,
          url: `${supabaseUrl}/storage/v1/object/public/course-assets/${path}/${f.name}`,
          promptId,
        });
      }
    }
  }

  return NextResponse.json({ images: found });
}
