import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/carrossel-veus/render-submit
 *
 * Recebe os 42 áudios já gerados (URLs Supabase) + escolha de música,
 * escreve manifest em course-assets/render-jobs/<jobId>.json e dispara
 * o workflow render-carrossel-veus.yml. O workflow só faz Puppeteer
 * (PNGs) + ffmpeg (MP4) — não chama ElevenLabs.
 *
 * Body: {
 *   jobId,
 *   audios: Array<{ dia: number, slide: number, url: string }>, // 42
 *   musicUrl?: string,
 *   musicVolume?: number
 * }
 *
 * Returns: { jobId, manifestUrl, workflowRunUrl }
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    jobId?: string;
    audios?: Array<{ dia: number; slide: number; url: string }>;
    musicUrl?: string;
    musicVolume?: number;
  };

  const jobId = (body.jobId || "").trim();
  if (!jobId) {
    return NextResponse.json({ erro: "jobId obrigatório" }, { status: 400 });
  }
  if (!Array.isArray(body.audios) || body.audios.length !== 42) {
    return NextResponse.json(
      { erro: `audios[] tem de ter 42 entradas (recebi ${body.audios?.length ?? 0})` },
      { status: 400 }
    );
  }

  const musicUrl = (body.musicUrl || "").trim();
  const musicVolume = clamp(Number(body.musicVolume ?? 0.4), 0, 1);

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { erro: "SUPABASE_SERVICE_ROLE_KEY nao configurada." },
      { status: 500 }
    );
  }

  // Manifest: lido pelo workflow para saber quais áudios descarregar
  const manifest = {
    jobId,
    audios: body.audios,
    musicUrl: musicUrl || null,
    musicVolume,
    createdAt: new Date().toISOString(),
  };
  const manifestPath = `render-jobs/${jobId}.json`;
  const { error: mErr } = await admin.storage
    .from("course-assets")
    .upload(manifestPath, JSON.stringify(manifest, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
  if (mErr) {
    return NextResponse.json(
      { erro: `Upload manifest falhou: ${mErr.message}` },
      { status: 500 }
    );
  }

  // Estado inicial — UI faz polling
  const initial = {
    jobId,
    status: "queued",
    progress: 0,
    musicUrl: musicUrl || null,
    musicVolume,
    createdAt: new Date().toISOString(),
  };
  const { error: rErr } = await admin.storage
    .from("course-assets")
    .upload(`render-jobs/${jobId}-result.json`, JSON.stringify(initial, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
  if (rErr) {
    return NextResponse.json(
      { erro: `Upload result inicial falhou: ${rErr.message}` },
      { status: 500 }
    );
  }

  // Dispatch workflow (passa só jobId — o resto vem do manifest)
  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = "render-carrossel-veus.yml";
  const ref = process.env.GITHUB_DISPATCH_REF || "main";
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    return NextResponse.json(
      { erro: "GITHUB_DISPATCH_TOKEN nao configurada." },
      { status: 500 }
    );
  }

  const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`;
  const ghRes = await fetch(dispatchUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ref, inputs: { jobId } }),
  });
  if (!ghRes.ok) {
    const errText = await ghRes.text();
    return NextResponse.json(
      { erro: `GitHub dispatch falhou (${ghRes.status}): ${errText.slice(0, 400)}` },
      { status: 502 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return NextResponse.json({
    jobId,
    manifestUrl: `${supabaseUrl}/storage/v1/object/public/course-assets/${manifestPath}`,
    workflowRunUrl: `https://github.com/${owner}/${repo}/actions/workflows/${workflowFile}`,
  });
}

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
