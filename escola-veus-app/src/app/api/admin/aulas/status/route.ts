import { NextResponse } from "next/server";
import { NOMEAR_PRESETS } from "@/data/nomear-scripts";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/aulas/status
 *
 * Estado actual de cada sub-aula dos cursos pagos.
 * Scripts das aulas estão em NOMEAR_PRESETS (presets começam por "curso-").
 *
 * Para cada aula:
 *   - script: true (existe em NOMEAR_PRESETS)
 *   - audio: há MP3 em course-assets/<curso-slug>/ com slug do título
 *   - video: (por enquanto sem render admin; flag ×)
 *
 * Response: { aulas: [{ id, titulo, curso, moduleNum, subLetter, status }, ...] }
 */

function titleToSlug(title: string): string {
  return (title || "audio")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function listAll(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  path: string,
): Promise<string[]> {
  const out: string[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .list(path, { limit: 1000, offset });
    if (error || !data || data.length === 0) break;
    for (const f of data) if (f.name) out.push(f.name);
    if (data.length < 1000) break;
    offset += 1000;
  }
  return out;
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado." }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Find aula scripts (preset ids starting with "curso-")
  type AulaScript = {
    id: string;
    titulo: string;
    curso: string;
    moduleNum: number | null;
    subLetter: string | null;
  };
  const aulas: AulaScript[] = [];
  for (const preset of NOMEAR_PRESETS) {
    if (!preset.id.startsWith("curso-")) continue;
    for (const s of preset.scripts) {
      // Parse M<N>.<LETTER> from title (ex: "M8.A — A pele como casa")
      const m = s.titulo.match(/^M(\d+)\.([A-Z])/);
      aulas.push({
        id: s.id,
        titulo: s.titulo,
        curso: s.curso,
        moduleNum: m ? parseInt(m[1], 10) : null,
        subLetter: m ? m[2] : null,
      });
    }
  }

  // Distinct curso folders to check for audios
  const cursoSlugs = [...new Set(aulas.map((a) => `curso-${a.curso}`))];

  // List files in each curso folder in parallel
  const audioLists = await Promise.all(
    cursoSlugs.map(async (folder) => ({
      folder,
      files: await listAll(supabase, folder),
    })),
  );
  const audiosByFolder = new Map<string, string[]>();
  for (const { folder, files } of audioLists) audiosByFolder.set(folder, files);

  // Compute status per aula
  const result = aulas.map((a) => {
    const folder = `curso-${a.curso}`;
    const slug = titleToSlug(a.titulo);
    const files = audiosByFolder.get(folder) ?? [];
    const hasAudio = files.some(
      (f) => f.endsWith(".mp3") && f.startsWith(`${slug}-`),
    );
    return {
      id: a.id,
      titulo: a.titulo,
      curso: a.curso,
      moduleNum: a.moduleNum,
      subLetter: a.subLetter,
      status: {
        script: true,
        audio: hasAudio,
        video: false, // TODO: quando houver pipeline de render de slides em admin
      },
    };
  });

  return NextResponse.json({ aulas: result });
}
