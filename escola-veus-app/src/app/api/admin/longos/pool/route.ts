import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import funilSeed from "@/data/funil-prompts.seed.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

/**
 * GET /api/admin/longos/pool
 *
 * Lista clips reutilizáveis para os longos a partir de DUAS fontes:
 *  1. longos-clips/<slug>/*.mp4 — clips MJ Video uploaded em longos anteriores
 *  2. youtube/clips/nomear-*.mp4 — clips Runway dos shorts/funis Nomear
 *
 * Para cada, devolve URL + metadata (mood, scene, source). User pode
 * reaproveitar visualmente em vez de upload novo MJ Video.
 *
 * Returns: { clips: [{ clipId, clipUrl, source, episode, mood, prompt, sourceLabel }] }
 */

type ImgPrompt = {
  id: string;
  category: string;
  mood: string[];
  prompt: string;
};

const SEED_PROMPTS = (funilSeed.prompts as ImgPrompt[]) ?? [];

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// "longo-<slug>-NN-cena" → "longo-<slug>"; "nomear-ep01-01" → "nomear-ep01"
function parentFromClipId(id: string): string {
  const parts = id.split("-");
  if (parts[0] === "nomear") return parts.slice(0, 2).join("-");
  return parts.slice(0, -1).join("-") || id;
}

export async function GET() {
  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // Index dos prompts seed por id (para metadata dos nomear-*)
  const imgById = new Map<string, ImgPrompt>();
  for (const p of SEED_PROMPTS) imgById.set(p.id, p);

  type Clip = {
    clipId: string;
    clipUrl: string;
    source: "longo" | "nomear";
    episode: string; // longo-slug ou nomear-epNN
    mood: string[];
    prompt: string | null;
    sourceLabel: string;
  };
  const clips: Clip[] = [];

  // ── 1. Longos clips ────────────────────────────────────────────────
  // longos-clips/<slug>/<promptId>.mp4 (recursivo: list slug folders, depois files)
  try {
    const { data: slugDirs } = await supabase.storage
      .from("course-assets")
      .list("longos-clips", { limit: 200 });
    if (Array.isArray(slugDirs)) {
      for (const dir of slugDirs) {
        if (!dir.name) continue;
        const { data: files } = await supabase.storage
          .from("course-assets")
          .list(`longos-clips/${dir.name}`, { limit: 500 });
        if (!Array.isArray(files)) continue;

        // Tenta obter metadata do projecto longo (mood/prompt das cenas)
        let projPrompts: Map<string, { mood: string[]; prompt: string }> = new Map();
        try {
          const { data: projData } = await supabase.storage
            .from("course-assets")
            .download(`admin/longos/${dir.name}.json`);
          if (projData) {
            const proj = JSON.parse(await projData.text());
            for (const p of proj.prompts ?? []) {
              if (p?.id) {
                projPrompts.set(p.id, {
                  mood: Array.isArray(p.mood) ? p.mood : [],
                  prompt: p.prompt ?? "",
                });
              }
            }
          }
        } catch {
          /* projecto pode não existir */
        }

        for (const f of files) {
          if (!/\.mp4$/i.test(f.name)) continue;
          const promptId = f.name.replace(/\.mp4$/i, "");
          const meta = projPrompts.get(promptId);
          clips.push({
            clipId: promptId,
            clipUrl: `${supabaseUrl}/storage/v1/object/public/course-assets/longos-clips/${dir.name}/${f.name}`,
            source: "longo",
            episode: dir.name,
            mood: meta?.mood ?? [],
            prompt: meta?.prompt ?? null,
            sourceLabel: `longo · ${dir.name}`,
          });
        }
      }
    }
  } catch {
    /* ignore */
  }

  // ── 2. Nomear (funil) clips ───────────────────────────────────────
  // youtube/clips/nomear-*.mp4 (com possíveis sufixos de variação -h-NN)
  try {
    const { data: files } = await supabase.storage
      .from("course-assets")
      .list("youtube/clips", { limit: 1000 });
    if (Array.isArray(files)) {
      // Dedupe variações: agrupa por base prompt id (strip -h-NN/-v-NN)
      const byBase = new Map<string, { name: string; variants: string[] }>();
      for (const f of files) {
        if (!/\.mp4$/i.test(f.name)) continue;
        if (!f.name.startsWith("nomear-")) continue;
        const base = f.name
          .replace(/\.mp4$/i, "")
          .replace(/-[hv]-\d+$/i, "");
        const e = byBase.get(base);
        if (!e) {
          byBase.set(base, { name: f.name, variants: [f.name] });
        } else {
          e.variants.push(f.name);
          if (/-h-01\.mp4$/i.test(f.name)) e.name = f.name;
        }
      }
      for (const [base, { name }] of byBase) {
        const meta = imgById.get(base);
        const ep = parentFromClipId(base);
        clips.push({
          clipId: base,
          clipUrl: `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/clips/${name}`,
          source: "nomear",
          episode: ep,
          mood: meta?.mood ?? [],
          prompt: meta?.prompt ?? null,
          sourceLabel: `funil · ${ep}`,
        });
      }
    }
  } catch {
    /* ignore */
  }

  return NextResponse.json({
    clips,
    total: clips.length,
    sources: {
      longo: clips.filter((c) => c.source === "longo").length,
      nomear: clips.filter((c) => c.source === "nomear").length,
    },
  });
}
