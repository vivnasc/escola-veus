import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const runtime = "nodejs";

/**
 * GET /api/admin/vc-sabia/bulk-status?batchId=X
 *
 * Le o batch + agrega status de cada job. Resposta:
 * {
 *   batchId, year, month,
 *   jobs: [{ day, date, jobId, status, progress, videoUrl?, error? }],
 *   summary: { queued, running, done, failed, total }
 * }
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const batchId = url.searchParams.get("batchId")?.trim();
  if (!batchId) {
    return NextResponse.json({ erro: "batchId em falta" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  // Le batch
  const batchRes = await fetch(
    `${supabaseUrl}/storage/v1/object/public/course-assets/vc-sabia-batches/${batchId}.json`,
    { cache: "no-store" }
  );
  if (!batchRes.ok) {
    return NextResponse.json({ erro: "Batch nao encontrado" }, { status: 404 });
  }
  const batch = await batchRes.json();

  // Le todos os result.jsons em paralelo
  const results = await Promise.all(
    (batch.jobs || []).map(async (j: { day: number; date: string; jobId: string; phraseText?: string; phraseId?: string; phraseTheme?: string; motionName?: string; audioUrl?: string | null }) => {
      try {
        const r = await fetch(
          `${supabaseUrl}/storage/v1/object/public/course-assets/render-jobs/${j.jobId}-result.json`,
          { cache: "no-store" }
        );
        if (!r.ok) return { ...j, status: "missing", progress: 0 };
        const result = await r.json();
        return {
          day: j.day,
          date: j.date,
          jobId: j.jobId,
          phraseTheme: j.phraseTheme,
          phraseId: j.phraseId,
          phraseText: j.phraseText,
          motionName: j.motionName,
          audioUrl: j.audioUrl,
          status: result.status || "unknown",
          progress: result.progress ?? 0,
          videoUrl: result.videoUrl ?? null,
          error: result.error ?? null,
          message: result.message ?? null,
        };
      } catch {
        return { ...j, status: "error", progress: 0 };
      }
    })
  );

  const summary = {
    total: results.length,
    queued: results.filter((r) => r.status === "queued").length,
    running: results.filter((r) => r.status === "running").length,
    done: results.filter((r) => r.status === "done").length,
    failed: results.filter((r) => r.status === "failed").length,
    missing: results.filter((r) => r.status === "missing").length,
  };

  return NextResponse.json({
    batchId,
    year: batch.year,
    month: batch.month,
    createdAt: batch.createdAt,
    jobs: results,
    summary,
  });
}
