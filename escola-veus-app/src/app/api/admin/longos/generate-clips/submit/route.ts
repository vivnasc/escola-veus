import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/admin/longos/generate-clips/submit
 *
 * Para cada prompt sem clipUrl:
 *  1. Gera imagem via fal.ai Flux Pro 1.1 (1920×1080)
 *  2. Faz upload da imagem para longos-images/<slug>/<promptId>.png
 *  3. Submete a Runway gen4_turbo (image-to-video, 10s, 1280:720)
 *  4. Guarda runwayTaskId no projecto
 *
 * Não espera resultados Runway — submeter é instantâneo (~1s/prompt). O
 * polling fica para /generate-clips/poll que o cliente chama em loop.
 *
 * Submete em batches de 5 paralelos para caber em 300s. fal.ai ~10s
 * cada → 5×7=35 prompts em ~70s; +Runway submit instantâneo. ~80s total.
 *
 * Body: { slug, motionPrompt? }
 *   - motionPrompt: instruções de câmara para Runway (default lento contemplativo)
 *
 * Returns: { submitted, failed, totalUnclipped }
 */

type Project = {
  prompts?: ProjectPrompt[];
  [k: string]: unknown;
};

type ProjectPrompt = {
  id: string;
  prompt?: string;
  motion?: string;
  clipUrl?: string;
  imageUrl?: string;
  runwayTaskId?: string;
  [k: string]: unknown;
};

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

const DEFAULT_MOTION =
  "very slow camera drift, contemplative pacing, no sudden movements, gentle dust motes in light";

async function generateImage(
  prompt: string,
  falKey: string,
): Promise<string | null> {
  try {
    const res = await fetch("https://fal.run/fal-ai/flux-pro/v1.1", {
      method: "POST",
      headers: {
        Authorization: `Key ${falKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: { width: 1920, height: 1080 },
        num_images: 1,
        safety_tolerance: "5",
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.images?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

async function submitRunway(
  imageUrl: string,
  motionPrompt: string,
  runwayKey: string,
): Promise<string | null> {
  try {
    const res = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${runwayKey}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify({
        model: "gen4_turbo",
        promptImage: imageUrl,
        promptText: motionPrompt,
        duration: 10,
        ratio: "1280:720",
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.id ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const falKey = process.env.FAL_KEY;
  const runwayKey = process.env.RUNWAY_API_KEY;
  if (!falKey) {
    return NextResponse.json({ erro: "FAL_KEY não configurada" }, { status: 500 });
  }
  if (!runwayKey) {
    return NextResponse.json(
      { erro: "RUNWAY_API_KEY não configurada" },
      { status: 500 },
    );
  }

  let body: { slug?: string; motionPrompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const slug = (body.slug || "").trim();
  if (!slug || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(slug)) {
    return NextResponse.json({ erro: "slug inválido" }, { status: 400 });
  }
  const motionPrompt = body.motionPrompt || DEFAULT_MOTION;

  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // Carrega projecto
  let proj: Project;
  try {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .download(`admin/longos/${slug}.json`);
    if (error || !data) {
      return NextResponse.json({ erro: "Projecto não encontrado" }, { status: 404 });
    }
    proj = JSON.parse(await data.text()) as Project;
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  const prompts = Array.isArray(proj.prompts) ? proj.prompts : [];
  // Pendentes: sem clipUrl E sem runwayTaskId pendente (evita re-submeter)
  const pending = prompts.filter((p) => !p.clipUrl && !p.runwayTaskId);
  if (pending.length === 0) {
    return NextResponse.json({
      submitted: 0,
      failed: 0,
      totalUnclipped: prompts.filter((p) => !p.clipUrl).length,
      message: "Nada a submeter — todos os prompts têm clipUrl ou já estão em curso",
    });
  }

  // Process em batches de 5 paralelos
  const BATCH_SIZE = 5;
  const failed: { promptId: string; reason: string }[] = [];
  let submitted = 0;

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (p) => {
        try {
          // 1. fal.ai → imagem
          const imageUrl = await generateImage(p.prompt ?? "", falKey);
          if (!imageUrl) {
            return { id: p.id, error: "fal.ai falhou" };
          }
          // 2. Upload imagem para Supabase
          const imgRes = await fetch(imageUrl);
          if (!imgRes.ok) {
            return { id: p.id, error: `Download imagem ${imgRes.status}` };
          }
          const imgPath = `longos-images/${slug}/${p.id}.png`;
          const imgBuffer = new Uint8Array(await imgRes.arrayBuffer());
          const { error: imgErr } = await supabase.storage
            .from("course-assets")
            .upload(imgPath, imgBuffer, {
              contentType: "image/png",
              upsert: true,
            });
          if (imgErr) {
            return { id: p.id, error: `Upload imagem: ${imgErr.message}` };
          }
          const supabaseImageUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${imgPath}`;
          // 3. Submeter a Runway com motion da própria cena (cada prompt tem
          //    motion específico do gen-project; só caímos no DEFAULT_MOTION
          //    se a cena foi gerada antes do schema motion existir, ou se o
          //    user limpou o campo a editar).
          const sceneMotion = (p.motion ?? "").trim() || motionPrompt;
          const taskId = await submitRunway(
            supabaseImageUrl,
            sceneMotion,
            runwayKey,
          );
          if (!taskId) {
            return { id: p.id, imageUrl: supabaseImageUrl, error: "Runway submit falhou" };
          }
          return { id: p.id, imageUrl: supabaseImageUrl, taskId };
        } catch (err) {
          return {
            id: p.id,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      }),
    );

    // Aplica resultados ao projecto
    for (const r of results) {
      const p = prompts.find((x) => x.id === r.id);
      if (!p) continue;
      if ("imageUrl" in r && r.imageUrl) p.imageUrl = r.imageUrl;
      if ("taskId" in r && r.taskId) {
        p.runwayTaskId = r.taskId;
        submitted++;
      } else if ("error" in r && r.error) {
        failed.push({ promptId: r.id, reason: r.error });
      }
    }
  }

  // Persiste o projecto
  const updated = {
    ...proj,
    prompts,
    updatedAt: new Date().toISOString(),
  };
  const { error: upErr } = await supabase.storage
    .from("course-assets")
    .upload(`admin/longos/${slug}.json`, JSON.stringify(updated, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
  if (upErr) {
    return NextResponse.json(
      { erro: `Patch projecto: ${upErr.message}`, submitted, failed },
      { status: 500 },
    );
  }

  return NextResponse.json({
    submitted,
    failed,
    totalUnclipped: prompts.filter((p) => !p.clipUrl).length,
    inFlight: prompts.filter((p) => !p.clipUrl && p.runwayTaskId).length,
  });
}
