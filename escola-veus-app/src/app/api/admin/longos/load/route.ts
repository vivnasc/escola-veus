import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/longos/load?slug=<slug>
 *
 * Carrega um projecto long-form completo de Supabase.
 */

const DIR = "admin/longos";

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug") || "";
  if (!slug) {
    return NextResponse.json({ erro: "slug obrigatório" }, { status: 400 });
  }
  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }
  try {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .download(`${DIR}/${slug}.json`);
    if (error || !data) {
      return NextResponse.json({ erro: "Projecto não encontrado" }, { status: 404 });
    }
    const parsed = JSON.parse(await data.text());
    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
