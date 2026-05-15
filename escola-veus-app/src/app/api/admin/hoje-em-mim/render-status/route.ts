import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

/**
 * GET /api/admin/hoje-em-mim/render-status?jobId=<id>
 *
 * Lê course-assets/render-jobs/<jobId>-result.json (público no Supabase).
 * O workflow render-hoje-em-mim.yml actualiza este ficheiro
 * (queued → rendering → done | failed) e a UI faz polling.
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

  const url = `${base}/storage/v1/object/public/course-assets/render-jobs/${encodeURIComponent(
    jobId
  )}-result.json?t=${Date.now()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) {
    return NextResponse.json({ status: "not_found", jobId }, { status: 404 });
  }
  if (!res.ok) {
    return NextResponse.json({ erro: `HTTP ${res.status}` }, { status: 502 });
  }

  try {
    const data = await res.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ erro: "result não é JSON válido" }, { status: 502 });
  }
}
