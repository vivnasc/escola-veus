import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/aulas/ag-tracks
 *   Lista ficheiros audio do album Ancient Ground em Supabase:
 *   course-assets/audios/albums/ancient-ground/*.mp3
 *
 *   Retorna: { files: [{ name, url, size, created_at }] }
 *   A UI usa isto para o picker de faixa (com botao play).
 */

const BUCKET = "course-assets";
const FOLDER = "audios/albums/ancient-ground";

export async function GET(_req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(FOLDER, { limit: 300, sortBy: { column: "name", order: "asc" } });

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  const files = (data ?? [])
    .filter((f) => f.name && !f.name.startsWith(".") && /\.(mp3|wav|m4a|flac)$/i.test(f.name))
    .map((f) => ({
      name: f.name,
      size: f.metadata?.size ?? null,
      created_at: f.created_at,
      url: `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${FOLDER}/${f.name}`,
    }));

  return NextResponse.json({ folder: FOLDER, count: files.length, files });
}
