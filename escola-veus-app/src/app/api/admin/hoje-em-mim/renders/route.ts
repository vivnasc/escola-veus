import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/admin/hoje-em-mim/renders
 *
 * Lista os MP4 já renderizados em course-assets/hoje-em-mim-renders/<dia>/,
 * agrupados por dia da semana, mais recentes em cima.
 *
 * Returns: { rendersByDia: Record<DiaSemana, Array<{ name, url, sizeBytes, createdAt }>> }
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const dias = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
  const rendersByDia: Record<string, unknown> = {};

  for (const dia of dias) {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .list(`hoje-em-mim-renders/${dia}`, {
        limit: 50,
        sortBy: { column: "created_at", order: "desc" },
      });
    if (error) {
      rendersByDia[dia] = [];
      continue;
    }
    rendersByDia[dia] = (data || [])
      .filter((f) => f.name?.endsWith(".mp4"))
      .map((f) => ({
        name: f.name,
        url: `${supabaseUrl}/storage/v1/object/public/course-assets/hoje-em-mim-renders/${dia}/${f.name}`,
        sizeBytes: f.metadata?.size ?? 0,
        createdAt: f.created_at ?? null,
      }));
  }

  return NextResponse.json({ rendersByDia });
}
