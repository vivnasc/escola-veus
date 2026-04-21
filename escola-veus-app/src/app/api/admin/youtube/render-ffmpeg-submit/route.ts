import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/youtube/render-ffmpeg-submit
 *
 * Alternativa gratuita ao /render-submit (Shotstack). Cria um manifest JSON
 * em Supabase (`course-assets/render-jobs/<jobId>.json`) e dispara o workflow
 * GitHub Actions `render-ancient-ground.yml` passando só o jobId. O workflow
 * corre FFmpeg, faz upload do MP4 e escreve `render-jobs/<jobId>-result.json`
 * que o cliente consulta via /render-ffmpeg-status.
 *
 * Env necessárias:
 *   SUPABASE_SERVICE_ROLE_KEY                (para gravar o manifest)
 *   GITHUB_REPO_OWNER (default: "vivnasc")
 *   GITHUB_REPO_NAME  (default: "escola-veus")
 *   GITHUB_DISPATCH_TOKEN                    (PAT com scope `workflow` ou `repo`)
 *   GITHUB_WORKFLOW_FILE (default: "render-ancient-ground.yml")
 *   GITHUB_DISPATCH_REF  (default: "main")
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title,
    slug: rawSlug,
    uniqueClips,
    targetDuration = 3600,
    musicUrls,
    musicVolume = 0.8,
    clipDuration = 10,
    crossfade = 1.5,
    trimEdge = 0.3,
    fps = 30,
    thumbnailUrl,
    thumbnailDataUrl,
    seo,
  } = body || {};

  if (!Array.isArray(uniqueClips) || uniqueClips.length === 0) {
    return NextResponse.json({ erro: "uniqueClips[] obrigatorio." }, { status: 400 });
  }
  if (!Array.isArray(musicUrls) || musicUrls.length === 0) {
    return NextResponse.json({ erro: "musicUrls[] obrigatorio." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ erro: "SUPABASE_SERVICE_ROLE_KEY nao configurada." }, { status: 500 });
  }

  const slug = sanitiseSlug(rawSlug || title || "ancient-ground");
  const jobId = `${slug}-${Date.now()}`;

  // Ao contrário do Shotstack, o FFmpeg não beneficia de loop explícito no
  // cliente — o workflow recebe os clips únicos e faz o loop internamente.
  const validClips = (uniqueClips as string[]).filter((u) => u && u.trim().length > 0);

  const manifest = {
    jobId,
    title: title || "",
    slug,
    clips: validClips,
    music: musicUrls,
    clipDuration,
    targetDuration,
    crossfade,
    trimEdge,
    fps,
    musicVolume,
    thumbnailUrl: thumbnailUrl || null,
    thumbnailDataUrl: thumbnailDataUrl || null,
    seo: seo || null,
    createdAt: new Date().toISOString(),
  };

  // Upload do manifest
  const manifestBody = JSON.stringify(manifest, null, 2);
  const { error: upErr } = await admin.storage
    .from("course-assets")
    .upload(`render-jobs/${jobId}.json`, manifestBody, {
      contentType: "application/json",
      upsert: true,
    });
  if (upErr) {
    return NextResponse.json({ erro: `Upload manifest falhou: ${upErr.message}` }, { status: 500 });
  }

  // Cria um pseudo-result inicial para a UI saber que foi despachado
  const initialResult = {
    jobId,
    status: "queued",
    progress: 0,
    title,
    slug,
    updatedAt: new Date().toISOString(),
  };
  await admin.storage
    .from("course-assets")
    .upload(`render-jobs/${jobId}-result.json`, JSON.stringify(initialResult, null, 2), {
      contentType: "application/json",
      upsert: true,
    });

  // Dispatch do workflow
  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = process.env.GITHUB_WORKFLOW_FILE || "render-ancient-ground.yml";
  const ref = process.env.GITHUB_DISPATCH_REF || "main";
  const token = process.env.GITHUB_DISPATCH_TOKEN;

  if (!token) {
    return NextResponse.json(
      { erro: "GITHUB_DISPATCH_TOKEN nao configurada. Cria um PAT com scope workflow e mete em Vercel env." },
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

  return NextResponse.json({
    jobId,
    manifestUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/course-assets/render-jobs/${jobId}.json`,
    workflowRunUrl: `https://github.com/${owner}/${repo}/actions/workflows/${workflowFile}`,
  });
}

function sanitiseSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "video";
}
