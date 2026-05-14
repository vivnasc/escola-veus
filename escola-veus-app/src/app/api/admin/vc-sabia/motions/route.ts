import { NextResponse } from "next/server";

export const maxDuration = 30;

/**
 * GET /api/admin/vc-sabia/motions
 *
 * Lista todos os motions guardados em
 * Supabase Storage: course-assets/vc-sabia-motions/.
 *
 * Returns: { motions: Array<{ name, url, sizeBytes, createdAt }> }
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
    .list("vc-sabia-motions", {
      limit: 200,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  const motions = (data || [])
    .filter((f) => f.name && /\.(mp4|webm|mov)$/i.test(f.name))
    .map((f) => ({
      name: f.name,
      url: `${supabaseUrl}/storage/v1/object/public/course-assets/vc-sabia-motions/${f.name}`,
      sizeBytes: f.metadata?.size ?? 0,
      createdAt: f.created_at ?? null,
    }));

  return NextResponse.json({ motions });
}
