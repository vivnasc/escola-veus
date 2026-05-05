import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase-server";
import { gerarColecaoComClaude } from "@/lib/carousel-generate";
import { slugify } from "@/lib/carousel-types";

export const dynamic = "force-dynamic";
// 5 min — gerar 7×6 slides via Claude leva 30-90s normalmente
export const maxDuration = 300;

/**
 * POST /api/admin/colecoes/create
 * Body: { title: string, brief: string, numDias?: number }
 * Calls Claude to generate the dias[] structure, persists in Supabase.
 * Returns: { id, slug }
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });
  }

  let body: { title?: string; brief?: string; numDias?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const title = (body.title || "").trim();
  const brief = (body.brief || "").trim();
  const numDias = Math.max(1, Math.min(12, Number(body.numDias) || 7));

  if (!title || !brief) {
    return NextResponse.json(
      { erro: "title e brief obrigatórios" },
      { status: 400 }
    );
  }

  // Owner
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const ownerId = user?.id ?? null;

  // Gera com Claude
  let generated;
  try {
    generated = await gerarColecaoComClaude({ apiKey, title, brief, numDias });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: `Claude falhou: ${msg}` }, { status: 502 });
  }

  // Persiste em Supabase
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ erro: "Supabase admin indisponível" }, { status: 500 });
  }

  // slug único: se houver colisão, anexa sufixo curto
  const baseSlug = slugify(title);
  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await admin
      .from("carousel_collections")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data: row, error } = await admin
    .from("carousel_collections")
    .insert({
      slug,
      title,
      brief,
      dias: generated.dias,
      theme: {},
      owner_id: ownerId,
    })
    .select("id, slug")
    .single();

  if (error || !row) {
    return NextResponse.json(
      { erro: `Insert falhou: ${error?.message ?? "sem dados"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: row.id,
    slug: row.slug,
    usage: generated.usage,
  });
}
