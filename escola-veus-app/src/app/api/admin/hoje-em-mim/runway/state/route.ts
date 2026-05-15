import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

/**
 * GET /api/admin/hoje-em-mim/runway/state
 *
 * Lê o estado actual dos jobs Runway de "Hoje, em Mim" (lista de
 * imagens MJ submetidas, com taskId, clipUrl, erro, etc).
 *
 * Returns: { items: StateItem[], updatedAt }
 */
export async function GET() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    return NextResponse.json(
      { erro: "NEXT_PUBLIC_SUPABASE_URL não configurada" },
      { status: 500 }
    );
  }

  const url = `${base}/storage/v1/object/public/course-assets/admin/hoje-em-mim/runway.json?t=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) {
    return NextResponse.json({ items: [], updatedAt: null });
  }
  if (!res.ok) {
    return NextResponse.json({ erro: `HTTP ${res.status}` }, { status: 502 });
  }
  try {
    const data = await res.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ items: [], updatedAt: null });
  }
}
