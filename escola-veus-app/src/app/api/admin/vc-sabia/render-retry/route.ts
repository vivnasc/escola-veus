import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/render-retry
 *
 * Re-despacha o workflow render-vc-sabia.yml para um jobId existente.
 * Util quando um render falhou (status=failed no result.json).
 * Reset do result.json para status=queued antes do dispatch para a UI
 * mostrar progresso novo.
 *
 * Body: { jobId }
 * Returns: { ok, jobId }
 */
export async function POST(req: NextRequest) {
  let body: { jobId?: string };
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

  // Verifica que o manifest existe (jobId valido)
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

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Reset do result.json
  await supabase.storage.from("course-assets").upload(
    `render-jobs/${jobId}-result.json`,
    JSON.stringify(
      {
        jobId,
        status: "queued",
        progress: 0,
        retriedAt: new Date().toISOString(),
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

  const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`;
  console.log(`[retry] dispatching ${jobId} -> ${dispatchUrl}`);

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
    const t = await ghRes.text();
    console.error(`[retry] dispatch failed ${ghRes.status}`, t);
    return NextResponse.json(
      {
        erro: `GitHub dispatch ${ghRes.status}: ${t.slice(0, 300)}`,
        dispatchUrl,
        ref,
        workflowFile,
      },
      { status: 502 }
    );
  }

  console.log(`[retry] dispatched ${jobId} OK`);
  return NextResponse.json({ ok: true, jobId, dispatchUrl });
}
