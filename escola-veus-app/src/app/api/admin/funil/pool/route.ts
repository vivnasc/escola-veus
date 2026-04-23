import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import funilSeed from "@/data/funil-prompts.seed.json";
import motionSeed from "@/data/runway-motion-prompts.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

/**
 * GET /api/admin/funil/pool
 *
 * Lista a pool de clips Runway já renderizados, com metadata para reciclagem:
 *  - clipId / clipUrl
 *  - imagePrompt, mood, category (de funil-prompts.seed.json)
 *  - motionPrompt (override Supabase > seed)
 *  - episode (derivado do prefixo do id)
 *  - usageCount (quantos outros episódios já reutilizam este clip via reuse map)
 *
 * Serve o navegador de pool em /admin/producao/funil/montar.
 */

type ImgPrompt = {
  id: string;
  category: string;
  mood: string[];
  prompt: string;
};

const SEED_IMAGE_PROMPTS = (funilSeed.prompts as ImgPrompt[]) ?? [];
const SEED_MOTION = motionSeed as Record<string, string>;
const MOTION_OVERRIDE_PATH = "admin/runway-motion-prompts.json";
const REUSE_DIR = "admin/funil-reuses";

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function episodeFromId(id: string): string {
  // "nomear-ep01-01-voz-antiga" -> "ep01"
  // "nomear-trailer-03-..." -> "trailer"
  const parts = id.split("-");
  return parts[1] ?? "";
}

export async function GET() {
  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // 1. Listar todos os clips em youtube/clips/
  const allFiles: { name: string }[] = [];
  let offset = 0;
  const pageSize = 1000;
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

  // 2. Ler motion prompts override (se existir)
  let motionMap: Record<string, string> = { ...SEED_MOTION };
  try {
    const { data } = await supabase.storage
      .from("course-assets")
      .download(MOTION_OVERRIDE_PATH);
    if (data) {
      const parsed = JSON.parse(await data.text()) as Record<string, string>;
      motionMap = { ...motionMap, ...parsed };
    }
  } catch {
    /* ignore, usa seed */
  }

  // 3. Ler TODOS os reuse maps para computar usageCount agregado.
  //    Cada ficheiro admin/funil-reuses/<epKey>.json → { clipOrder: string[] }
  //    Contamos ocorrências de cada clipId em todos os reuse maps EXCEPTO o
  //    episódio "nativo" (um clip do ep03 usado em ep03 não é reutilização).
  const usageCount: Record<string, number> = {};
  try {
    const { data: reuseFiles } = await supabase.storage
      .from("course-assets")
      .list(REUSE_DIR, { limit: 1000 });
    if (Array.isArray(reuseFiles)) {
      for (const f of reuseFiles) {
        if (!f.name.endsWith(".json")) continue;
        const epKey = f.name.replace(/\.json$/, "");
        const { data: body } = await supabase.storage
          .from("course-assets")
          .download(`${REUSE_DIR}/${f.name}`);
        if (!body) continue;
        try {
          const parsed = JSON.parse(await body.text()) as {
            clipOrder?: string[];
          };
          for (const url of parsed.clipOrder ?? []) {
            // Extrair clipId do URL: .../youtube/clips/<id>.mp4?t=...
            const m = url.match(/\/youtube\/clips\/([^?/]+)\.mp4/i);
            if (!m) continue;
            const clipId = m[1];
            // Não conta se o clip é do próprio episódio (é o default).
            if (episodeFromId(clipId) === epKey) continue;
            usageCount[clipId] = (usageCount[clipId] ?? 0) + 1;
          }
        } catch {
          /* ignore malformed */
        }
      }
    }
  } catch {
    /* empty dir / first run */
  }

  // 4. Índice dos image prompts por id
  const imgById = new Map<string, ImgPrompt>();
  for (const p of SEED_IMAGE_PROMPTS) imgById.set(p.id, p);

  // 5. Construir pool — SÓ clips do funil Nomear (nomear-trailer-*, nomear-epNN-*).
  //    O bucket youtube/clips/ é partilhado com outros pipelines (Ancient
  //    Ground: mar-*, praia-*, rio-*, flora-*, fogo-*, savana-*, etc.) —
  //    esses NÃO devem aparecer no browser de reciclagem do funil porque
  //    visualmente destoam da estética editorial escura do Nomear.
  const clips = allFiles
    .filter((f) => /\.mp4$/i.test(f.name))
    .filter((f) => f.name.startsWith("nomear-"))
    .map((f) => {
      const clipId = f.name.replace(/\.mp4$/i, "");
      const img = imgById.get(clipId);
      return {
        clipId,
        clipUrl: `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/clips/${f.name}`,
        episode: episodeFromId(clipId),
        imagePrompt: img?.prompt ?? null,
        mood: img?.mood ?? [],
        category: img?.category ?? null,
        motionPrompt: motionMap[clipId] ?? motionMap._default ?? null,
        usageCount: usageCount[clipId] ?? 0,
      };
    });

  // Ordenar por episode (trailer primeiro, depois ep01.., ep02..) e depois id
  const epOrder = (e: string) =>
    e === "trailer" ? -1 : parseInt(e.replace(/\D/g, ""), 10) || 999;
  clips.sort(
    (a, b) => epOrder(a.episode) - epOrder(b.episode) || a.clipId.localeCompare(b.clipId),
  );

  return NextResponse.json({
    clips,
    total: clips.length,
    episodes: [...new Set(clips.map((c) => c.episode))].sort(
      (a, b) => epOrder(a) - epOrder(b),
    ),
  });
}
