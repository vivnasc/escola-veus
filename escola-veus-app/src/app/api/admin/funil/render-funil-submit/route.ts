import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/funil/render-funil-submit
 *
 * Dispatcha o workflow render-funil.yml em GitHub Actions para renderizar
 * um vídeo de Funil (~2min, Nomear com narração ElevenLabs + Ancient Ground
 * duckada). Mesmo padrão do Ancient Ground e Shorts: manifest em Supabase,
 * polling via /render-funil-status.
 *
 * Body: {
 *   title, slug?, clips[], clipDuration?,
 *   narrationUrl, musicUrls[], musicVolume?,
 *   thumbnailUrl?, seo?
 * }
 * Returns: { jobId }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title,
    slug: rawSlug,
    clips,
    clipDuration = 10,
    narrationUrl,
    musicUrls,
    musicVolume = 0.15,
    crossfade = 0.5,
    thumbnailUrl,
    seo,
  } = body || {};

  if (!Array.isArray(clips) || clips.length === 0) {
    return NextResponse.json({ erro: "clips[] obrigatorio." }, { status: 400 });
  }
  if (!narrationUrl) {
    return NextResponse.json({ erro: "narrationUrl obrigatorio." }, { status: 400 });
  }
  if (!Array.isArray(musicUrls) || musicUrls.length === 0) {
    return NextResponse.json({ erro: "musicUrls[] obrigatorio." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ erro: "SUPABASE_SERVICE_ROLE_KEY nao configurada." }, { status: 500 });
  }

  const slug = sanitiseSlug(rawSlug || title || "funil");
  const jobId = `funil-${slug}-${Date.now()}`;

  const manifest = {
    jobId,
    title: title || "",
    slug,
    clips,
    clipDuration,
    narrationUrl,
    musicUrls,
    musicVolume,
    crossfade,
    thumbnailUrl: thumbnailUrl || null,
    seo: seo || null,
    createdAt: new Date().toISOString(),
  };

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

  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = process.env.GITHUB_WORKFLOW_FILE_FUNIL || "render-funil.yml";
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

  return NextResponse.json({ jobId });
}

function sanitiseSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "funil";
}
