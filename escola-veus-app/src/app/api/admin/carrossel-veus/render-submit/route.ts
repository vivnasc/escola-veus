import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/carrossel-veus/render-submit
 *
 * Cria um job e dispara o workflow `render-carrossel-veus.yml`. Não escreve
 * manifest porque o conteúdo dos 42 slides vive no repo (carrossel-veus/
 * content.json) — basta o jobId, musicUrl e musicVolume.
 *
 * Body: { musicUrl?: string, musicVolume?: number }
 *
 * Returns: { jobId, workflowRunUrl, manifestPath }
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    musicUrl?: string;
    musicVolume?: number;
  };

  const musicUrl = (body.musicUrl || "").trim();
  const musicVolume = clamp(Number(body.musicVolume ?? 0.4), 0, 1);

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { erro: "SUPABASE_SERVICE_ROLE_KEY nao configurada." },
      { status: 500 }
    );
  }

  const jobId = `carrossel-veus-${Date.now()}`;

  // Estado inicial — UI faz polling deste ficheiro
  const initial = {
    jobId,
    status: "queued",
    progress: 0,
    musicUrl: musicUrl || null,
    musicVolume,
    createdAt: new Date().toISOString(),
  };
  const { error: upErr } = await admin.storage
    .from("course-assets")
    .upload(
      `render-jobs/${jobId}-result.json`,
      JSON.stringify(initial, null, 2),
      { contentType: "application/json", upsert: true }
    );
  if (upErr) {
    return NextResponse.json(
      { erro: `Upload result inicial falhou: ${upErr.message}` },
      { status: 500 }
    );
  }

  // Dispatch
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
    body: JSON.stringify({
      ref,
      inputs: {
        jobId,
        musicUrl: musicUrl,
        musicVolume: String(musicVolume),
      },
    }),
  });

  if (!ghRes.ok) {
    const errText = await ghRes.text();
    return NextResponse.json(
      { erro: `GitHub dispatch falhou (${ghRes.status}): ${errText.slice(0, 400)}` },
      { status: 502 }
    );
  }

  return NextResponse.json({
    jobId,
    workflowRunUrl: `https://github.com/${owner}/${repo}/actions/workflows/${workflowFile}`,
  });
}

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
