import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/render-submit
 *
 * Escreve manifest em Supabase e dispara workflow render-vc-sabia.yml.
 * Overlay e composto server-side dentro do GitHub Action (canvas).
 *
 * Body: {
 *   motionUrl, audioUrl?, phrase, dateLabel, durationSec?,
 *   jobIdOverride? // bulk mode passa um jobId fixo
 * }
 *
 * Returns: { jobId, workflowRunUrl }
 */
export async function POST(req: NextRequest) {
  let body: {
    motionUrl?: string;
    audioUrl?: string | null;
    phrase?: string;
    dateLabel?: string;
    durationSec?: number;
    jobIdOverride?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }

  const motionUrlRaw = body.motionUrl?.trim();
  const audioUrl = body.audioUrl?.trim() || null;
  const phrase = (body.phrase || "").trim();
  const dateLabel = (body.dateLabel || "").trim();
  const durationSec = Math.max(5, Math.min(20, Number(body.durationSec ?? 12)));

  if (!motionUrlRaw) {
    return NextResponse.json({ erro: "motionUrl em falta" }, { status: 400 });
  }
  if (!phrase) {
    return NextResponse.json({ erro: "phrase em falta" }, { status: 400 });
  }

  // Resolver URLs relativas (e.g. motion de teste em /public/assets/...)
  // para URLs absolutas, senao o GitHub Action nao consegue fazer fetch.
  let motionUrl = motionUrlRaw;
  if (motionUrl.startsWith("/")) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("host") || process.env.VERCEL_URL || "";
    if (!host) {
      return NextResponse.json(
        { erro: "motionUrl relativa mas nao consegui resolver host. Usa motion da library Supabase." },
        { status: 400 }
      );
    }
    motionUrl = `${proto}://${host}${motionUrl}`;
  }
  if (!/^https?:\/\//.test(motionUrl)) {
    return NextResponse.json(
      { erro: `motionUrl invalida: ${motionUrl}` },
      { status: 400 }
    );
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

  const jobId =
    body.jobIdOverride?.trim() ||
    `vc-sabia-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const manifest = {
    jobId,
    motionUrl,
    audioUrl,
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
    return NextResponse.json({ erro: `Manifest: ${mErr.message}` }, { status: 500 });
  }

  const initialResult = {
    jobId,
    status: "queued",
    progress: 0,
    createdAt: new Date().toISOString(),
  };
  await supabase.storage
    .from("course-assets")
    .upload(
      `render-jobs/${jobId}-result.json`,
      JSON.stringify(initialResult, null, 2),
      { contentType: "application/json", upsert: true },
    );

  // Dispatch GitHub workflow
  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = "render-vc-sabia.yml";
  const ref = process.env.GITHUB_DISPATCH_REF || "main";
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    return NextResponse.json(
      { erro: "GITHUB_DISPATCH_TOKEN nao configurada." },
      { status: 500 },
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
    },
  );
  if (!ghRes.ok) {
    const errText = await ghRes.text();
    return NextResponse.json(
      { erro: `GitHub dispatch ${ghRes.status}: ${errText.slice(0, 400)}` },
      { status: 502 },
    );
  }

  return NextResponse.json({
    jobId,
    workflowRunUrl: `https://github.com/${owner}/${repo}/actions/workflows/${workflowFile}`,
  });
}
