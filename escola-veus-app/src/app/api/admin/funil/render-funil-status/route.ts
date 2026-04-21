import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

/**
 * GET /api/admin/funil/render-funil-status?jobId=<id>
 *
 * Lê o ficheiro course-assets/render-jobs/<jobId>-result.json (partilhado com
 * os outros pipelines FFmpeg — Ancient Ground e Shorts — pela estrutura do
 * bucket).
 */
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ erro: "jobId obrigatorio" }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    return NextResponse.json({ erro: "NEXT_PUBLIC_SUPABASE_URL nao configurada" }, { status: 500 });
  }

  const resultUrl = `${base}/storage/v1/object/public/course-assets/render-jobs/${encodeURIComponent(jobId)}-result.json?t=${Date.now()}`;
  const res = await fetch(resultUrl, { cache: "no-store" });

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
    return NextResponse.json({ erro: "result nao e JSON valido" }, { status: 502 });
  }
}
