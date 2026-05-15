import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

/**
 * GET /api/admin/hoje-em-mim/audios
 *
 * Lista áudios SFX já gerados em
 * course-assets/hoje-em-mim-audios/<mood>/, agrupados por mood, mais
 * recentes em cima. Usado nos seletors per-item da grelha de renders.
 *
 * Returns: { audiosByMood: Record<string, Array<{ name, url, sizeBytes }>> }
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Lista as pastas de mood
  const { data: moods, error: mErr } = await supabase.storage
    .from("course-assets")
    .list("hoje-em-mim-audios", { limit: 50 });

  if (mErr) {
    return NextResponse.json({ erro: mErr.message }, { status: 500 });
  }

  const audiosByMood: Record<string, Array<{ name: string; url: string; sizeBytes: number; createdAt: string | null }>> = {};

  for (const moodFolder of moods || []) {
    if (!moodFolder.name) continue;
    const { data: files } = await supabase.storage
      .from("course-assets")
      .list(`hoje-em-mim-audios/${moodFolder.name}`, {
        limit: 50,
        sortBy: { column: "created_at", order: "desc" },
      });
    if (!files) continue;
    audiosByMood[moodFolder.name] = files
      // Filtra: só .mp3 com tamanho razoável (>5KB). Menos do que isso
      // é certeza de MP3 corrupto (falha ElevenLabs).
      .filter((f) => {
        if (!f.name?.endsWith(".mp3")) return false;
        const size = f.metadata?.size ?? 0;
        return size > 5 * 1024;
      })
      .map((f) => ({
        name: f.name,
        url: `${supabaseUrl}/storage/v1/object/public/course-assets/hoje-em-mim-audios/${moodFolder.name}/${f.name}`,
        sizeBytes: f.metadata?.size ?? 0,
        createdAt: f.created_at ?? null,
      }));
  }

  return NextResponse.json({ audiosByMood });
}
