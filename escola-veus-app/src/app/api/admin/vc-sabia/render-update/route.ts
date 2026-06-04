import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/render-update
 *
 * Actualiza o manifest dum jobId existente (e.g. trocar motion para nao
 * repetir) e re-despacha o workflow. Util quando se ve no Step 3 que
 * uma row tem motion ja usado e quer-se trocar apenas essa.
 *
 * Body: { jobId, motionUrl?, motionName?, audioUrl?, phrase?, dateLabel? }
 * Returns: { ok, jobId, patched: string[] }
 */
export async function POST(req: NextRequest) {
  let body: {
    jobId?: string;
    motionUrl?: string;
    motionName?: string;
    audioUrl?: string | null;
    phrase?: string;
    dateLabel?: string;
    phraseSize?: number;
    kickerSize?: number;
    cardY?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }

  const jobId = body.jobId?.trim();
  if (!jobId) {
    return NextResponse.json({ erro: "jobId em falta" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  // Le manifest actual
  const manifestRes = await fetch(
    `${supabaseUrl}/storage/v1/object/public/course-assets/render-jobs/${jobId}.json`,
    { cache: "no-store" }
  );
  if (!manifestRes.ok) {
    return NextResponse.json(
      { erro: `Manifest ${jobId} nao encontrado` },
      { status: 404 }
    );
  }
  const manifest = await manifestRes.json();

  // Patch
  const patched: string[] = [];
  if (body.motionUrl && body.motionUrl !== manifest.motionUrl) {
    manifest.motionUrl = body.motionUrl.trim();
    if (body.motionName) manifest.motionName = body.motionName.trim();
    patched.push("motionUrl");
  }
  if (body.audioUrl !== undefined && body.audioUrl !== manifest.audioUrl) {
    manifest.audioUrl = body.audioUrl;
    patched.push("audioUrl");
  }
  if (body.phrase && body.phrase !== manifest.phrase) {
    manifest.phrase = body.phrase.trim();
    patched.push("phrase");
  }
  if (body.dateLabel && body.dateLabel !== manifest.dateLabel) {
    manifest.dateLabel = body.dateLabel.trim();
    patched.push("dateLabel");
  }
  // Design overrides por linha (sobrepoem-se ao design global do batch)
  if (typeof body.phraseSize === "number" && body.phraseSize > 0) {
    manifest.design = { ...(manifest.design || {}), phraseSize: body.phraseSize };
    patched.push("phraseSize");
  }
  if (typeof body.kickerSize === "number" && body.kickerSize > 0) {
    manifest.design = { ...(manifest.design || {}), kickerSize: body.kickerSize };
    patched.push("kickerSize");
  }
  if (typeof body.cardY === "number") {
    manifest.design = { ...(manifest.design || {}), cardY: body.cardY };
    patched.push("cardY");
  }
  manifest.updatedAt = new Date().toISOString();

  if (patched.length === 0) {
    return NextResponse.json(
      { erro: "Nada para alterar (campos identicos)" },
      { status: 400 }
    );
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Re-grava manifest
  await supabase.storage.from("course-assets").upload(
    `render-jobs/${jobId}.json`,
    JSON.stringify(manifest, null, 2),
    { contentType: "application/json", upsert: true }
  );

  // Tambem actualizar batch metadata (se existir) para reflectir nova motion
  if (manifest.batchId) {
    const batchRes = await fetch(
      `${supabaseUrl}/storage/v1/object/public/course-assets/vc-sabia-batches/${manifest.batchId}.json`,
      { cache: "no-store" }
    );
    if (batchRes.ok) {
      try {
        const batch = await batchRes.json();
        if (Array.isArray(batch.jobs)) {
          batch.jobs = batch.jobs.map((j: { jobId: string; motionName?: string; phraseText?: string }) =>
            j.jobId === jobId
              ? {
                  ...j,
                  motionName: manifest.motionName || j.motionName,
                  phraseText: manifest.phrase || j.phraseText,
                }
              : j
          );
          await supabase.storage.from("course-assets").upload(
            `vc-sabia-batches/${manifest.batchId}.json`,
            JSON.stringify(batch, null, 2),
            { contentType: "application/json", upsert: true }
          );
        }
      } catch {
        /* ignore batch update failure */
      }
    }
  }

  // Reset result.json
  await supabase.storage.from("course-assets").upload(
    `render-jobs/${jobId}-result.json`,
    JSON.stringify(
      {
        jobId,
        status: "queued",
        progress: 0,
        message: `Re-render com novo ${patched.join(", ")}`,
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    ),
    { contentType: "application/json", upsert: true }
  );

  // Dispatch
  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = "render-vc-sabia.yml";
  const ref = process.env.GITHUB_DISPATCH_REF || "main";
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    return NextResponse.json(
      { erro: "GITHUB_DISPATCH_TOKEN nao configurada" },
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
    const t = await ghRes.text();
    return NextResponse.json(
      { erro: `GitHub dispatch ${ghRes.status}: ${t.slice(0, 300)}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, jobId, patched });
}
