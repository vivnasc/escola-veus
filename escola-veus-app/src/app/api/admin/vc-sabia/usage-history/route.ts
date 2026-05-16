import { NextResponse } from "next/server";

import { loadUsageHistory } from "@/lib/vc-sabia/usage-history";

export const maxDuration = 30;
export const runtime = "nodejs";

/**
 * GET /api/admin/vc-sabia/usage-history
 *
 * Devolve sets serializados de phraseIds e motionNames ja usados em
 * batches anteriores. UI usa para filtrar motion swap picker (so mostra
 * nao-usados), highlight phrases no PhrasesPanel, etc.
 *
 * Returns: { usedPhraseIds: string[], usedMotionNames: string[], batchCount }
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  const history = await loadUsageHistory(supabaseUrl, serviceKey);
  return NextResponse.json({
    usedPhraseIds: Array.from(history.usedPhraseIds),
    usedMotionNames: Array.from(history.usedMotionNames),
    batchCount: history.batchCount,
  });
}
