import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

/**
 * POST /api/admin/funil/reuse/save
 *
 * Persiste o reuse map de um episódio.
 *
 * Body: { episode: string, clipOrder: string[] }
 *
 * Guardar um array vazio apaga o ficheiro (volta ao default auto-filtered).
 */

const REUSE_DIR = "admin/funil-reuses";

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  let body: { episode?: string; clipOrder?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON invalido" }, { status: 400 });
  }
  const episode = body.episode;
  const clipOrder = body.clipOrder;
  if (!episode || !Array.isArray(clipOrder)) {
    return NextResponse.json(
      { erro: "episode (string) e clipOrder (string[]) obrigatorios" },
      { status: 400 },
    );
  }
  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  const filepath = `${REUSE_DIR}/${episode}.json`;

  // Array vazio → apagar o ficheiro (volta ao default)
  if (clipOrder.length === 0) {
    await supabase.storage.from("course-assets").remove([filepath]);
    return NextResponse.json({ ok: true, cleared: true });
  }

  const json = JSON.stringify(
    {
      episode,
      clipOrder,
      updatedAt: new Date().toISOString(),
    },
    null,
    2,
  );
  const { error } = await supabase.storage
    .from("course-assets")
    .upload(filepath, json, { contentType: "application/json", upsert: true });
  if (error) {
    return NextResponse.json({ erro: `Upload: ${error.message}` }, { status: 500 });
  }
  return NextResponse.json({ ok: true, count: clipOrder.length });
}
