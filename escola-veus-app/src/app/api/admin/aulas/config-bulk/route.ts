import { NextRequest, NextResponse } from "next/server";
import type { LessonConfig } from "@/lib/course-slides";
import { getCourseBySlug } from "@/data/courses";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/aulas/config-bulk?slug=ouro-proprio
 *
 * Devolve, num único pedido, os overrides de todas as sub-aulas do curso.
 * Usado pela página de edição global (/admin/producao/aulas/editar/<slug>)
 * para evitar 24 fetches paralelos.
 */

const BUCKET = "course-assets";

type Entry = {
  module: number;
  sub: string;
  config: LessonConfig;
};

function configPath(slug: string, moduleNum: number, subLetter: string) {
  return `admin/aulas-config/${slug}/m${moduleNum}-${subLetter.toLowerCase()}.json`;
}

function supabaseClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest) {
  const slug = (req.nextUrl.searchParams.get("slug") ?? "").trim();
  if (!slug) {
    return NextResponse.json({ erro: "Param slug obrigatório" }, { status: 400 });
  }

  const course = getCourseBySlug(slug);
  if (!course) {
    return NextResponse.json({ erro: "Curso não encontrado" }, { status: 404 });
  }

  // Lista de coordenadas a tentar carregar
  const coords: Array<{ module: number; sub: string }> = [];
  for (const mod of course.modules) {
    for (const sl of mod.subLessons) {
      coords.push({ module: mod.number, sub: sl.letter.toLowerCase() });
    }
  }

  const supabase = supabaseClient();
  if (!supabase) {
    // Sem Supabase: devolve overrides vazios (UI vai cair para script base).
    return NextResponse.json({
      slug,
      entries: coords.map((c) => ({ ...c, config: {} as LessonConfig })),
    });
  }

  // Faz download em paralelo. Cada falha (ex: nunca houve override) cai em
  // config = {}.
  const entries: Entry[] = await Promise.all(
    coords.map(async (c) => {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .download(configPath(slug, c.module, c.sub));
      if (error || !data) return { ...c, config: {} as LessonConfig };
      try {
        const text = await data.text();
        const parsed = JSON.parse(text) as LessonConfig;
        return { ...c, config: parsed };
      } catch {
        return { ...c, config: {} as LessonConfig };
      }
    }),
  );

  return NextResponse.json({ slug, entries });
}
