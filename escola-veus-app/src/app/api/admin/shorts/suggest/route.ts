import { NextRequest, NextResponse } from "next/server";
import { runSuggest } from "@/lib/shorts/suggest-core";

/**
 * POST /api/admin/shorts/suggest
 *
 * Dado o album Loranne + faixa, carrega letras do repo `loranne-lyrics/`,
 * extrai as frases mais fortes como candidatas a overlay, e gera legendas
 * para TikTok/YouTube (sem auto-promo).
 *
 * Body (preferido): {
 *   albumSlug: string,       // ex "eter-raiz-vermelha"
 *   trackNumber?: number,    // ex 8
 *   trackName?: string,      // alternativa — ex "faixa-08.mp3"
 *   theme?: string,
 * }
 * Fallback legacy: {
 *   lyrics: string, theme?: string, trackLabel?: string
 * }
 *
 * Returns: {
 *   verses: [string, string],       // 2 frases por defeito (as 2 mais fortes)
 *   candidates: string[],           // ate 6 frases candidatas (incluindo as 2)
 *   albumTitle, trackTitle, trackNumber,
 *   tiktokCaption, youtubeTitle, youtubeDescription
 * }
 *
 * Lógica core em src/lib/shorts/suggest-core.ts (chamável por outras rotas
 * como /api/admin/weekly/plan sem fetch interno).
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json(runSuggest(body || {}));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = /Nao encontrei|nao tem letra/.test(msg) ? 404
      : /obrigatorio|valido/.test(msg) ? 400
      : 500;
    return NextResponse.json({ erro: msg }, { status });
  }
}
