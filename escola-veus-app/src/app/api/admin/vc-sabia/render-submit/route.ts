import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/render-submit
 *
 * Escreve manifest + overlay PNG em Supabase e dispara
 * workflow render-vc-sabia.yml.
 *
 * Body: {
 *   motionUrl: string,
 *   audioUrl?: string | null,
 *   phrase: string,
 *   dateLabel: string,
 *   overlayPngBase64: string,
 *   durationSec?: number,
 * }
 *
 * Returns: { jobId, manifestUrl, workflowRunUrl }
 */
export async function POST(req: NextRequest) {
  let body: {
    motionUrl?: string;
    audioUrl?: string | null;
    phrase?: string;
    dateLabel?: string;
    overlayPngBase64?: string;
    durationSec?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }

  const motionUrl = body.motionUrl?.trim();
  const audioUrl = body.audioUrl?.trim() || null;
  const phrase = (body.phrase || "").trim();
  const dateLabel = (body.dateLabel || "").trim();
  const overlayPngBase64 = body.overlayPngBase64 || "";
  const durationSec = Math.max(5, Math.min(20, Number(body.durationSec ?? 12)));

  if (!motionUrl) {
    return NextResponse.json({ erro: "motionUrl em falta" }, { status: 400 });
  }
  if (!phrase) {
    return NextResponse.json({ erro: "phrase em falta" }, { status: 400 });
  }
  if (!overlayPngBase64) {
    return NextResponse.json({ erro: "overlayPngBase64 em falta" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const jobId = `vc-sabia-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // 1) Upload overlay PNG
  let pngData = overlayPngBase64;
  if (pngData.startsWith("data:")) {
    const idx = pngData.indexOf(",");
    if (idx >= 0) pngData = pngData.slice(idx + 1);
  }
  const pngBuffer = Buffer.from(pngData, "base64");
  const overlayPath = `render-jobs/${jobId}-overlay.png`;
  const { error: pngErr } = await supabase.storage
    .from("course-assets")
    .upload(overlayPath, pngBuffer, {
      contentType: "image/png",
      upsert: true,
    });
  if (pngErr) {
    return NextResponse.json({ erro: `Overlay upload: ${pngErr.message}` }, { status: 500 });
  }
  const overlayUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${overlayPath}`;

  // 2) Manifest
  const manifest = {
    jobId,
    motionUrl,
    audioUrl,
    overlayUrl,
    phrase,
    dateLabel,
    durationSec,
    createdAt: new Date().toISOString(),
  };
  const manifestPath = `render-jobs/${jobId}.json`;
  const { error: mErr } = await supabase.storage
    .from("course-assets")
    .upload(manifestPath, JSON.stringify(manifest, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
  if (mErr) {
    return NextResponse.json({ erro: `Manifest upload: ${mErr.message}` }, { status: 500 });
  }

  // 3) Initial result (queued)
  const initialResult = {
    jobId,
    status: "queued",
    progress: 0,
    createdAt: new Date().toISOString(),
  };
  const { error: rErr } = await supabase.storage
    .from("course-assets")
    .upload(
      `render-jobs/${jobId}-result.json`,
      JSON.stringify(initialResult, null, 2),
      { contentType: "application/json", upsert: true }
    );
  if (rErr) {
    return NextResponse.json({ erro: `Result init: ${rErr.message}` }, { status: 500 });
  }

  // 4) Dispatch GitHub workflow
  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = "render-vc-sabia.yml";
  const ref = process.env.GITHUB_DISPATCH_REF || "main";
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    return NextResponse.json(
      { erro: "GITHUB_DISPATCH_TOKEN nao configurada." },
      { status: 500 }
    );
  }

  const ghRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref, inputs: { jobId } }),
    }
  );
  if (!ghRes.ok) {
    const errText = await ghRes.text();
    return NextResponse.json(
      { erro: `GitHub dispatch ${ghRes.status}: ${errText.slice(0, 400)}` },
      { status: 502 }
    );
  }

  return NextResponse.json({
    jobId,
    manifestUrl: `${supabaseUrl}/storage/v1/object/public/course-assets/${manifestPath}`,
    workflowRunUrl: `https://github.com/${owner}/${repo}/actions/workflows/${workflowFile}`,
  });
}
