import { NextRequest, NextResponse } from "next/server";

import { loadMoodsData, patchTrackMood } from "@/lib/weekly-social/moods-storage";
import {
  LORANNE_MOODS,
  type LoranneMood,
} from "@/data/weekly-social/loranne-moods";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/loranne-moods
 * → devolve { version, tracks: {key: {moods, confidence, reason, updatedAt, source}} }
 *
 * PATCH /api/admin/loranne-moods
 * Body: { trackKey: "albumSlug/N", moods: ["elevar", ...], reason?: string }
 * → actualiza um track e grava em Supabase. source = "manual".
 */

export async function GET() {
  const data = await loadMoodsData();
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      trackKey?: string;
      moods?: string[];
      reason?: string;
    };
    if (!body.trackKey) {
      return NextResponse.json({ erro: "trackKey obrigatório." }, { status: 400 });
    }
    if (!Array.isArray(body.moods) || body.moods.length === 0 || body.moods.length > 2) {
      return NextResponse.json({ erro: "moods (1-2) obrigatório." }, { status: 400 });
    }
    const valid = body.moods.filter((m): m is LoranneMood =>
      (LORANNE_MOODS as readonly string[]).includes(m),
    );
    if (valid.length !== body.moods.length) {
      return NextResponse.json({ erro: `mood inválido. Aceitos: ${LORANNE_MOODS.join(", ")}` }, { status: 400 });
    }

    const data = await patchTrackMood(body.trackKey, {
      moods: valid,
      reason: body.reason || "Editado manualmente.",
      source: "manual",
    });
    return NextResponse.json({ ok: true, track: data.tracks[body.trackKey] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
