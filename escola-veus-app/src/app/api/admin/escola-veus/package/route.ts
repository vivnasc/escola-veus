/**
 * GET /api/admin/escola-veus/package
 *
 * Gera um CSV Metricool para o workspace Escola dos Véus contendo os 3
 * vídeos da semana: ep3, ep4 (Reels — IG/TT/YT-Shorts) + longo de domingo
 * (YT canal — VIDEO).
 *
 * Inputs (query params): datas e horas no formato YYYY-MM-DD / HH:MM.
 *   ep3Date, ep3Time
 *   ep4Date, ep4Time
 *   longoDate, longoTime
 *
 * URLs e captions: derivadas dos scripts NOMEAR_PRESETS (eps) e do
 * projecto Supabase admin/longos/{slug}.json (longo).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { NOMEAR_PRESETS } from "@/data/nomear-scripts";
import { YOUTUBE_TAGS, YOUTUBE_DESCRIPTION_TEMPLATE } from "@/data/youtube-calendar";
import { buildCsv, type CsvPost } from "@/lib/weekly-social/metricool-csv";
import type { PlatformCaptions } from "@/lib/weekly-social/captions";

export const dynamic = "force-dynamic";

const TIMEZONE = "Africa/Maputo";

// URLs explícitas dos 3 vídeos desta semana (Mai 2026 W20). Re-gera o
// endpoint com novos URLs quando trocares de vídeos.
const VIDEOS = {
  ep3: "https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/course-assets/youtube/funil-videos/ep03-a-vergonha-que-inventa-desculpas-1777037527872.mp4",
  ep4: "https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/course-assets/youtube/funil-videos/ep04-o-desconto-que-deste-sem-ninguem-pedir-1778499889451.mp4",
  longo: "https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/course-assets/longos-videos/peso-de-quem-veio-antes-1778494247912.mp4",
} as const;

const LONGO_SLUG = "peso-de-quem-veio-antes";

// Hashtags Escola dos Véus — manter consistentes entre IG/TT/YT.
const HASHTAGS_SOCIAL = "#EscolaDosVeus #Autoconhecimento #DesenvolvimentoPessoal #Corpo #Emocoes #Mulheres #SeteVeus #Vergonha #Dinheiro";
const HASHTAGS_YT = YOUTUBE_TAGS.join(", ");

function findEp(id: string): { titulo: string; texto: string } | null {
  for (const preset of NOMEAR_PRESETS) {
    const hit = preset.scripts.find((s) => s.id === id) as
      | { titulo?: string; texto?: string }
      | undefined;
    if (hit?.titulo && hit?.texto) return { titulo: hit.titulo, texto: hit.texto };
  }
  return null;
}

/** Extrai o gancho — primeira frase forte do script, limitada a ~200 chars. */
function extractHook(texto: string): string {
  const cleaned = texto
    .replace(/\[(?:short |long )?pause\]/gi, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Primeiras 1-2 frases.
  const parts = cleaned.split(/(?<=[.!?])\s+/);
  let out = parts[0] || cleaned;
  if (out.length < 80 && parts[1]) out += " " + parts[1];
  if (out.length > 220) out = out.slice(0, 220).replace(/\s\S*$/, "") + "…";
  return out;
}

function buildEpCaptions(titulo: string, hook: string): PlatformCaptions {
  const body = `${titulo}\n\n${hook}`;
  const cta = "Se isto te tocou, segue. A Escola dos Véus está a chegar.";
  const ytDescription = YOUTUBE_DESCRIPTION_TEMPLATE
    .replace("[TITULO]", titulo)
    .replace("[DESCRICAO_VIDEO]", hook);
  return {
    instagram: `${body}\n\n${cta}\n\n${HASHTAGS_SOCIAL}`,
    tiktok: `${body}\n\n${cta}\n\n${HASHTAGS_SOCIAL}`,
    youtube: {
      title: titulo,
      description: ytDescription,
    },
  };
}

function buildLongoCaptions(
  titulo: string,
  resumo: string,
  capitulos: { titulo: string; ancora: string }[],
): PlatformCaptions {
  const chaptersBlock = capitulos
    .map((c) => `${c.ancora}  ${c.titulo}`)
    .join("\n");
  const description = `${titulo}\n\n${resumo}\n\n${chaptersBlock ? `Capítulos:\n${chaptersBlock}\n\n` : ""}A Escola dos Véus é um lugar onde entras para ver o que estava invisível.\n\nseteveus.space\n\n#EscolaDosVeus #Autoconhecimento`;
  return {
    instagram: "",
    tiktok: "",
    youtube: { title: titulo, description },
  };
}

async function loadLongo(slug: string): Promise<{
  titulo: string;
  resumo: string;
  capitulos: { titulo: string; ancora: string }[];
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { titulo: slug, resumo: "", capitulos: [] };
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.storage
    .from("course-assets")
    .download(`admin/longos/${slug}.json`);
  if (error || !data) return { titulo: slug, resumo: "", capitulos: [] };
  try {
    const parsed = JSON.parse(await data.text()) as {
      titulo?: string;
      tema?: string;
      capitulos?: { titulo: string; ancora: string }[];
    };
    return {
      titulo: parsed.titulo || slug,
      resumo: parsed.tema || "",
      capitulos: Array.isArray(parsed.capitulos) ? parsed.capitulos : [],
    };
  } catch {
    return { titulo: slug, resumo: "", capitulos: [] };
  }
}

function slot(date: string, time: string) {
  return { date, time, timezone: TIMEZONE };
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const ep3Date = sp.get("ep3Date") || "";
  const ep3Time = sp.get("ep3Time") || "18:00";
  const ep4Date = sp.get("ep4Date") || "";
  const ep4Time = sp.get("ep4Time") || "18:00";
  const longoDate = sp.get("longoDate") || "";
  const longoTime = sp.get("longoTime") || "11:00";

  const missing: string[] = [];
  if (!ep3Date) missing.push("ep3Date");
  if (!ep4Date) missing.push("ep4Date");
  if (!longoDate) missing.push("longoDate");
  if (missing.length) {
    return NextResponse.json(
      { erro: `Faltam parâmetros obrigatórios: ${missing.join(", ")} (formato YYYY-MM-DD)` },
      { status: 400 },
    );
  }

  const ep3 = findEp("nomear-ep03");
  const ep4 = findEp("nomear-ep04");
  if (!ep3 || !ep4) {
    return NextResponse.json({ erro: "ep3 ou ep4 não encontrados em NOMEAR_PRESETS" }, { status: 500 });
  }

  const longoMeta = await loadLongo(LONGO_SLUG);

  const ep3Slot = slot(ep3Date, ep3Time);
  const ep4Slot = slot(ep4Date, ep4Time);
  const longoSlot = slot(longoDate, longoTime);

  const posts: CsvPost[] = [
    {
      id: "ep3",
      videoUrl: VIDEOS.ep3,
      thumbnailUrl: null,
      trackTitle: ep3.titulo,
      captions: buildEpCaptions(ep3.titulo, extractHook(ep3.texto)),
      schedule: { instagram: ep3Slot, tiktok: ep3Slot, youtube: ep3Slot },
    },
    {
      id: "ep4",
      videoUrl: VIDEOS.ep4,
      thumbnailUrl: null,
      trackTitle: ep4.titulo,
      captions: buildEpCaptions(ep4.titulo, extractHook(ep4.texto)),
      schedule: { instagram: ep4Slot, tiktok: ep4Slot, youtube: ep4Slot },
    },
    {
      id: "longo",
      videoUrl: null,
      fullVideoUrl: VIDEOS.longo,
      thumbnailUrl: null,
      trackTitle: longoMeta.titulo,
      captions: buildLongoCaptions(longoMeta.titulo, longoMeta.resumo, longoMeta.capitulos),
      schedule: { instagram: longoSlot, tiktok: longoSlot, youtube: longoSlot },
      fullSchedule: { instagram: longoSlot, tiktok: longoSlot, youtube: longoSlot },
    },
  ];

  const csv = buildCsv(posts);
  const filename = `escola-veus-${ep3Date}.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Reaproveita HASHTAGS_YT noutros chamadores caso surja necessidade. */
export { HASHTAGS_YT };
