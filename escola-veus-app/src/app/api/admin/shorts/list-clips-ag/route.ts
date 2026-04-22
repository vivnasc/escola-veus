import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/admin/shorts/list-clips-ag
 *
 * Lista todos os clips verticais motion já gerados em `escola-shorts/clips/*.mp4`
 * (bucket onde o `animate-one` grava). Usado pela página AG shorts para
 * reaproveitar clips Runway já pagos, sem pedir novos. Agnóstico de álbum —
 * a mesma biblioteca que Loranne usa para gerar shorts musicais.
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ clips: [] });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const pageSize = 1000;
  // Supabase FileObject usa string | null, não string | undefined.
  const allFiles: { name: string; created_at?: string | null; updated_at?: string | null }[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage
      .from("escola-shorts")
      .list("clips", {
        limit: pageSize,
        offset,
        sortBy: { column: "created_at", order: "desc" },
      });
    if (error || !data || data.length === 0) break;
    allFiles.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  const clips = allFiles
    .filter((f) => f.name.match(/\.mp4$/i))
    .map((f) => ({
      name: f.name.replace(/\.mp4$/, ""),
      url: `${supabaseUrl}/storage/v1/object/public/escola-shorts/clips/${f.name}`,
      createdAt: f.created_at || null,
    }));

  return NextResponse.json({ clips, total: clips.length });
}
