import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

/**
 * POST /api/admin/audio-bulk/check-existing
 *
 * Lista ficheiros ja existentes numa pasta do Supabase storage e,
 * dado um conjunto de slugs de scripts, diz quais ja foram gerados.
 *
 * Body: { folder, slugs: string[] }
 * Returns: { existing: { [slug]: string (url) } }
 */
export async function POST(req: NextRequest) {
  try {
    const { folder, slugs } = (await req.json()) as { folder?: string; slugs?: string[] };

    if (!folder || !Array.isArray(slugs)) {
      return NextResponse.json({ erro: "folder e slugs obrigatorios" }, { status: 400 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 400 });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Listar ficheiros na pasta (ate 1000)
    const { data: files, error } = await supabase.storage
      .from("course-assets")
      .list(folder, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });

    if (error) {
      return NextResponse.json({ erro: `Supabase list: ${error.message}` }, { status: 500 });
    }

    if (!files) {
      return NextResponse.json({ existing: {} });
    }

    // Cada ficheiro e algo como "slug-1760540123456.mp3"
    // Extrair slug removendo sufixo -{timestamp}.mp3
    const existing: Record<string, string> = {};
    for (const slug of slugs) {
      // Procurar ficheiro cujo name comeca com "{slug}-" e termina em ".mp3"
      const match = files.find((f) => f.name.startsWith(`${slug}-`) && f.name.endsWith(".mp3"));
      if (match) {
        existing[slug] = `${supabaseUrl}/storage/v1/object/public/course-assets/${folder}/${match.name}`;
      }
    }

    return NextResponse.json({ existing, totalFilesInFolder: files.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
