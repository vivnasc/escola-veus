import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

/**
 * GET /api/admin/funil/reuse/load?episode=ep11
 *
 * Lê o reuse map de um episódio — lista ordenada de URLs de clips que o user
 * fixou para esse episódio (pode incluir clips de OUTROS episódios reutilizados).
 *
 * Se não existir ficheiro, devolve `{ clipOrder: [], exists: false }` e o
 * /montar cai no filtro default (`nomear-<ep>-*`).
 */

const REUSE_DIR = "admin/funil-reuses";

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest) {
  const episode = new URL(req.url).searchParams.get("episode") || "";
  if (!episode) {
    return NextResponse.json({ erro: "episode obrigatorio" }, { status: 400 });
  }
  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }
  try {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .download(`${REUSE_DIR}/${episode}.json`);
    if (error || !data) {
      return NextResponse.json({ clipOrder: [], exists: false });
    }
    const parsed = JSON.parse(await data.text()) as {
      clipOrder?: string[];
      updatedAt?: string;
    };
    return NextResponse.json({
      clipOrder: parsed.clipOrder ?? [],
      updatedAt: parsed.updatedAt ?? null,
      exists: true,
    });
  } catch {
    return NextResponse.json({ clipOrder: [], exists: false });
  }
}
