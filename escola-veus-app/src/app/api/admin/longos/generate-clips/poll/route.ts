import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/admin/longos/generate-clips/poll
 *
 * Verifica status de tasks Runway pendentes (prompts com runwayTaskId
 * + sem clipUrl). Para cada task SUCCEEDED:
 *  1. Download do MP4 do CDN do Runway
 *  2. Upload para longos-clips/<slug>/<promptId>.mp4
 *  3. Patch project: clipUrl ← URL Supabase, clear runwayTaskId
 *
 * Cliente chama em loop (a cada ~15-30s) até pending=0.
 *
 * Body: { slug }
 * Returns: { pending, completed, failed, total }
 */

type Project = {
  prompts?: ProjectPrompt[];
  [k: string]: unknown;
};

type ProjectPrompt = {
  id: string;
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

export async function POST(req: NextRequest) {
  const runwayKey = process.env.RUNWAYML_API_SECRET;
  if (!runwayKey) {
    return NextResponse.json(
      { erro: "RUNWAYML_API_SECRET não configurada" },
      { status: 500 },
    );
  }

  let body: { slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const slug = (body.slug || "").trim();
  if (!slug || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(slug)) {
    return NextResponse.json({ erro: "slug inválido" }, { status: 400 });
  }

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
  const pendingPrompts = prompts.filter((p) => !p.clipUrl && p.runwayTaskId);
  if (pendingPrompts.length === 0) {
    return NextResponse.json({
      pending: 0,
      completed: 0,
      failed: 0,
      total: prompts.length,
      message: "Sem tasks Runway pendentes",
    });
  }

  // Verifica status em paralelo (até 10 em vôo) — Runway aceita poll concorrente
  let completed = 0;
  const failed: { promptId: string; reason: string }[] = [];
  let stillPending = 0;
  let projectModified = false;

  const BATCH_SIZE = 10;
  for (let i = 0; i < pendingPrompts.length; i += BATCH_SIZE) {
    const batch = pendingPrompts.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (p) => {
        const taskId = p.runwayTaskId;
        if (!taskId) return;
        try {
          const res = await fetch(
            `https://api.dev.runwayml.com/v1/tasks/${taskId}`,
            {
              headers: {
                Authorization: `Bearer ${runwayKey}`,
                "X-Runway-Version": "2024-11-06",
              },
            },
          );
          if (!res.ok) {
            stillPending++;
            return;
          }
          const data = await res.json();

          if (data.status === "SUCCEEDED" && data.output?.length > 0) {
            const videoUrl = data.output[0];
            // Download → upload Supabase
            const vidRes = await fetch(videoUrl);
            if (!vidRes.ok) {
              stillPending++;
              return;
            }
            const filePath = `longos-clips/${slug}/${p.id}.mp4`;
            const buffer = new Uint8Array(await vidRes.arrayBuffer());
            const { error: upErr } = await supabase.storage
              .from("course-assets")
              .upload(filePath, buffer, {
                contentType: "video/mp4",
                upsert: true,
              });
            if (upErr) {
              failed.push({ promptId: p.id, reason: `Upload: ${upErr.message}` });
              delete p.runwayTaskId;
              projectModified = true;
              return;
            }
            p.clipUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
            delete p.runwayTaskId;
            completed++;
            projectModified = true;
          } else if (data.status === "FAILED") {
            failed.push({
              promptId: p.id,
              reason: data.failure || "Runway falhou (sem detalhe)",
            });
            delete p.runwayTaskId;
            projectModified = true;
          } else {
            // PENDING / RUNNING / QUEUED
            stillPending++;
          }
        } catch (err) {
          failed.push({
            promptId: p.id,
            reason: err instanceof Error ? err.message : String(err),
          });
          stillPending++;
        }
      }),
    );
  }

  // Persiste se houve mudanças
  if (projectModified) {
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
      console.error("[generate-clips/poll] patch projecto falhou:", upErr.message);
    }
  }

  return NextResponse.json({
    pending: stillPending,
    completed,
    failed,
    total: prompts.length,
    totalUnclipped: prompts.filter((p) => !p.clipUrl).length,
  });
}
