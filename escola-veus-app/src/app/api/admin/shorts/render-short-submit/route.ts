import { NextRequest, NextResponse } from "next/server";
import { runRenderShortSubmit } from "@/lib/shorts/render-short-core";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/shorts/render-short-submit
 *
 * Dispatcha o workflow `render-short.yml` em GitHub Actions para renderizar
 * um short vertical 30s. Mesmo padrão do Ancient Ground — manifest em
 * Supabase, polling via /render-short-status.
 *
 * Body: {
 *   title?, slug?,
 *   clips: string[3],
 *   clipDuration?, musicUrl, musicVolume?,
 *   overlayPngs?: [dataURL, dataURL],
 *   overlayStart?, overlayEnd?,
 *   thumbnailUrl?, seo?
 * }
 * Returns: { jobId }
 *
 * Lógica core em src/lib/shorts/render-short-core.ts.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json(await runRenderShortSubmit(body || {}));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = /obrigatorio|valido/.test(msg) ? 400
      : /GitHub dispatch/.test(msg) ? 502
      : 500;
    return NextResponse.json({ erro: msg }, { status });
  }
}
