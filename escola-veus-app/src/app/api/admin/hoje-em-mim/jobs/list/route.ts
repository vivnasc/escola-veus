import { NextResponse } from "next/server";

export const maxDuration = 15;
export const runtime = "nodejs";

/**
 * GET /api/admin/hoje-em-mim/jobs/list
 *
 * Lista os render jobs anteriores deste produto, lendo
 * course-assets/render-jobs/<jobId>.json (manifests).
 * A UI usa para mostrar uma library de pacotes já produzidos com
 * destaque para o dia de hoje, ready a descarregar e postar manual.
 *
 * Returns: {
 *   jobs: Array<{
 *     jobId,
 *     ano, mes,
 *     diaInicio, diaFim,
 *     startDate,
 *     numDays,
 *     createdAt,        // ISO
 *     completedCount,   // dias com MP4
 *     items: Array<{ dayIndex, date, dia, fraseTexto, url|null }>
 *   }>
 * }
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.storage
    .from("course-assets")
    .list("render-jobs", {
      limit: 200,
      sortBy: { column: "created_at", order: "desc" },
    });
  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  // Só manifests <jobId>.json — não os *-result.json
  const manifests = (data || []).filter(
    (f) => f.name?.startsWith("hoje-em-mim-") && f.name.endsWith(".json") && !f.name.endsWith("-result.json")
  );

  type JobItem = {
    dayIndex: number;
    date: string;
    dia: string;
    fraseTexto?: string;
    url: string | null;
  };
  type Job = {
    jobId: string;
    ano?: number;
    mes?: number;
    diaInicio?: number;
    diaFim?: number;
    startDate?: string;
    numDays?: number;
    createdAt?: string;
    completedCount: number;
    items: JobItem[];
  };

  const jobs: Job[] = [];

  for (const f of manifests) {
    try {
      const jobId = f.name.replace(/\.json$/, "");
      // Carrega manifest
      const mUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/render-jobs/${encodeURIComponent(f.name)}`;
      const mRes = await fetch(mUrl, { cache: "no-store" });
      if (!mRes.ok) continue;
      const manifest = await mRes.json();
      const items: JobItem[] = [];
      if (Array.isArray(manifest.items)) {
        // Lista os per-item files para saber quais MP4 já existem
        const { data: perFiles } = await supabase.storage
          .from("course-assets")
          .list(`render-jobs/${jobId}-items`, { limit: 500 });
        const byIdx = new Map<number, { url: string | null }>();
        for (const pf of perFiles || []) {
          if (!pf.name?.endsWith(".json")) continue;
          const m = pf.name.match(/^(\d+)\.json$/);
          if (!m) continue;
          const idx = Number(m[1]);
          try {
            const r = await fetch(
              `${supabaseUrl}/storage/v1/object/public/course-assets/render-jobs/${jobId}-items/${pf.name}`,
              { cache: "no-store" }
            );
            if (r.ok) {
              const j = await r.json();
              byIdx.set(idx, { url: j.url ?? null });
            }
          } catch {
            /* ignore */
          }
        }
        for (const it of manifest.items as Array<{
          dayIndex: number;
          date: string;
          dia: string;
          fraseTexto?: string;
        }>) {
          items.push({
            dayIndex: it.dayIndex,
            date: it.date,
            dia: it.dia,
            fraseTexto: it.fraseTexto,
            url: byIdx.get(it.dayIndex)?.url ?? null,
          });
        }
      }
      jobs.push({
        jobId,
        ano: manifest.ano,
        mes: manifest.mes,
        diaInicio: manifest.diaInicio,
        diaFim: manifest.diaFim,
        startDate: manifest.startDate,
        numDays: manifest.numDays,
        createdAt: manifest.createdAt ?? f.created_at ?? undefined,
        completedCount: items.filter((i) => i.url).length,
        items,
      });
    } catch {
      /* skip */
    }
  }

  return NextResponse.json({ jobs });
}
