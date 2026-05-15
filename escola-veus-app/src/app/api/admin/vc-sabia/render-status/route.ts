import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;
export const runtime = "nodejs";

/**
 * GET /api/admin/vc-sabia/render-status?jobId=X
 *
 * Le course-assets/render-jobs/<jobId>-result.json.
 * UI usa para polling.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId")?.trim();
  if (!jobId) {
    return NextResponse.json({ erro: "jobId em falta" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  const resultUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/render-jobs/${jobId}-result.json`;
  const res = await fetch(resultUrl, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json(
      { erro: `Result nao encontrado: ${res.status}` },
      { status: 404 }
    );
  }
  const data = await res.json();
  return NextResponse.json(data);
}
