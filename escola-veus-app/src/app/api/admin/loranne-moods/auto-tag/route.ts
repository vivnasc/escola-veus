import { NextResponse } from "next/server";

import { autoTagAllLoranneTracks } from "@/lib/weekly-social/auto-tag-moods";
import { saveMoodsData, loadMoodsData } from "@/lib/weekly-social/moods-storage";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 batches Claude × ~30s = ~2.5min

/**
 * POST /api/admin/loranne-moods/auto-tag
 * Body: { force?: boolean, mergeManual?: boolean (default true) }
 *
 * Corre Claude sobre as 121 tracks Loranne e atribui 1-2 moods cada.
 * mergeManual=true (default): tracks com source="manual" são preservadas
 *   (auto não sobrescreve edições manuais).
 * mergeManual=false: substitui tudo.
 *
 * ~2-3 min, ~$0.10 em tokens (Sonnet 4.6 + cache).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({})) as {
      force?: boolean;
      mergeManual?: boolean;
    };
    const mergeManual = body.mergeManual !== false;

    const fresh = await autoTagAllLoranneTracks();

    if (mergeManual) {
      const existing = await loadMoodsData();
      for (const [k, v] of Object.entries(existing.tracks)) {
        if (v.source === "manual") {
          fresh.tracks[k] = v;
        }
      }
    }

    await saveMoodsData(fresh);

    const counts: Record<string, number> = {};
    for (const a of Object.values(fresh.tracks)) {
      const primary = a.moods[0];
      if (primary) counts[primary] = (counts[primary] || 0) + 1;
    }

    return NextResponse.json({
      ok: true,
      total: Object.keys(fresh.tracks).length,
      counts,
      lastAutoTagAt: fresh.lastAutoTagAt,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
