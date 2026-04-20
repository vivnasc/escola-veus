import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Always fetch fresh from Supabase.
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function listAll(
  supabase: SupabaseClient,
  path: string,
): Promise<{ name: string }[]> {
  const pageSize = 1000;
  const out: { name: string }[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .list(path, { limit: pageSize, offset, sortBy: { column: "name", order: "asc" } });
    if (error || !data || data.length === 0) break;
    out.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  return out;
}

/**
 * GET /api/admin/thinkdiffusion/list-images
 *
 * Lists all uploaded images from Supabase youtube/images/ folders.
 * Uses service role key (server-side only). Pages through all results.
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ images: [] });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const found: Array<{ name: string; url: string; promptId: string }> = [];

  const folders = await listAll(supabase, "youtube/images");

  for (const folder of folders) {
    if (!folder.name || folder.name.includes(".")) continue;

    for (const orient of ["horizontal", "vertical"]) {
      const path = `youtube/images/${folder.name}/${orient}`;
      const files = await listAll(supabase, path);

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
