import { NextResponse } from "next/server";

export const maxDuration = 15;
export const runtime = "nodejs";

/**
 * GET /api/admin/vc-sabia/bulk-list
 *
 * Lista todos os batches em course-assets/vc-sabia-batches/.
 * UI usa para mostrar bulks anteriores e poder voltar a um.
 *
 * Returns: { batches: Array<{ batchId, year, month, startDay, endDay,
 *                              createdAt, jobs }> }
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
    .list("vc-sabia-batches", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });
  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  const files = (data || []).filter((f) => f.name?.endsWith(".json"));
  const batches: Array<{
    batchId: string;
    year?: number;
    month?: number;
    startDay?: number;
    endDay?: number;
    createdAt?: string;
    jobs?: number;
  }> = [];

  for (const f of files) {
    try {
      const r = await fetch(
        `${supabaseUrl}/storage/v1/object/public/course-assets/vc-sabia-batches/${f.name}`,
        { cache: "no-store" }
      );
      if (!r.ok) continue;
      const b = await r.json();
      batches.push({
        batchId: b.batchId || f.name.replace(/\.json$/, ""),
        year: b.year,
        month: b.month,
        startDay: b.startDay,
        endDay: b.endDay,
        createdAt: b.createdAt,
        jobs: Array.isArray(b.jobs) ? b.jobs.length : undefined,
      });
    } catch {
      /* skip corrupted */
    }
  }

  return NextResponse.json({ batches });
}
