import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

/**
 * GET /api/admin/biblioteca/list?folder=youtube/clips&limit=100
 *
 * Lista ficheiros do bucket course-assets numa pasta dada.
 * Retorna nome, tamanho, mtime e URL pública.
 */
export async function GET(req: NextRequest) {
  const folder = req.nextUrl.searchParams.get("folder") ?? "";
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "200");

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 400 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.storage
    .from("course-assets")
    .list(folder, { limit, sortBy: { column: "created_at", order: "desc" } });

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  const files = (data ?? [])
    .filter((f) => f.name && !f.name.startsWith("."))
    .map((f) => ({
      name: f.name,
      size: f.metadata?.size ?? null,
      created_at: f.created_at,
      url: `${supabaseUrl}/storage/v1/object/public/course-assets/${folder ? folder + "/" : ""}${f.name}`,
    }));

  return NextResponse.json({ folder, count: files.length, files });
}
