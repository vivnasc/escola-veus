import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

/**
 * GET /api/admin/hoje-em-mim/images
 *
 * Lista imagens MJ guardadas em course-assets/hoje-em-mim-images/.
 * Mais recentes em cima.
 *
 * Returns: { images: Array<{ name, url, sizeBytes, createdAt }> }
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

  const { data, error } = await supabase.storage
    .from("course-assets")
    .list("hoje-em-mim-images", {
      limit: 200,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  const images = (data || [])
    .filter((f) => f.name && /\.(png|jpe?g|webp)$/i.test(f.name))
    .map((f) => ({
      name: f.name,
      url: `${supabaseUrl}/storage/v1/object/public/course-assets/hoje-em-mim-images/${f.name}`,
      sizeBytes: f.metadata?.size ?? 0,
      createdAt: f.created_at ?? null,
    }));

  return NextResponse.json({ images });
}
