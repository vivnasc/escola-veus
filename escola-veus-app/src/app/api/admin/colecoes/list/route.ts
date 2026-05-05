import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ erro: "Supabase admin client indisponível" }, { status: 500 });
  }
  const { data, error } = await admin
    .from("carousel_collections")
    .select("id, slug, title, brief, created_at, updated_at, dias")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

  // não devolvemos o jsonb completo na lista — só o número de dias
  const items = (data || []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    brief: row.brief,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    numDias: Array.isArray(row.dias) ? row.dias.length : 0,
  }));

  return NextResponse.json({ items });
}
