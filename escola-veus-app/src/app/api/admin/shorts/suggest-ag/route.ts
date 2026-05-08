import { NextRequest, NextResponse } from "next/server";
import { runSuggestAG, type SuggestAGInput } from "@/lib/shorts/suggest-ag-core";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/shorts/suggest-ag
 *
 * Sugere versos para overlays Ancient Ground + captions TikTok/YouTube,
 * alinhados com a filosofia AG (centralidade africana, elementos como
 * sujeitos, ubuntu) e os TEMAS RAÍZES dos clips escolhidos.
 *
 * Body: { temas: string[], trackNumber?: number }
 *
 * Lógica core em src/lib/shorts/suggest-ag-core.ts.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SuggestAGInput;
    return NextResponse.json(await runSuggestAG(body));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = /obrigatório|reconhecido/.test(msg) ? 400
      : /ANTHROPIC_API_KEY/.test(msg) ? 500
      : 500;
    return NextResponse.json({ erro: msg }, { status });
  }
}
