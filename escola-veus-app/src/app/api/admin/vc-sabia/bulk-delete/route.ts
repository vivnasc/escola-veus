import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/bulk-delete
 *
 * Apaga um batch: a metadata + todos os manifests/results/MP4s/ZIPs
 * associados ao jobId pattern. Util quando se gera multiplos planos
 * por engano e so se quer manter um.
 *
 * Body: { batchId }
 * Returns: { ok, deleted: string[] }
 */
export async function POST(req: NextRequest) {
  let body: { batchId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }
  const batchId = body.batchId?.trim();
  if (!batchId) {
    return NextResponse.json({ erro: "batchId em falta" }, { status: 400 });
  }
  if (!/^vc-sabia-/.test(batchId)) {
    return NextResponse.json(
      { erro: "batchId tem de comecar por vc-sabia-" },
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

  const deleted: string[] = [];
  const errors: string[] = [];

  // 1) Listar render-jobs/ procurando ficheiros que comecam por batchId
  const { data: jobFiles } = await supabase.storage
    .from("course-assets")
    .list("render-jobs", { limit: 1000 });
  const jobPaths =
    jobFiles
      ?.filter((f) => f.name?.startsWith(batchId))
      ?.map((f) => `render-jobs/${f.name}`) ?? [];

  // 2) Listar vc-sabia-renders/ procurando MP4s
  const { data: renderFiles } = await supabase.storage
    .from("course-assets")
    .list("vc-sabia-renders", { limit: 1000 });
  const renderPaths =
    renderFiles
      ?.filter((f) => f.name?.startsWith(batchId))
      ?.map((f) => `vc-sabia-renders/${f.name}`) ?? [];

  // 3) Batch metadata + package ZIP
  const metaPaths = [
    `vc-sabia-batches/${batchId}.json`,
    `vc-sabia-packages/${batchId}.zip`,
  ];

  const allPaths = [...jobPaths, ...renderPaths, ...metaPaths];
  if (allPaths.length === 0) {
    return NextResponse.json({ erro: "Batch nao encontrado" }, { status: 404 });
  }

  // Supabase remove() aceita batch de paths
  const { data: removed, error } = await supabase.storage
    .from("course-assets")
    .remove(allPaths);

  if (error) {
    errors.push(error.message);
  } else if (removed) {
    for (const r of removed) deleted.push(r.name);
  }

  return NextResponse.json({
    ok: errors.length === 0,
    deleted: deleted.length,
    errors,
    paths: allPaths,
  });
}
