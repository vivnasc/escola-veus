import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Always fetch fresh list from Supabase — never cache this response.
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/admin/thinkdiffusion/list-clips
 *
 * Lists all clips from Supabase youtube/clips/.
 * Pages through Supabase storage to avoid the default 100-item cap.
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ clips: [] });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Page through all files (Supabase Storage may cap a single list() at ~100-1000).
  const pageSize = 1000;
  const allFiles: { name: string }[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .list("youtube/clips", {
        limit: pageSize,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
    if (error || !data || data.length === 0) break;
    allFiles.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  const clips = allFiles
    .filter((f) => f.name.match(/\.(mp4)$/i))
    .map((f) => {
      const baseName = f.name.replace(/\.mp4$/, "");
      return {
        name: baseName,
        url: `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/clips/${f.name}?t=${Date.now()}`,
      };
    });

  return NextResponse.json({ clips, total: clips.length, rawTotal: allFiles.length });
}
