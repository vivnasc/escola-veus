import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

/**
 * GET /api/admin/hoje-em-mim/render-status?jobId=<id>
 *
 * Agrega:
 *  - course-assets/render-jobs/<jobId>.json (manifest com items + captions)
 *  - course-assets/render-jobs/<jobId>-result.json (metadata inicial)
 *  - course-assets/render-jobs/<jobId>-items/<dayIndex>.json (1 por runner)
 *
 * Devolve um snapshot consolidado para a UI fazer polling.
 */
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ erro: "jobId obrigatório" }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    return NextResponse.json(
      { erro: "NEXT_PUBLIC_SUPABASE_URL não configurada" },
      { status: 500 }
    );
  }

  // Manifest é a fonte de verdade dos items (com captions já pré-computadas).
  const manifestUrl = `${base}/storage/v1/object/public/course-assets/render-jobs/${encodeURIComponent(
    jobId
  )}.json?t=${Date.now()}`;
  const manifestRes = await fetch(manifestUrl, { cache: "no-store" });
  if (manifestRes.status === 404) {
    return NextResponse.json({ status: "not_found", jobId }, { status: 404 });
  }
  if (!manifestRes.ok) {
    return NextResponse.json({ erro: `manifest HTTP ${manifestRes.status}` }, { status: 502 });
  }
  type ManifestItem = {
    dayIndex: number;
    date: string;
    dia: string;
    fraseId: string;
    fraseTexto: string;
    motionUrl: string;
    audioUrl: string | null;
    durationSec: number;
    captions: { instagram: string; tiktok: string; whatsapp: string };
  };
  type ManifestShape = {
    jobId: string;
    ano?: number;
    mes?: number;
    mesLabel?: string;
    diaInicio?: number;
    diaFim?: number;
    startDate?: string;
    numDays?: number;
    durationSec?: number;
    items: ManifestItem[];
  };
  const manifest = (await manifestRes.json()) as ManifestShape;

  // Resultado inicial (metadata: status queued/failed; ou completedAt). Best
  // effort, pode não existir.
  type ResultMeta = {
    status?: "queued" | "rendering" | "done" | "failed";
    error?: string;
    failedAt?: string;
    completedAt?: string;
  };
  let resultMeta: ResultMeta = {};
  try {
    const rUrl = `${base}/storage/v1/object/public/course-assets/render-jobs/${encodeURIComponent(
      jobId
    )}-result.json?t=${Date.now()}`;
    const rRes = await fetch(rUrl, { cache: "no-store" });
    if (rRes.ok) resultMeta = await rRes.json();
  } catch {
    /* tudo bem, vamos pelo manifest */
  }

  // Lista per-item files
  const admin = createSupabaseAdminClient();
  let perItemResults: Record<number, unknown> = {};
  if (admin) {
    const { data: files } = await admin.storage
      .from("course-assets")
      .list(`render-jobs/${jobId}-items`, { limit: 500 });

    if (files && files.length > 0) {
      const reads = await Promise.all(
        files
          .filter((f) => f.name?.endsWith(".json"))
          .map(async (f) => {
            const url = `${base}/storage/v1/object/public/course-assets/render-jobs/${encodeURIComponent(
              jobId
            )}-items/${encodeURIComponent(f.name)}?t=${Date.now()}`;
            try {
              const r = await fetch(url, { cache: "no-store" });
              if (!r.ok) return null;
              return (await r.json()) as { dayIndex: number };
            } catch {
              return null;
            }
          })
      );
      for (const item of reads) {
        if (item && typeof item.dayIndex === "number") {
          perItemResults[item.dayIndex] = item;
        }
      }
    }
  }

  // Constrói videos[] combinando manifest items + per-item results
  type FinalVideo = {
    dayIndex: number;
    date: string;
    dia: string;
    fraseId: string;
    fraseTexto: string;
    file: string | null;
    url: string | null;
    sizeBytes?: number;
    error?: string;
    captions: { instagram: string; tiktok: string; whatsapp: string };
  };
  type PerItem = {
    dayIndex: number;
    status?: string;
    file?: string;
    url?: string;
    sizeBytes?: number;
    error?: string;
  };

  const videos: FinalVideo[] = manifest.items.map((it) => {
    const r = perItemResults[it.dayIndex] as PerItem | undefined;
    if (r) {
      return {
        dayIndex: it.dayIndex,
        date: it.date,
        dia: it.dia,
        fraseId: it.fraseId,
        fraseTexto: it.fraseTexto,
        file: r.file ?? null,
        url: r.url ?? null,
        sizeBytes: r.sizeBytes,
        error: r.error,
        captions: it.captions,
      };
    }
    return {
      dayIndex: it.dayIndex,
      date: it.date,
      dia: it.dia,
      fraseId: it.fraseId,
      fraseTexto: it.fraseTexto,
      file: null,
      url: null,
      captions: it.captions,
    };
  });

  const done = videos.filter((v) => v.url || v.error).length;
  const total = videos.length;
  let status: "queued" | "rendering" | "done" | "failed" = "queued";
  if (resultMeta.status === "failed") status = "failed";
  else if (done === total && total > 0) status = "done";
  else if (done > 0) status = "rendering";
  else status = "queued";

  return NextResponse.json(
    {
      jobId,
      status,
      progress: done,
      total,
      videos,
      ano: manifest.ano,
      mes: manifest.mes,
      mesLabel: manifest.mesLabel,
      diaInicio: manifest.diaInicio,
      diaFim: manifest.diaFim,
      startDate: manifest.startDate,
      numDays: manifest.numDays,
      error: resultMeta.error,
      completedAt: resultMeta.completedAt,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
