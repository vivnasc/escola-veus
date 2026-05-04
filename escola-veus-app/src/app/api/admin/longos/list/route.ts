import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/admin/longos/list
 *
 * Lista todos os projectos long-form em Supabase admin/longos/.
 * Devolve metadata só (título, slug, contagens) — para listar na página.
 * O carregamento completo dum projecto faz-se em /load?slug=...
 */

const DIR = "admin/longos";

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

type LongoProject = {
  slug?: string;
  titulo?: string;
  tema?: string;
  duracaoAlvo?: number;
  promptCount?: number;
  wordCount?: number;
  createdAt?: string;
  updatedAt?: string;
  narrationUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
};

export async function GET() {
  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }
  try {
    const { data: files } = await supabase.storage
      .from("course-assets")
      .list(DIR, { limit: 200 });
    if (!Array.isArray(files)) return NextResponse.json({ projects: [] });
    const projects = [];
    for (const f of files) {
      if (!f.name.endsWith(".json")) continue;
      try {
        const { data: body } = await supabase.storage
          .from("course-assets")
          .download(`${DIR}/${f.name}`);
        if (!body) continue;
        const parsed = JSON.parse(await body.text()) as LongoProject;
        projects.push({
          slug: parsed.slug ?? f.name.replace(/\.json$/, ""),
          titulo: parsed.titulo ?? "",
          tema: parsed.tema ?? "",
          duracaoAlvo: parsed.duracaoAlvo ?? null,
          promptCount: parsed.promptCount ?? 0,
          wordCount: parsed.wordCount ?? 0,
          createdAt: parsed.createdAt ?? null,
          updatedAt: parsed.updatedAt ?? null,
          hasNarration: !!parsed.narrationUrl,
          hasVideo: !!parsed.videoUrl,
          hasThumbnail: !!parsed.thumbnailUrl,
        });
      } catch {
        /* skip malformed */
      }
    }
    // ordenar mais recente primeiro
    projects.sort((a, b) =>
      (b.updatedAt ?? b.createdAt ?? "").localeCompare(a.updatedAt ?? a.createdAt ?? ""),
    );
    return NextResponse.json({ projects });
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
