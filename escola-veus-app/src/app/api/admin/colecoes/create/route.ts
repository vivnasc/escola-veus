import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { gerarColecaoComClaude } from "@/lib/carousel-generate";
import { slugify, romanFor, type Dia } from "@/lib/carousel-types";

/**
 * Carrega nomes de dia (veu) das ÚLTIMAS N coleções (não de todas — nomes
 * podem ser reutilizados depois de ~1 mês). Evita repetir da semana anterior
 * sem esgotar o vocabulário.
 */
async function loadUsedDayNames(admin: SupabaseClient, recentCount = 4): Promise<string[]> {
  try {
    const { data } = await admin
      .from("carousel_collections")
      .select("dias")
      .order("created_at", { ascending: false })
      .limit(recentCount);
    if (!data) return [];
    const names = new Set<string>();
    for (const row of data) {
      const dias = row.dias as Dia[] | null;
      if (!Array.isArray(dias)) continue;
      for (const d of dias) {
        if (d.veu) names.add(d.veu.toUpperCase().trim());
      }
    }
    return [...names].sort();
  } catch {
    return [];
  }
}

const BRIEF_FALLBACK =
  "Série temática contemplativa na voz de Os Sete Véus (Vivianne dos Santos). Tom íntimo e calmo, autoridade sem performance. Em cada dia, escolhe uma palavra-tema que destile uma ideia central; mistura prosa curta com momentos poéticos.";

function blankDias(n: number): Dia[] {
  const arr: Dia[] = [];
  for (let i = 1; i <= n; i++) {
    arr.push({
      numero: i,
      veu: `DIA ${i}`,
      subtitulo: "Subtítulo do dia (clica ✏ para editar)",
      romano: romanFor(i, n),
      slides: [
        { tipo: "capa", linha1: "Linha 1 da capa.", linha2: "Linha 2 da capa." },
        { tipo: "conteudo", estilo: "poetico", texto: "Slide poético.\nUma frase por linha." },
        { tipo: "conteudo", estilo: "prosa", texto: "Slide de prosa. Escreve o que quiseres." },
        { tipo: "conteudo", estilo: "poetico", texto: "Outro slide poético." },
        { tipo: "conteudo", estilo: "prosa", titulo: "HÁBITO DA ESTAÇÃO", texto: "Convite a uma prática." },
        { tipo: "cta", icone: "🌀", recurso: "Os Sete Véus", descricao: "Descrição curta.", url: "seteveus.space" },
      ],
    });
  }
  return arr;
}

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

  let body: { title?: string; brief?: string; numDias?: number; skipClaude?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const title = (body.title || "").trim();
  const brief = (body.brief || "").trim();
  const numDias = Math.max(1, Math.min(12, Number(body.numDias) || 7));
  const skipClaude = !!body.skipClaude;

  if (!title) {
    return NextResponse.json({ erro: "title obrigatório" }, { status: 400 });
  }
  // brief é opcional; se vazio e for para usar Claude, usa fallback genérico
  const briefEffective = brief || (skipClaude ? "" : BRIEF_FALLBACK);

  // Owner
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const ownerId = user?.id ?? null;

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ erro: "Supabase admin indisponível" }, { status: 500 });
  }

  // Gera com Claude OU cria vazio
  let generated: { dias: Dia[]; usage: unknown };
  if (skipClaude) {
    generated = { dias: blankDias(numDias), usage: null };
  } else {
    const usedNames = await loadUsedDayNames(admin);
    console.log(`[carousel-create] ${usedNames.length} nomes proibidos carregados:`, usedNames.slice(0, 20).join(", "));
    try {
      generated = await gerarColecaoComClaude({ apiKey, title, brief: briefEffective, numDias, usedNames });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ erro: `Claude falhou: ${msg}` }, { status: 502 });
    }
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
      brief: brief || "",
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
