import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const runtime = "nodejs";

/**
 * POST /api/admin/hoje-em-mim/jobs/delete
 *
 * Apaga um job do histórico — manifest + result + todos os per-item
 * results em course-assets/render-jobs/. Por defeito mantém os MP4
 * finais em course-assets/hoje-em-mim-renders/ (o path não inclui
 * jobId, pelo que podem ser partilhados com renders futuros do mesmo
 * dia/fraseId). Passa includeMp4s:true para os apagar também.
 *
 * Body: { jobId: string, includeMp4s?: boolean }
 * Returns: { deleted: number, paths: string[] }
 */
export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  let body: { jobId?: string; includeMp4s?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }
  const jobId = (body.jobId || "").trim();
  if (!jobId || !/^[a-zA-Z0-9._-]+$/.test(jobId)) {
    return NextResponse.json({ erro: "jobId inválido" }, { status: 400 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const toDelete: string[] = [
    `render-jobs/${jobId}.json`,
    `render-jobs/${jobId}-result.json`,
  ];

  // Per-item results
  const { data: perItems } = await supabase.storage
    .from("course-assets")
    .list(`render-jobs/${jobId}-items`, { limit: 500 });
  if (perItems) {
    for (const f of perItems) {
      if (f.name) toDelete.push(`render-jobs/${jobId}-items/${f.name}`);
    }
  }

  // MP4s opcional: derivados de cada per-item result.url
  if (body.includeMp4s && perItems) {
    for (const f of perItems) {
      if (!f.name?.endsWith(".json")) continue;
      try {
        const r = await fetch(
          `${supabaseUrl}/storage/v1/object/public/course-assets/render-jobs/${jobId}-items/${f.name}`,
          { cache: "no-store" }
        );
        if (!r.ok) continue;
        const j = await r.json();
        if (typeof j.url === "string") {
          const m = j.url.match(/course-assets\/(hoje-em-mim-renders\/[^?]+)/);
          if (m) toDelete.push(m[1]);
        }
      } catch {
        /* ignore */
      }
    }
  }

  if (toDelete.length === 0) {
    return NextResponse.json({ deleted: 0, paths: [] });
  }
  const { error } = await supabase.storage
    .from("course-assets")
    .remove(toDelete);
  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }
  return NextResponse.json({ deleted: toDelete.length, paths: toDelete });
}
