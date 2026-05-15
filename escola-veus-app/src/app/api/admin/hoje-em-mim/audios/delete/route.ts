import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const runtime = "nodejs";

/**
 * POST /api/admin/hoje-em-mim/audios/delete
 *
 * Apaga áudios SFX por path completo (mood/file) ou apaga TUDO o que
 * estiver com tamanho menor do que threshold (cleanup de zero-bytes
 * deixados por falhas do ElevenLabs).
 *
 * Body: { path?: string, cleanInvalid?: boolean, minBytes?: number }
 *
 * Returns: { deleted: number, paths: string[] }
 */
export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  let body: { path?: string; cleanInvalid?: boolean; minBytes?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const minBytes = Number(body.minBytes ?? 1024);

  if (body.cleanInvalid) {
    // Lista todos os moods, todos os mp3, identifica os <minBytes,
    // apaga em batch.
    const { data: moods } = await supabase.storage
      .from("course-assets")
      .list("hoje-em-mim-audios", { limit: 50 });
    const toDelete: string[] = [];
    for (const mood of moods || []) {
      if (!mood.name) continue;
      const { data: files } = await supabase.storage
        .from("course-assets")
        .list(`hoje-em-mim-audios/${mood.name}`, { limit: 100 });
      if (!files) continue;
      for (const f of files) {
        if (!f.name?.endsWith(".mp3")) continue;
        const size = f.metadata?.size ?? 0;
        if (size < minBytes) {
          toDelete.push(`hoje-em-mim-audios/${mood.name}/${f.name}`);
        }
      }
    }
    if (toDelete.length === 0) {
      return NextResponse.json({ deleted: 0, paths: [] });
    }
    const { error } = await supabase.storage
      .from("course-assets")
      .remove(toDelete);
    if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
    return NextResponse.json({ deleted: toDelete.length, paths: toDelete });
  }

  // Modo single delete
  const path = (body.path || "").trim();
  if (!path) {
    return NextResponse.json({ erro: "path em falta" }, { status: 400 });
  }
  if (!path.startsWith("hoje-em-mim-audios/")) {
    return NextResponse.json(
      { erro: "path tem de começar por hoje-em-mim-audios/" },
      { status: 400 }
    );
  }
  const { error } = await supabase.storage
    .from("course-assets")
    .remove([path]);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ deleted: 1, paths: [path] });
}
