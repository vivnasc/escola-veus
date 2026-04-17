import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/thinkdiffusion/list-clips
 *
 * Lists all clips from Supabase youtube/clips/.
 * Maps clip filenames to image filenames for matching.
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ clips: [] });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: files } = await supabase.storage
    .from("course-assets")
    .list("youtube/clips", { limit: 500 });

  if (!files) return NextResponse.json({ clips: [] });

  const clips = files
    .filter((f) => f.name.match(/\.(mp4)$/i))
    .map((f) => {
      // Clip name: mar-01-golden-hour-h-01.mp4
      // Image name match: mar-01-golden-hour-h-01.png or .jpg
      const baseName = f.name.replace(/\.mp4$/, "");
      return {
        name: baseName,
        url: `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/clips/${f.name}`,
      };
    });

  return NextResponse.json({ clips, total: clips.length });
}
