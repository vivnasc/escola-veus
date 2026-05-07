import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { RAIZES_TEMAS, type RaizTema } from "@/lib/ag-raizes-temas";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/ancient-ground/animate-raiz
 *
 * Anima UMA imagem AG raízes via Runway Gen-4 (espelho do animate-one da
 * paisagem, mas destino separado para AG não tocar em Loranne).
 *
 * Body: {
 *   imageUrl: string,
 *   motionPrompt: string,
 *   tema: string,           // categoria raízes (machamba, batuque, …)
 *   durationSec?: 5 | 10    // default 10
 * }
 *
 * Salva em escola-shorts/ag-raizes-clips/{tema}/{tema}-NN.mp4 com NN
 * sequencial descoberto no servidor (mesma lógica das imagens em /raizes).
 *
 * Returns: { url, path, filename }  ou  { erro }
 */

const BUCKET = "escola-shorts";
const PREFIX = "ag-raizes-clips";

function parseIndex(filename: string, tema: RaizTema): number | null {
  const base = filename.replace(/\.[^.]+$/, "");
  const prefix = `${tema}-`;
  if (!base.startsWith(prefix)) return null;
  const m = base.slice(prefix.length).match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

async function nextIndex(
  supabase: SupabaseClient,
  tema: RaizTema,
): Promise<number> {
  const all: { name: string }[] = [];
  let offset = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(`${PREFIX}/${tema}`, { limit: pageSize, offset, sortBy: { column: "name", order: "asc" } });
    if (error || !data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  let max = 0;
  for (const f of all) {
    const n = parseIndex(f.name, tema);
    if (n !== null && n > max) max = n;
  }
  return max + 1;
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, motionPrompt, tema, durationSec } = await req.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ erro: "imageUrl obrigatório." }, { status: 400 });
    }
    if (!motionPrompt || typeof motionPrompt !== "string") {
      return NextResponse.json({ erro: "motionPrompt obrigatório." }, { status: 400 });
    }
    if (!tema || !(RAIZES_TEMAS as readonly string[]).includes(tema)) {
      return NextResponse.json({ erro: "tema raízes inválido." }, { status: 400 });
    }

    const duration = durationSec === 5 ? 5 : 10;
    const apiKey = process.env.RUNWAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ erro: "RUNWAY_API_KEY não configurada." }, { status: 500 });
    }

    // 1. Submit ao Runway (image-to-video, vertical 9:16 — espelho do animate-one)
    const createRes = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify({
        model: "gen4_turbo",
        promptImage: imageUrl,
        promptText: motionPrompt,
        duration,
        ratio: "720:1280",
      }),
    });
    if (!createRes.ok) {
      const err = await createRes.text();
      return NextResponse.json(
        { erro: `Runway create: ${createRes.status} — ${err.slice(0, 300)}` },
        { status: 502 },
      );
    }
    const { id: taskId } = await createRes.json();
    if (!taskId) {
      return NextResponse.json({ erro: "Runway não devolveu task ID." }, { status: 502 });
    }

    // 2. Poll (max 5 min)
    const maxAttempts = 60;
    const pollInterval = 5000;
    let videoUrl = "";
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, pollInterval));
      const statusRes = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-Runway-Version": "2024-11-06",
        },
      });
      if (!statusRes.ok) continue;
      const status = await statusRes.json();
      if (status.status === "FAILED") {
        return NextResponse.json(
          { erro: `Runway falhou: ${status.failure || "erro desconhecido"}` },
          { status: 502 },
        );
      }
      if (status.status === "SUCCEEDED" && status.output?.length > 0) {
        videoUrl = status.output[0];
        break;
      }
    }
    if (!videoUrl) {
      return NextResponse.json(
        { erro: "Timeout: Runway não completou em 5 minutos." },
        { status: 504 },
      );
    }

    // 3. Download do MP4 do Runway
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) {
      return NextResponse.json(
        { erro: "Não consegui descarregar vídeo Runway." },
        { status: 502 },
      );
    }
    const buf = await videoRes.arrayBuffer();

    // 4. Upload para Supabase com nome auto-sequencial
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ erro: "Supabase não configurado." }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const idx = await nextIndex(supabase, tema as RaizTema);
    const filename = `${tema}-${String(idx).padStart(2, "0")}.mp4`;
    const filePath = `${PREFIX}/${tema}/${filename}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, new Uint8Array(buf), {
        contentType: "video/mp4",
        upsert: false,
      });
    if (upErr) {
      return NextResponse.json({ erro: `Supabase upload: ${upErr.message}` }, { status: 500 });
    }

    const url = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${filePath}`;
    return NextResponse.json({ url, path: filePath, filename });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: `Excepção: ${msg}` }, { status: 500 });
  }
}
